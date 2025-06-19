# 🐳 Guide Docker - Comprendre Build vs Up vs Rebuild

## 🏠 Analogie : Construction d'une maison

### 🧱 `docker build` = Construire la maison
- **Tu es l'architecte/constructeur**
- Tu prends les plans (Dockerfile)
- Tu construis la maison avec tous les matériaux
- **Résultat :** Une maison prête (image Docker)
- **Durée :** Long (plusieurs minutes)

```bash
docker build .                    # Construire la maison
docker compose build app          # Construire selon les plans du compose
```

### 🔑 `docker up` = Emménager dans la maison
- **Tu es le locataire**
- Tu prends une maison déjà construite
- Tu ouvres la porte et tu t'installes
- **Résultat :** Tu habites dedans (container qui tourne)
- **Durée :** Rapide (quelques secondes)

```bash
docker compose up -d              # Emménager et vivre dedans
```

### 🔨 `docker build --no-cache` = Démolir et reconstruire
- **Démolition totale** de l'ancienne maison
- **Reconstruction complète** avec matériaux neufs
- Ignore tous les matériaux stockés (cache)
- **Durée :** Très long (10+ minutes)

```bash
docker compose build --no-cache   # Tout démolir et reconstruire
```

---

## 🔄 Workflow de développement

### **Première fois :**
```bash
docker compose up -d
# Si pas d'image → BUILD automatique puis UP
# "Je construis la maison ET j'emménage"
```

### **Après changements de code :**
```bash
docker compose build app          # "Je rénove la maison"
docker compose up -d              # "Je redémarre la vie dedans"
```

### **Quand ça ne marche plus :**
```bash
docker compose build --no-cache   # "Je détruis tout et reconstruis"
docker compose up -d              # "J'emménage dans la nouvelle maison"
```

---

## 🎯 Cas d'usage pratiques

| Situation | Commande | Analogie | Durée |
|-----------|----------|----------|-------|
| **Premier lancement** | `docker compose up -d` | "Construire + emménager" | Moyenne |
| **Changement de code** | `docker compose build app` | "Rénover la cuisine" | Rapide |
| **Problème bizarre** | `docker compose build --no-cache` | "Démolir + reconstruire" | Très long |
| **Redémarrer l'app** | `docker compose restart app` | "Sortir + rentrer chez soi" | Très rapide |
| **Tout arrêter** | `docker compose down` | "Déménager" | Rapide |
| **Voir les logs** | `docker compose logs app -f` | "Écouter ce qui se passe" | Instantané |

---

## 💡 Mnémotechnique

- **BUILD** = **B**âtir, **B**rique par **B**rique
- **UP** = **U**tiliser, **U**ne maison qui existe
- **DOWN** = **D**éménager, **D**ésactiver
- **RESTART** = **R**entrer chez soi après être sorti

---

## 🚀 Cycle complet de développement

```bash
# 1. Première construction
docker compose up -d              # Construire + démarrer

# 2. Développement quotidien
# Modifier le code...
docker compose build app          # Reconstruire après changements
docker compose up -d              # Relancer avec les nouveaux changements

# 3. En cas de problème
docker compose down               # Arrêter tout
docker compose build --no-cache  # Reconstruction totale
docker compose up -d              # Redémarrer

# 4. Vérifications
docker compose ps                 # Voir l'état des containers
docker compose logs app -f       # Voir les logs en temps réel
```

---

## 🔧 Commandes utiles pour le debug

```bash
# État des containers
docker compose ps

# Logs en temps réel
docker compose logs app -f

# Entrer dans le container (debug)
docker compose exec app sh

# Redémarrer un service spécifique
docker compose restart app

# Voir les images disponibles
docker images

# Nettoyer les images inutilisées
docker image prune
```

---

## 📁 Structure de fichiers recommandée

```
📁 Projet/
├── 🐳 Dockerfile.dev          # Version développement (avec hot reload)
├── 🐳 Dockerfile.prod         # Version production (optimisée)
├── 🔧 compose.dev.yaml        # Configuration développement local
├── 🚀 compose.prod.yaml       # Configuration production VPS
├── ⚙️ .env.local              # Variables développement
├── ⚙️ .env.production         # Variables production
└── 📖 README.md               # Documentation
```

---

## 🎯 Commandes par environnement

### **Développement local :**
```bash
# Démarrer l'environnement de dev
docker compose -f compose.dev.yaml up -d

# Reconstruire après changements
docker compose -f compose.dev.yaml build app
docker compose -f compose.dev.yaml up -d

# Arrêter
docker compose -f compose.dev.yaml down
```

### **Production (VPS) :**
```bash
# Déployer en production
git pull
docker compose -f compose.prod.yaml up -d

# Mise à jour
git pull
docker compose -f compose.prod.yaml build --no-cache
docker compose -f compose.prod.yaml up -d
```

---

## ⚡ Scripts package.json utiles

```json
{
  "scripts": {
    "dev": "next dev -p 3002",
    "docker:dev": "docker compose -f compose.dev.yaml up -d",
    "docker:build": "docker compose -f compose.dev.yaml build app",
    "docker:rebuild": "docker compose -f compose.dev.yaml build --no-cache",
    "docker:restart": "docker compose -f compose.dev.yaml restart app",
    "docker:logs": "docker compose -f compose.dev.yaml logs app -f",
    "docker:down": "docker compose -f compose.dev.yaml down"
  }
}
```

**Usage :**
```bash
npm run docker:dev      # Démarrer
npm run docker:build    # Reconstruire
npm run docker:logs     # Voir les logs
npm run docker:down     # Arrêter
```

---

## 🆘 Résolution de problèmes

### **L'app ne démarre pas :**
1. `docker compose logs app` → Voir les erreurs
2. `docker compose build --no-cache` → Reconstruction totale
3. `docker compose up -d` → Redémarrer

### **Changements de code non pris en compte :**
1. `docker compose build app` → Reconstruire l'image
2. `docker compose restart app` → Redémarrer le container

### **Port déjà utilisé :**
1. `docker compose down` → Arrêter tous les containers
2. `netstat -ano | findstr :3000` → Voir qui utilise le port
3. Changer le port dans le compose ou arrêter l'autre service

### **Problèmes Prisma :**
1. Vérifier les `binaryTargets` dans `schema.prisma`
2. `docker compose build --no-cache` → Reconstruction avec nouveaux clients Prisma

---

## 🎉 Mémo rapide

| Je veux... | Commande |
|------------|----------|
| **Démarrer tout** | `docker compose up -d` |
| **Voir ce qui se passe** | `docker compose logs app -f` |
| **Appliquer mes changements** | `docker compose build app && docker compose up -d` |
| **Tout arrêter** | `docker compose down` |
| **Repartir de zéro** | `docker compose build --no-cache && docker compose up -d` |