#!/bin/bash
# scripts/test-local-setup.sh

echo "🔍 Test de la configuration locale..."

# 1. Vérifier que PostgreSQL est accessible
echo "1️⃣ Test de PostgreSQL..."
if command -v psql >/dev/null 2>&1; then
    echo "   ✅ psql installé"
    
    # Test de connexion
    if psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "SELECT version();" >/dev/null 2>&1; then
        echo "   ✅ Connexion PostgreSQL OK"
    else
        echo "   ❌ PostgreSQL non accessible sur le port 54322"
        echo "   💡 Solutions:"
        echo "      - Démarrez Supabase local: npx supabase start"
        echo "      - Ou utilisez le port 5432: postgresql://postgres:postgres@127.0.0.1:5432/postgres"
        echo "      - Ou démarrez PostgreSQL: brew services start postgresql"
    fi
else
    echo "   ⚠️ psql non installé"
fi

# 2. Vérifier les dépendances Node.js
echo ""
echo "2️⃣ Test des dépendances..."
if [ -f "package.json" ]; then
    echo "   ✅ package.json trouvé"
    
    if [ -d "node_modules" ]; then
        echo "   ✅ node_modules présent"
    else
        echo "   ❌ node_modules manquant"
        echo "   💡 Lancez: npm install"
    fi
else
    echo "   ❌ package.json manquant"
fi

# 3. Vérifier Prisma
echo ""
echo "3️⃣ Test de Prisma..."
if npx prisma --version >/dev/null 2>&1; then
    echo "   ✅ Prisma installé"
    
    # Test de génération du client
    if npx prisma generate >/dev/null 2>&1; then
        echo "   ✅ Client Prisma généré"
    else
        echo "   ❌ Erreur génération client Prisma"
    fi
else
    echo "   ❌ Prisma non accessible"
fi

# 4. Test de build Next.js
echo ""
echo "4️⃣ Test de build Next.js (rapide)..."
if npm run build >/dev/null 2>&1; then
    echo "   ✅ Build Next.js OK"
else
    echo "   ❌ Erreur de build Next.js"
    echo "   💡 Vérifiez les erreurs avec: npm run build"
fi

echo ""
echo "🎯 Si tous les tests passent, lancez:"
echo "   npm run dev -- -p 3002"