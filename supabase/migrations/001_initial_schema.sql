-- supabase/migrations/001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des catégories de listes
CREATE TABLE list_categories (
    id SERIAL PRIMARY KEY,
    list_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des éléments de liste
CREATE TABLE list_items (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    category_id INTEGER NOT NULL REFERENCES list_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(category_id, value)
);

CREATE INDEX idx_list_items_category_order ON list_items(category_id, "order");

-- Table des patients
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    civilites TEXT NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    date_naissance TEXT NOT NULL,
    age INTEGER NOT NULL,
    etat_civil TEXT NOT NULL,
    poste TEXT NOT NULL,
    numero_ligne TEXT,
    manager TEXT NOT NULL,
    zone TEXT NOT NULL,
    horaire TEXT,
    contrat TEXT NOT NULL,
    taux_activite TEXT NOT NULL,
    departement TEXT NOT NULL,
    date_entree TEXT NOT NULL,
    anciennete TEXT NOT NULL,
    temps_trajet_aller TEXT NOT NULL,
    temps_trajet_retour TEXT NOT NULL,
    type_transport TEXT NOT NULL,
    numero_entretien INTEGER,
    nom_entretien TEXT,
    date_entretien TEXT,
    heure_debut TEXT,
    heure_fin TEXT,
    duree TEXT,
    type_entretien TEXT,
    consentement TEXT,
    date_creation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des configurations de formulaire
CREATE TABLE form_configurations (
    id SERIAL PRIMARY KEY,
    page_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_form_configurations_page_id ON form_configurations(page_id);

-- Table des sections de formulaire
CREATE TABLE form_sections (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    form_id INTEGER NOT NULL REFERENCES form_configurations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(form_id, name)
);

CREATE INDEX idx_form_sections_form_order ON form_sections(form_id, "order");

-- Table des champs de formulaire
CREATE TABLE form_fields (
    id SERIAL PRIMARY KEY,
    section_id INTEGER NOT NULL REFERENCES form_sections(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT NOT NULL,
    required BOOLEAN DEFAULT false,
    "order" INTEGER NOT NULL,
    list_id TEXT REFERENCES list_categories(list_id),
    default_value TEXT,
    validation TEXT,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(section_id, name)
);

CREATE INDEX idx_form_fields_section_order ON form_fields(section_id, "order");
CREATE INDEX idx_form_fields_list_id ON form_fields(list_id);

-- Table des entretiens
CREATE TABLE entretiens (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    numero_entretien INTEGER NOT NULL,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'brouillon',
    is_template BOOLEAN DEFAULT false,
    base_entretien_id INTEGER,
    donnees_entretien TEXT,
    temps_debut TIMESTAMP WITH TIME ZONE,
    temps_fin TIMESTAMP WITH TIME ZONE,
    temps_pause INTEGER,
    en_pause BOOLEAN DEFAULT false,
    derniere_pause TIMESTAMP WITH TIME ZONE
);

-- Table des types d'événements
CREATE TABLE event_types (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    icon TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des risques professionnels
CREATE TABLE risques_professionnels (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    lien TEXT NOT NULL,
    est_favori BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des événements du calendrier
CREATE TABLE calendar_events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT false,
    event_type_string TEXT,
    status TEXT DEFAULT 'planifie',
    patient_id INTEGER REFERENCES patients(id),
    entretien_id INTEGER REFERENCES entretiens(id) ON DELETE SET NULL,
    metadata TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by TEXT,
    recurrence TEXT,
    parent_event_id INTEGER
);

CREATE INDEX idx_calendar_events_patient_id ON calendar_events(patient_id);
CREATE INDEX idx_calendar_events_entretien_id ON calendar_events(entretien_id);
CREATE INDEX idx_calendar_events_dates ON calendar_events(start_date, end_date);

-- Table de liaison many-to-many entre événements et types d'événements
CREATE TABLE event_type_calendar_event (
    event_type_id INTEGER NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
    calendar_event_id INTEGER NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
    PRIMARY KEY (event_type_id, calendar_event_id)
);

-- Table des profils utilisateurs (pour l'authentification Supabase)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT CHECK (role IN ('ADMIN', 'INFIRMIER', 'INFIRMIER_CHEF', 'MEDECIN')) DEFAULT 'INFIRMIER',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) pour les profils
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent voir leur propre profil
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Politique pour que les admins puissent tout voir
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour exécuter la fonction
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Fonction pour mettre à jour date_modification automatiquement
CREATE OR REPLACE FUNCTION public.handle_date_modification()
RETURNS trigger AS $$
BEGIN
    NEW.date_modification = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour date_modification sur toutes les tables
CREATE TRIGGER handle_date_modification BEFORE UPDATE ON list_categories
    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification();

CREATE TRIGGER handle_date_modification BEFORE UPDATE ON list_items
    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification();

CREATE TRIGGER handle_date_modification BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification();

CREATE TRIGGER handle_date_modification BEFORE UPDATE ON form_configurations
    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification();

CREATE TRIGGER handle_date_modification BEFORE UPDATE ON form_sections
    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification();

CREATE TRIGGER handle_date_modification BEFORE UPDATE ON form_fields
    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification();

CREATE TRIGGER handle_date_modification BEFORE UPDATE ON entretiens
    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification();

CREATE TRIGGER handle_date_modification BEFORE UPDATE ON event_types
    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification();

CREATE TRIGGER handle_date_modification BEFORE UPDATE ON risques_professionnels
    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification();

CREATE TRIGGER handle_date_modification BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification();

CREATE TRIGGER handle_date_modification BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification();