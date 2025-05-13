.PHONY: help build up down restart ps logs shell db-shell db-migrate db-seed cert-init backup restore security-check update clean

# Variables pour Docker management
COMPOSE = docker-compose
ENV_FILE = .env.production
APP_CONTAINER = entretien-infirmier-app
DB_CONTAINER = entretien-infirmier-db
NGINX_CONTAINER = entretien-infirmier-nginx
DOMAIN_NAME = votre-domaine.com
BACKUP_DIR = ./backups

# Couleurs pour les messages
YELLOW = \033[1;33m
GREEN = \033[0;32m
RED = \033[0;31m
NC = \033[0m # No Color

# Afficher l'aide
help:
	@echo "${YELLOW}Makefile pour gérer l'application d'entretiens infirmiers${NC}"
	@echo ""
	@echo "${GREEN}Commandes disponibles:${NC}"
	@echo "  make build          - Construit les images Docker"
	@echo "  make up             - Démarre les conteneurs"
	@echo "  make down           - Arrête les conteneurs"
	@echo "  make restart        - Redémarre les conteneurs"
	@echo "  make ps             - Liste les conteneurs en cours d'exécution"
	@echo "  make logs           - Affiche les logs de l'application"
	@echo "  make shell          - Ouvre un shell dans le conteneur de l'application"
	@echo "  make db-shell       - Ouvre un shell PostgreSQL"
	@echo "  make db-migrate     - Exécute les migrations de base de données"
	@echo "  make db-seed        - Charge les données initiales"
	@echo "  make cert-init      - Initialise les certificats SSL"
	@echo "  make backup         - Crée une sauvegarde de la base de données"
	@echo "  make restore        - Restaure la dernière sauvegarde"
	@echo "  make security-check - Vérifie les vulnérabilités de sécurité"
	@echo "  make update         - Met à jour les conteneurs avec les dernières images"
	@echo "  make clean          - Nettoie les ressources Docker (volumes, etc.)"

# Vérifier l'existence du fichier .env.production
check-env:
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "${RED}Le fichier $(ENV_FILE) n'existe pas.${NC}"; \
		echo "${YELLOW}Création à partir de l'exemple...${NC}"; \
		cp .env.production.example $(ENV_FILE); \
		echo "${RED}ATTENTION: Veuillez modifier le fichier $(ENV_FILE) avec vos informations!${NC}"; \
		exit 1; \
	fi

# Vérifier la sécurité des images Docker
security-check:
	@echo "${YELLOW}Vérification des vulnérabilités de sécurité...${NC}"
	@if command -v docker scan >/dev/null 2>&1; then \
		docker scan $(APP_CONTAINER):latest; \
	else \
		echo "${RED}La commande 'docker scan' n'est pas disponible. Veuillez installer Docker Desktop ou Snyk CLI.${NC}"; \
		echo "${YELLOW}Vérification alternative avec trivy...${NC}"; \
		if command -v trivy >/dev/null 2>&1; then \
			trivy image $(APP_CONTAINER):latest; \
		else \
			echo "${RED}Trivy n'est pas installé. Impossible de vérifier les vulnérabilités.${NC}"; \
		fi; \
	fi
	@echo "${YELLOW}Vérification de l'exécution avec un utilisateur non-root...${NC}"
	@docker run --rm $(APP_CONTAINER):latest id | grep uid=1001 > /dev/null && \
		echo "${GREEN}✓ Le conteneur s'exécute avec un utilisateur non-root${NC}" || \
		echo "${RED}✗ Le conteneur s'exécute en tant que root${NC}"

# Construction des images Docker
build: check-env
	@echo "${YELLOW}Construction des images Docker...${NC}"
	@$(COMPOSE) --env-file $(ENV_FILE) build --no-cache

# Démarrage des conteneurs
up: check-env
	@echo "${YELLOW}Démarrage des conteneurs...${NC}"
	@$(COMPOSE) --env-file $(ENV_FILE) up -d
	@echo "${GREEN}Containers démarrés! L'application est accessible à https://$(DOMAIN_NAME)${NC}"

# Arrêt des conteneurs
down:
	@echo "${YELLOW}Arrêt des conteneurs...${NC}"
	@$(COMPOSE) down
	@echo "${GREEN}Containers arrêtés${NC}"

# Redémarrage des conteneurs
restart: check-env
	@echo "${YELLOW}Redémarrage des conteneurs...${NC}"
	@$(COMPOSE) --env-file $(ENV_FILE) restart
	@echo "${GREEN}Containers redémarrés${NC}"

# Liste des conteneurs en cours d'exécution
ps:
	@$(COMPOSE) ps

# Affichage des logs
logs:
	@$(COMPOSE) logs -f $(APP_CONTAINER)

# Ouverture d'un shell dans le conteneur de l'application
shell:
	@echo "${YELLOW}Ouverture d'un shell dans le conteneur de l'application...${NC}"
	@docker exec -it $(APP_CONTAINER) /bin/sh

# Ouverture d'un shell PostgreSQL
db-shell:
	@echo "${YELLOW}Ouverture d'un shell PostgreSQL...${NC}"
	@docker exec -it $(DB_CONTAINER) psql -U $(shell grep POSTGRES_USER $(ENV_FILE) | cut -d'=' -f2) -d $(shell grep POSTGRES_DB $(ENV_FILE) | cut -d'=' -f2)

# Exécution des migrations de base de données
db-migrate:
	@echo "${YELLOW}Exécution des migrations de base de données...${NC}"
	@docker exec -it $(APP_CONTAINER) npx prisma migrate deploy
	@echo "${GREEN}Migrations effectuées${NC}"

# Chargement des données initiales
db-seed:
	@echo "${YELLOW}Chargement des données initiales...${NC}"
	@docker exec -it $(APP_CONTAINER) npx prisma db seed
	@echo "${GREEN}Données initiales chargées${NC}"

# Initialisation des certificats SSL
cert-init: check-env
	@echo "${YELLOW}Initialisation des certificats SSL pour $(DOMAIN_NAME)...${NC}"
	@mkdir -p ./nginx/certbot/conf
	@mkdir -p ./nginx/certbot/www
	@docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot \
		--email $(shell grep SSL_EMAIL $(ENV_FILE) | cut -d'=' -f2) --agree-tos --no-eff-email \
		-d $(DOMAIN_NAME) -d www.$(DOMAIN_NAME)
	@echo "${GREEN}Certificats SSL initialisés${NC}"

# Sauvegarde de la base de données
backup:
	@echo "${YELLOW}Création d'une sauvegarde de la base de données...${NC}"
	@mkdir -p $(BACKUP_DIR)
	@docker-compose run --rm backup /backup.sh
	@echo "${GREEN}Sauvegarde créée dans $(BACKUP_DIR)${NC}"

# Restauration de la dernière sauvegarde
restore:
	@echo "${YELLOW}Restauration de la dernière sauvegarde...${NC}"
	@LATEST_BACKUP=$$(ls -t $(BACKUP_DIR)/*.sql.gz* | head -1); \
	if [ -z "$$LATEST_BACKUP" ]; then \
		echo "${RED}Aucune sauvegarde trouvée dans $(BACKUP_DIR)${NC}"; \
		exit 1; \
	fi; \
	echo "Restauration de $$LATEST_BACKUP..."; \
	if [[ $$LATEST_BACKUP == *.enc ]]; then \
		echo "Le fichier est chiffré, déchiffrement en cours..."; \
		openssl enc -d -aes-256-cbc -in $$LATEST_BACKUP -out $${LATEST_BACKUP%.enc} -pass pass:$(shell grep BACKUP_ENCRYPTION_KEY $(ENV_FILE) | cut -d'=' -f2); \
		LATEST_BACKUP=$${LATEST_BACKUP%.enc}; \
	fi; \
	gunzip -c $$LATEST_BACKUP | docker exec -i $(DB_CONTAINER) psql -U $(shell grep POSTGRES_USER $(ENV_FILE) | cut -d'=' -f2) -d $(shell grep POSTGRES_DB $(ENV_FILE) | cut -d'=' -f2); \
	echo "${GREEN}Sauvegarde restaurée${NC}"

# Mise à jour des conteneurs
update: check-env
	@echo "${YELLOW}Mise à jour des images Docker...${NC}"
	@$(COMPOSE) --env-file $(ENV_FILE) pull
	@echo "${YELLOW}Redémarrage des conteneurs avec les nouvelles images...${NC}"
	@$(COMPOSE) --env-file $(ENV_FILE) up -d --build
	@echo "${GREEN}Conteneurs mis à jour${NC}"

# Nettoyage des ressources Docker
clean:
	@echo "${YELLOW}Nettoyage des ressources Docker...${NC}"
	@$(COMPOSE) down -v
	@echo "${YELLOW}Suppression des images non utilisées...${NC}"
	@docker image prune -af
	@echo "${GREEN}Ressources nettoyées${NC}"