-- supabase/migrations/002_auth_system.sql
-- Migration pour système d'authentification complet

-- ============================================
-- ENUMS ET TYPES
-- ============================================

-- Enum pour les rôles utilisateur
CREATE TYPE user_role AS ENUM ('ADMIN', 'INFIRMIER', 'INFIRMIER_CHEF', 'MEDECIN');

-- ============================================
-- TABLES D'AUTHENTIFICATION
-- ============================================

-- Table principale des utilisateurs (remplace le système Supabase Auth)
CREATE TABLE auth_users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Hashé avec bcrypt
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des profils utilisateur
CREATE TABLE user_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT UNIQUE NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT UNIQUE NOT NULL, -- Copie pour faciliter les requêtes
    role user_role DEFAULT 'INFIRMIER',
    is_active BOOLEAN DEFAULT true,
    is_whitelisted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Table des logs d'audit
CREATE TABLE auth_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- TABLES NEXTAUTH.JS (Adaptateur Prisma)
-- ============================================

-- Table des comptes (pour les providers externes, future extension)
CREATE TABLE accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(provider, provider_account_id)
);

-- Table des sessions
CREATE TABLE sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_token TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des tokens de vérification
CREATE TABLE verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- ============================================
-- INDEX POUR PERFORMANCE
-- ============================================

-- Index pour les recherches fréquentes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX idx_auth_logs_user_action ON auth_logs(user_id, action);
CREATE INDEX idx_auth_logs_created_at ON auth_logs(created_at);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires);

-- ============================================
-- RLS (ROW LEVEL SECURITY)
-- ============================================

-- Activer RLS sur toutes les tables sensibles
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

-- Politique : Les admins peuvent tout voir
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = current_setting('app.current_user_id', true) 
            AND up.role = 'ADMIN'
        )
    );

-- Politique : Les utilisateurs peuvent voir leurs propres logs
CREATE POLICY "Users can view own logs" ON auth_logs
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

-- Politique : Les admins peuvent voir tous les logs
CREATE POLICY "Admins can view all logs" ON auth_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = current_setting('app.current_user_id', true) 
            AND up.role = 'ADMIN'
        )
    );

-- ============================================
-- FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_auth_users_updated_at 
    BEFORE UPDATE ON auth_users 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at 
    BEFORE UPDATE ON accounts 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON sessions 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Fonction pour créer un utilisateur avec profil
CREATE OR REPLACE FUNCTION create_user_with_profile(
    user_email TEXT,
    user_password TEXT,
    user_name TEXT DEFAULT NULL,
    user_role user_role DEFAULT 'INFIRMIER',
    is_whitelisted BOOLEAN DEFAULT false
)
RETURNS TEXT AS $$
DECLARE
    new_user_id TEXT;
BEGIN
    -- Créer l'utilisateur
    INSERT INTO auth_users (email, password)
    VALUES (user_email, user_password)
    RETURNING id INTO new_user_id;
    
    -- Créer le profil
    INSERT INTO user_profiles (user_id, email, name, role, is_whitelisted)
    VALUES (new_user_id, user_email, user_name, user_role, is_whitelisted);
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour logger les actions
CREATE OR REPLACE FUNCTION log_user_action(
    user_id TEXT,
    action_name TEXT,
    ip_addr TEXT DEFAULT NULL,
    user_agent_str TEXT DEFAULT NULL,
    is_success BOOLEAN DEFAULT true,
    action_details JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO auth_logs (user_id, action, ip_address, user_agent, success, details)
    VALUES (user_id, action_name, ip_addr, user_agent_str, is_success, action_details);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Création du super admin (à exécuter manuellement)
-- Le mot de passe sera hashé côté application
-- Exemple d'insertion (remplacer par les vraies valeurs) :
/*
SELECT create_user_with_profile(
    'admin@vital-sync.ch',
    '$2a$12$...',  -- Hash du mot de passe
    'Super Admin',
    'ADMIN',
    true
);
*/

-- ============================================
-- VUES UTILITAIRES
-- ============================================

-- Vue pour avoir les infos utilisateur complètes
CREATE VIEW user_details AS
SELECT 
    u.id,
    u.email,
    u.created_at as user_created_at,
    p.name,
    p.role,
    p.is_active,
    p.is_whitelisted,
    p.last_login,
    p.created_at as profile_created_at
FROM auth_users u
LEFT JOIN user_profiles p ON u.id = p.user_id;

-- Vue pour les statistiques de connexion
CREATE VIEW login_stats AS
SELECT 
    DATE(created_at) as login_date,
    COUNT(*) as login_count,
    COUNT(DISTINCT user_id) as unique_users
FROM auth_logs 
WHERE action = 'LOGIN' AND success = true
GROUP BY DATE(created_at)
ORDER BY login_date DESC;

-- ============================================
-- PERMISSIONS
-- ============================================

-- Accorder les permissions nécessaires à l'application
-- (À adapter selon votre configuration Supabase)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;