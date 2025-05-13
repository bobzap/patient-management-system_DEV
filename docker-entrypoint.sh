#!/bin/sh
set -e

# Vérifier les permissions
if [ "$(id -u)" = "0" ]; then
  echo "AVERTISSEMENT: Le conteneur s'exécute en tant que root, ce qui est déconseillé pour la sécurité"
fi

# Attendre que la base de données soit prête
echo "Attente de la base de données..."
for i in $(seq 1 30); do
  npx prisma db ping 2>/dev/null && break
  echo "Tentative de connexion à la base de données $i/30, nouvel essai dans 5 secondes..."
  sleep 5
done

# Vérifier si la connexion a réussi
if ! npx prisma db ping 2>/dev/null; then
  echo "ERREUR: Impossible de se connecter à la base de données après 30 tentatives"
  exit 1
fi
echo "Base de données disponible !"

# Vérifier l'existence et les permissions des répertoires critiques
REQUIRED_DIRS="/app/data /app/logs /app/public"
for dir in $REQUIRED_DIRS; do
  if [ ! -d "$dir" ]; then
    echo "Création du répertoire $dir..."
    mkdir -p "$dir"
  fi
  
  if [ ! -w "$dir" ]; then
    echo "ERREUR: Le répertoire $dir n'est pas accessible en écriture"
    exit 1
  fi
done

# Exécuter les migrations si demandé
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Exécution des migrations de base de données..."
  npx prisma migrate deploy
  echo "Migrations terminées!"
else
  echo "Migration ignorée (RUN_MIGRATIONS != true)"
fi

# Charger les données initiales si demandé
if [ "$SEED_DATABASE" = "true" ]; then
  echo "Chargement des données initiales..."
  npx prisma db seed
  echo "Données initiales chargées!"
else
  echo "Chargement des données initiales ignoré (SEED_DATABASE != true)"
fi

# Vérifier la santé de l'application
echo "Vérification de l'intégrité de l'application..."
if [ ! -f "/app/server.js" ]; then
  echo "ERREUR: Le fichier server.js est manquant, le build a probablement échoué"
  exit 1
fi

# Démarrer l'application avec les arguments passés
echo "Démarrage de l'application avec la commande: $@"
exec "$@"