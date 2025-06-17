# Guide de Gestion du Serveur VPS - VitalSync

## 📋 Vue d'ensemble de l'infrastructure

```
VPS (83.228.198.212)
├── /home/traefik-config/          → Reverse proxy + SSL
├── /home/supabase-project/        → Base de données + API
└── /home/patient-management-current/ → Application Next.js
```

### URLs de production :
- **https://app.vital-sync.ch** → Application Next.js
- **https://admin.vital-sync.ch** → Interface Supabase (protégée)
- **https://api.vital-sync.ch** → API Supabase (protégée)

---

## 🚀 Procédure de redémarrage après reboot

### **Ordre de démarrage OBLIGATOIRE :**

```bash
# 1. Connexion au serveur
ssh debian@83.228.198.212

# 2. Vérification de l'état
df -h                    # Espace disque
free -h                  # Mémoire
docker ps -a            # État des conteneurs

# 3. Démarrage dans l'ordre :

# ÉTAPE 1 : Traefik (reverse proxy)
cd /home/traefik-config
docker compose up -d

# ÉTAPE 2 : Supabase (base de données + API)
cd /home/supabase-project
docker compose up -d

# ÉTAPE 3 : Application Next.js
cd /home/patient-management-current
docker compose up -d

# 4. Vérification finale
docker ps                # Tous les services UP
curl -k https://app.vital-sync.ch/  # Test de l'app
```

---

## 🔄 Gestion des mises à jour du code

### **Mise à jour de l'application Next.js :**

```bash
# 1. Arrêt de l'application (garde Traefik + Supabase)
cd /home/patient-management-current
docker compose down

# 2. Sauvegarde (optionnel mais recommandé)
cp -r /home/patient-management-current /home/backup-$(date +%Y%m%d-%H%M%S)

# 3. Récupération du nouveau code
git pull origin main
# OU si pas encore de Git :
# git clone https://github.com/votre-repo/patient-management.git /tmp/new-code
# cp -r /tmp/new-code/* /home/patient-management-current/

# 4. Reconstruction et redémarrage
docker compose build --no-cache    # Rebuild avec nouveau code
docker compose up -d               # Redémarrage

# 5. Vérification
docker logs -f entretien-infirmier-app    # Logs en temps réel
docker ps | grep entretien                # Statut healthy
```

### **Si problème de mémoire lors du build :**

```bash
# Arrêt temporaire des services non-critiques
cd /home/supabase-project
docker compose stop analytics vector imgproxy

# Build de l'app
cd /home/patient-management-current
docker compose build

# Redémarrage complet
cd /home/supabase-project
docker compose up -d
cd /home/patient-management-current
docker compose up -d
```

---

## 🔧 Commandes de diagnostic

### **Vérification de l'état des services :**

```bash
# État général
docker ps -a
docker network ls

# Logs spécifiques
docker logs traefik | tail -20
docker logs supabase-db | tail -20
docker logs entretien-infirmier-app | tail -20

# Tests de connectivité
curl -H "Host: app.vital-sync.ch" http://localhost/
curl -k https://app.vital-sync.ch/
curl -k https://admin.vital-sync.ch/
curl -k https://api.vital-sync.ch/
```

### **Vérification des réseaux Docker :**

```bash
# Réseaux disponibles
docker network ls

# Conteneurs sur réseau traefik
docker network inspect traefik

# Vérification app sur les bons réseaux
docker inspect entretien-infirmier-app | grep -A 20 "Networks"
```

---

## 🗄️ Gestion de la base de données Supabase

### **Sauvegarde de la base :**

```bash
# Sauvegarde complète
cd /home/supabase-project
docker exec supabase-db pg_dumpall -U postgres > backup-$(date +%Y%m%d).sql

# Sauvegarde d'une table spécifique
docker exec supabase-db pg_dump -U postgres -t ma_table postgres > table-backup.sql
```

### **Accès à la base de données :**

```bash
# Connexion PostgreSQL directe
docker exec -it supabase-db psql -U postgres -d postgres

# Via l'interface Supabase Studio
# → https://admin.vital-sync.ch (avec authentification)
```

---

## 🛠️ Maintenance et monitoring

### **Nettoyage Docker (à faire régulièrement) :**

```bash
# Nettoyage des images inutilisées
docker system prune -a

# Nettoyage des volumes orphelins
docker volume prune

# Espace disque utilisé par Docker
docker system df
```

### **Surveillance des ressources :**

```bash
# Surveillance en temps réel
htop                    # CPU/RAM
df -h                   # Espace disque
docker stats           # Ressources par conteneur

# Logs système
journalctl -f          # Logs système en temps réel
dmesg | tail          # Messages kernel
```

---

## 🚨 Résolution de problèmes courants

### **App inaccessible (404) :**

```bash
# 1. Vérifier que l'app tourne
docker ps | grep entretien

# 2. Vérifier les réseaux
docker network connect traefik entretien-infirmier-app

# 3. Redémarrer Traefik
cd /home/traefik-config
docker compose restart
```

### **Certificats SSL expirés :**

```bash
# Forcer le renouvellement
cd /home/traefik-config
docker compose restart
# Les certificats se renouvellent automatiquement
```

### **Supabase inaccessible :**

```bash
# Vérifier les services Supabase
cd /home/supabase-project
docker compose ps

# Redémarrer les services en panne
docker compose restart supabase-kong supabase-studio
```

### **Manque de mémoire :**

```bash
# Identifier les gros consommateurs
docker stats --no-stream

# Redémarrer les services gourmands
docker compose restart supabase-analytics
docker compose restart supabase-vector
```

---

## 📁 Structure des fichiers importants

```
/home/
├── traefik-config/
│   ├── docker-compose.yml     → Config Traefik
│   ├── config/dynamic.yml     → Routes et certificats
│   └── certs/                 → Certificats SSL
├── supabase-project/
│   ├── docker-compose.yml     → Config Supabase
│   ├── .env                   → Variables Supabase
│   └── volumes/               → Données persistantes
└── patient-management-current/
    ├── compose.yaml           → Config App Next.js
    ├── .env.production        → Variables de l'app
    ├── Dockerfile            → Build de l'app
    └── [code source]         → Code de l'application
```

---

## 🔐 Variables d'environnement importantes

### **Supabase (.env) :**
- `POSTGRES_PASSWORD` : Mot de passe DB
- `JWT_SECRET` : Clé JWT
- `ANON_KEY` : Clé publique API
- `SERVICE_ROLE_KEY` : Clé admin API

### **Application (.env.production) :**
- `NEXT_PUBLIC_SUPABASE_URL=https://api.vital-sync.ch`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Clé publique
- `NEXTAUTH_URL=https://app.vital-sync.ch`

---

## 📞 Contact et support

**Adresses importantes :**
- Serveur : `83.228.198.212`
- DNS : Interface Infomaniak
- Domaine : `vital-sync.ch`

**Commandes d'urgence :**
```bash
# Arrêt d'urgence de tout
docker stop $(docker ps -q)

# Redémarrage complet dans l'ordre
cd /home/traefik-config && docker compose up -d
cd /home/supabase-project && docker compose up -d  
cd /home/patient-management-current && docker compose up -d
```

---

*Guide créé le $(date) - Infrastructure VitalSync v1.0*