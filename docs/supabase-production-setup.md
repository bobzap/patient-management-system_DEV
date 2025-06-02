# Guide Setup Supabase - Production VPS

## 📋 Configuration actuelle VPS

Ton VPS dispose déjà d'une **stack Supabase complète** avec Docker Compose :

```
VPS Infrastructure:
├── 🐳 Docker Compose Setup
├── 🗄️ PostgreSQL Database
├── 🔐 Supabase Auth
├── 📡 API Gateway (Kong)
├── 🎨 Supabase Studio
├── 📁 Storage Service
└── ⚡ Real-time Service
```

## 🌐 URLs de production

Remplace `TON-IP-VPS` par l'IP réelle de ton serveur :

- **API Supabase** : `http://TON-IP-VPS:8001`
- **Supabase Studio** : `http://TON-IP-VPS:3000`
- **Database Direct** : `TON-IP-VPS:5432`

## 🔧 Configuration pour déploiement

### Variables d'environnement production

Crée un fichier `.env.production.local` :

```env
# Supabase Production (VPS)
NEXT_PUBLIC_SUPABASE_URL=http://TON-IP-VPS:8001
NEXT_PUBLIC_SUPABASE_ANON_KEY=TON_ANON_KEY_PRODUCTION
SUPABASE_SERVICE_ROLE_KEY=TON_SERVICE_KEY_PRODUCTION
DATABASE_URL=postgresql://postgres:TON_PASSWORD@TON-IP-VPS:5432/postgres
```

### Récupérer les clés de production

```bash
# Sur ton VPS, dans le dossier supabase
cd /path/to/supabase-project
cat .env

# Ou consulter les variables d'environnement Docker
docker exec supabase-kong env | grep KEY
```

## 🚀 Déploiement vers le VPS

### Option 1 : Développement direct sur VPS

Pour développer directement contre le VPS :

```env
# .env.local (pointer vers le VPS au lieu du local)
NEXT_PUBLIC_SUPABASE_URL=http://TON-IP-VPS:8001
NEXT_PUBLIC_SUPABASE_ANON_KEY=TON_ANON_KEY_PRODUCTION
```

### Option 2 : Workflow Local → VPS

```bash
# 1. Développer en local avec Supabase local
npm run dev -- -p 3001

# 2. Créer les migrations
C:\Users\ldaiz\Documents\Code\SUPABASE\supabase.exe db diff > migration_new.sql

# 3. Copier vers le VPS
scp migration_new.sql user@TON-IP-VPS:/path/to/supabase/migrations/

# 4. Appliquer sur le VPS
ssh user@TON-IP-VPS
cd /path/to/supabase-project
docker exec supabase-db psql -U postgres -d postgres -f /migrations/migration_new.sql
```

## 📁 Structure VPS

```
/path/to/supabase-project/
├── docker-compose.yml        # Configuration des services
├── .env                      # Variables d'environnement
├── volumes/
│   ├── db/                   # Données PostgreSQL
│   ├── storage/              # Fichiers uploadés
│   └── config/               # Configurations
└── migrations/               # Scripts SQL
```

## 🔄 Gestion des services VPS

### Commandes Docker Compose

```bash
# Démarrer tous les services
docker compose up -d

# Arrêter tous les services
docker compose down

# Voir les logs
docker compose logs -f

# Redémarrer un service spécifique
docker compose restart supabase-kong

# Voir le statut
docker compose ps
```

### Backup et restauration

```bash
# Backup de la base de données
docker exec supabase-db pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql

# Restauration
docker exec -i supabase-db psql -U postgres postgres < backup_20250602.sql
```

## 🔐 Sécurité et accès

### Configuration Firewall

```bash
# Ouvrir les ports nécessaires
sudo ufw allow 8001  # API Supabase
sudo ufw allow 3000  # Studio (optionnel, pour admin)
sudo ufw allow 5432  # PostgreSQL (uniquement si accès direct nécessaire)
```

### SSL/TLS (recommandé)

Configurer un reverse proxy (Nginx) avec Let's Encrypt :

```nginx
# /etc/nginx/sites-available/supabase
server {
    listen 443 ssl;
    server_name supabase.ton-domaine.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔄 Synchronisation Local ↔ VPS

### Workflow recommandé

1. **Développement local** avec Supabase local
2. **Test des migrations** en local
3. **Export des changements**
4. **Application sur le VPS**

### Script de synchronisation

```bash
#!/bin/bash
# sync-to-vps.sh

# Export des migrations locales
supabase db diff > temp_migration.sql

# Copie vers le VPS
scp temp_migration.sql user@TON-IP-VPS:/tmp/

# Application sur le VPS
ssh user@TON-IP-VPS "docker exec -i supabase-db psql -U postgres postgres < /tmp/temp_migration.sql"

# Nettoyage
rm temp_migration.sql
```

## 📊 Monitoring et maintenance

### Logs importants

```bash
# Logs de l'API
docker logs supabase-kong

# Logs de la base de données
docker logs supabase-db

# Logs de l'auth
docker logs supabase-auth

# Espace disque
df -h
docker system df
```

### Maintenance régulière

```bash
# Nettoyage des images Docker
docker system prune -f

# Backup automatique (cron)
0 2 * * * docker exec supabase-db pg_dump -U postgres postgres > /backups/daily_$(date +\%Y\%m\%d).sql
```

## 🆘 Troubleshooting VPS

### Problèmes courants

```bash
# Service ne répond pas
docker compose restart

# Problème de permissions
sudo chown -R $(whoami) volumes/

# Espace disque plein
docker system prune -af
```

### Récupération d'urgence

```bash
# Redémarrage complet
docker compose down
docker compose up -d

# Restauration depuis backup
docker exec -i supabase-db psql -U postgres postgres < backup_latest.sql
```

## 📝 Notes importantes

- **Backup quotidien** automatisé recommandé
- **Monitoring** des ressources (CPU, RAM, disque)
- **SSL/TLS** obligatoire en production
- **Firewall** correctement configuré
- **Accès Studio** limité aux administrateurs