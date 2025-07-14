#!/bin/bash
# create-admin.sh - Script automatisé pour créer des admins

set -e

echo "🏥 VITAL SYNC - Création automatisée d'admin"
echo "============================================="

# Configuration
DB_CONTAINER="supabase-db"
APP_CONTAINER="entretien-infirmier-app"
DB_USER="postgres"
DB_NAME="postgres"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier que les containers tournent
check_containers() {
    log_info "Vérification des containers..."
    
    if ! docker ps | grep -q "$DB_CONTAINER"; then
        log_error "Container $DB_CONTAINER non trouvé ou arrêté"
        exit 1
    fi
    
    if ! docker ps | grep -q "$APP_CONTAINER"; then
        log_error "Container $APP_CONTAINER non trouvé ou arrêté"
        exit 1
    fi
    
    log_success "Containers opérationnels"
}

# Saisie sécurisée des informations
get_admin_info() {
    echo ""
    log_info "Saisie des informations admin:"
    
    # Email avec validation
    while true; do
        read -p "📧 Email admin: " ADMIN_EMAIL
        if [[ "$ADMIN_EMAIL" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
            break
        else
            log_error "Format email invalide"
        fi
    done
    
    # Nom
    while true; do
        read -p "👤 Nom complet: " ADMIN_NAME
        if [[ ${#ADMIN_NAME} -ge 2 ]]; then
            break
        else
            log_error "Le nom doit contenir au moins 2 caractères"
        fi
    done
    
    # Mot de passe avec confirmation
    while true; do
        read -s -p "🔒 Mot de passe: " ADMIN_PASSWORD
        echo ""
        read -s -p "🔒 Confirmer le mot de passe: " ADMIN_PASSWORD_CONFIRM
        echo ""
        
        if [[ "$ADMIN_PASSWORD" == "$ADMIN_PASSWORD_CONFIRM" ]]; then
            if [[ ${#ADMIN_PASSWORD} -ge 8 ]]; then
                break
            else
                log_error "Le mot de passe doit contenir au moins 8 caractères"
            fi
        else
            log_error "Les mots de passe ne correspondent pas"
        fi
    done
}

# Vérifier si l'email existe déjà
check_existing_admin() {
    log_info "Vérification de l'email existant..."
    
    local existing=$(docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c \
        "SELECT COUNT(*) FROM auth_users WHERE email = '$ADMIN_EMAIL';")
    
    if [[ $(echo $existing | tr -d ' ') -gt 0 ]]; then
        log_error "Un utilisateur avec cet email existe déjà"
        exit 1
    fi
    
    log_success "Email disponible"
}

# Générer le hash de mot de passe
generate_password_hash() {
    log_info "Génération du hash de mot de passe..."
    
    ADMIN_HASH=$(docker exec $APP_CONTAINER node -e "
        const bcrypt = require('bcryptjs');
        console.log(bcrypt.hashSync('$ADMIN_PASSWORD', 12));
    ")
    
    if [[ -z "$ADMIN_HASH" ]]; then
        log_error "Échec de la génération du hash"
        exit 1
    fi
    
    log_success "Hash généré"
}

# Créer l'admin en base
create_admin_in_db() {
    log_info "Création de l'admin en base de données..."
    
    # Générer UUID
    local user_id=$(docker exec $APP_CONTAINER node -e "
        const crypto = require('crypto');
        console.log(crypto.randomUUID());
    ")
    
    # Créer auth_user
    docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "
        INSERT INTO auth_users (id, email, password, created_at, updated_at) 
        VALUES ('$user_id', '$ADMIN_EMAIL', '$ADMIN_HASH', NOW(), NOW());
    " > /dev/null
    
    # Créer user_profile
    docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "
        INSERT INTO user_profiles (id, user_id, email, name, role, is_active, is_whitelisted, created_at, updated_at)
        VALUES (gen_random_uuid(), '$user_id', '$ADMIN_EMAIL', '$ADMIN_NAME', 'ADMIN', true, true, NOW(), NOW());
    " > /dev/null
    
    log_success "Admin créé en base"
}

# Vérifier la création
verify_creation() {
    log_info "Vérification de la création..."
    
    local admin_count=$(docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c \
        "SELECT COUNT(*) FROM user_profiles WHERE email = '$ADMIN_EMAIL' AND role = 'ADMIN';")
    
    if [[ $(echo $admin_count | tr -d ' ') -eq 1 ]]; then
        log_success "Admin créé avec succès!"
    else
        log_error "Échec de la vérification"
        exit 1
    fi
}

# Afficher le résumé
show_summary() {
    echo ""
    echo "🎉 ==============================================="
    log_success "ADMIN CRÉÉ AVEC SUCCÈS!"
    echo "==============================================="
    echo ""
    echo "📋 Informations de connexion:"
    echo "   Email: $ADMIN_EMAIL"
    echo "   Nom: $ADMIN_NAME"
    echo "   Rôle: Administrateur"
    echo ""
    echo "🌐 Connexion:"
    echo "   URL: https://app.vital-sync.ch/auth/login"
    echo ""
    log_warning "Gardez ces informations en sécurité !"
    echo ""
}

# Fonction principale
main() {
    check_containers
    get_admin_info
    check_existing_admin
    generate_password_hash
    create_admin_in_db
    verify_creation
    show_summary
}

# Gestion des erreurs
trap 'log_error "Script interrompu"; exit 1' INT TERM

# Point d'entrée
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi