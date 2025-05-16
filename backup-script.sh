#!/bin/bash
# Script de sauvegarde automatique pour la base de données PostgreSQL
# À stocker dans ./scripts/backup.sh

set -e

# Variables d'environnement (surchargées par celles du conteneur)
DB_HOST=${POSTGRES_HOST:-db}
DB_PORT=${POSTGRES_PORT:-5433}
DB_USER=${POSTGRES_USER:-postgres}
DB_PASSWORD=${POSTGRES_PASSWORD:-postgres}
DB_NAME=${POSTGRES_DB:-entretiendb}
BACKUP_DIR=${BACKUP_DIR:-/backups}
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}
ENCRYPTION_KEY=${BACKUP_ENCRYPTION_KEY:-default_key_change_me}

# Création du répertoire de sauvegarde si nécessaire
mkdir -p "${BACKUP_DIR}"

# Date pour le nom du fichier
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"
ENCRYPTED_FILE="${BACKUP_FILE}.enc"

# Log de début de sauvegarde
echo "$(date) - Début de la sauvegarde de ${DB_NAME} sur ${DB_HOST}:${DB_PORT}"

# Création de la sauvegarde compressée
export PGPASSWORD="${DB_PASSWORD}"
pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" "${DB_NAME}" | gzip > "${BACKUP_FILE}"

# Vérification que la sauvegarde a réussi
if [ $? -eq 0 ] && [ -f "${BACKUP_FILE}" ]; then
    # Calcul de la taille de la sauvegarde
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "$(date) - Sauvegarde créée avec succès: ${BACKUP_FILE} (${BACKUP_SIZE})"
    
    # Chiffrement de la sauvegarde
    if [ "${ENCRYPTION_KEY}" != "default_key_change_me" ]; then
        openssl enc -aes-256-cbc -salt -in "${BACKUP_FILE}" -out "${ENCRYPTED_FILE}" -pass pass:"${ENCRYPTION_KEY}"
        if [ $? -eq 0 ]; then
            rm "${BACKUP_FILE}"
            echo "$(date) - Sauvegarde chiffrée: ${ENCRYPTED_FILE}"
            BACKUP_FILE="${ENCRYPTED_FILE}"
        else
            echo "$(date) - ERREUR: Échec du chiffrement, conservation de la sauvegarde non chiffrée"
        fi
    else
        echo "$(date) - AVERTISSEMENT: Clé de chiffrement par défaut, sauvegarde non chiffrée"
    fi
    
    # Calcul du hash SHA256 pour vérification d'intégrité
    sha256sum "${BACKUP_FILE}" > "${BACKUP_FILE}.sha256"
    
    # Suppression des anciennes sauvegardes
    if [ "${RETENTION_DAYS}" -gt 0 ]; then
        echo "$(date) - Suppression des sauvegardes de plus de ${RETENTION_DAYS} jours"
        find "${BACKUP_DIR}" -name "${DB_NAME}_*.sql.gz*" -type f -mtime +${RETENTION_DAYS} -delete
    fi
else
    echo "$(date) - ERREUR: Échec de la sauvegarde!"
    exit 1
fi

# Log de fin de sauvegarde
echo "$(date) - Fin de la sauvegarde"
