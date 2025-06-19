# Guide Setup Supabase - Développement Local


🔄 Workflow de développement
# Démarrer l'environnement de dev
docker compose -f compose.dev.yaml up -d

# Rebuilder après changements
docker compose -f compose.dev.yaml build --no-cache app
docker compose -f compose.dev.yaml up -d

# Arrêter proprement
docker compose -f compose.dev.yaml down



🔄 Workflow de déploiement
Local :
docker compose -f compose.dev.yaml up -d
# Accès: http://localhost:3002

VPS :
git pull
docker compose -f compose.prod.yaml up -d
# Accès: https://app.vital-sync.ch





## 📋 Récapitulatif de ce qui a été fait

1. **Installation du CLI Supabase** sur Windows
2. **Initialisation** de Supabase dans le projet Next.js
3. **Configuration** de l'environnement local
4. **Création** des tables via migrations SQL
5. **Configuration** des variables d'environnement
6. **Tests** de connexion entre Next.js et Supabase

## 🚀 Démarrage rapide après redémarrage PC

### Prérequis
- Docker Desktop installé et démarré
- CLI Supabase installé dans `C:\Users\ldaiz\Documents\Code\SUPABASE\`

### Commandes essentielles

```bash
# 1. Aller dans le projet
cd "C:\Users\ldaiz\Documents\Code\patient-management-system-master\patient-management-system_DEV\patient-management-system"

# 2. Démarrer Supabase local (avec le chemin complet du CLI)
C:\Users\ldaiz\Documents\Code\SUPABASE\supabase.exe start

# 3. Vérifier le statut
C:\Users\ldaiz\Documents\Code\SUPABASE\supabase.exe status

# 4. Démarrer l'app Next.js
npm run dev -- -p 3001
```

### URLs importantes
- **App Next.js** : http://localhost:3001
- **Supabase Studio** : http://127.0.0.1:54323
- **API Supabase** : http://127.0.0.1:54321

## 📁 Structure des fichiers

```
patient-management-system/
├── supabase/
│   ├── config.toml              # Config Supabase (analytics disabled)
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Tables et structure DB
│   └── seed.sql                 # Données de test (optionnel)
├── src/lib/
│   └── supabase.ts              # Client Supabase configuré
├── .env.local                   # Variables locales (NON dans Git)
├── .env.production              # Variables Prisma existantes
└── prisma/
    └── schema.prisma            # Schema existant (conservé)
```

## 🔐 Variables d'environnement

### Fichier `.env.local` (à créer manuellement)


⚠️ **Important** : Ce fichier est dans `.gitignore` 

## 🛠️ Résolution de problèmes

### Erreur "container not found"
```bash
# Nettoyer les conteneurs
docker container prune -f
C:\Users\ldaiz\Documents\Code\SUPABASE\supabase.exe start
```

### Erreur analytics/vector
Supabase fonctionne même avec cette erreur. Les services principaux (DB, Auth, API) sont opérationnels.

### Port 3000 occupé
```bash
# Utiliser le port 3001
npm run dev -- -p 3001
```

## 📊 Commandes utiles

```bash
# Arrêter Supabase
C:\Users\ldaiz\Documents\Code\SUPABASE\supabase.exe stop

# Reset complet de la DB
C:\Users\ldaiz\Documents\Code\SUPABASE\supabase.exe db reset

# Voir les logs
C:\Users\ldaiz\Documents\Code\SUPABASE\supabase.exe start --debug

# Générer les types TypeScript
C:\Users\ldaiz\Documents\Code\SUPABASE\supabase.exe gen types typescript --local > types/supabase.ts
```

## 🔄 Workflow de développement

1. **Démarrer Docker Desktop**
2. **Lancer Supabase** : `supabase start`
3. **Lancer Next.js** : `npm run dev -- -p 3001`
4. **Développer** avec les deux systèmes :
   - Prisma pour les données existantes
   - Supabase pour les nouvelles fonctionnalités
5. **Tester** sur http://localhost:3001

## 📝 Notes importantes

- **Deux systèmes coexistent** : Prisma (SQLite) + Supabase (PostgreSQL)
- **Migration progressive** : table par table vers Supabase
- **Authentification** : sera gérée par Supabase Auth
- **Real-time** : disponible avec Supabase pour les fonctionnalités collaboratives

## 🆘 Support

En cas de problème :
1. Vérifier que Docker Desktop fonctionne
2. Vérifier les logs dans le terminal
3. Consulter Supabase Studio pour l'état de la DB
4. Redémarrer les services si nécessaire


## IMPORT DES données existantes sous SQL light à supabase : 

# Migration complète
node scripts/migrate-to-supabase.js

# Ou migration après nettoyage
node scripts/migrate-to-supabase.js --clear --migrate

