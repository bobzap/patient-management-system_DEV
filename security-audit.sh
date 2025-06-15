#!/bin/bash
# Script d'audit de sécurité pour Vital Sync

echo "🔒 AUDIT DE SÉCURITÉ - VITAL SYNC"
echo "================================="

# Variables
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteur de problèmes
ISSUES=0

echo -e "\n1. 🔍 Recherche de console.log dangereux..."
CONSOLE_LOGS=$(grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" | grep -v "NODE_ENV" | wc -l)
if [ $CONSOLE_LOGS -gt 0 ]; then
    echo -e "${RED}❌ $CONSOLE_LOGS console.log trouvés dans le code${NC}"
    echo "Fichiers concernés :"
    grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" | grep -v "NODE_ENV" | head -5
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ Aucun console.log dangereux trouvé${NC}"
fi

echo -e "\n2. 🔐 Vérification des variables d'environnement..."
if [ -f ".env.local" ]; then
    NEXT_PUBLIC_SECRETS=$(grep "NEXT_PUBLIC_.*SECRET\|NEXT_PUBLIC_.*PASSWORD\|NEXT_PUBLIC_.*KEY" .env.local | wc -l)
    if [ $NEXT_PUBLIC_SECRETS -gt 0 ]; then
        echo -e "${RED}❌ Variables secrètes exposées côté client détectées${NC}"
        grep "NEXT_PUBLIC_.*SECRET\|NEXT_PUBLIC_.*PASSWORD\|NEXT_PUBLIC_.*KEY" .env.local
        ISSUES=$((ISSUES + 1))
    else
        echo -e "${GREEN}✅ Pas de secrets exposés côté client${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Fichier .env.local non trouvé${NC}"
fi

echo -e "\n3. 🛡️ Vérification des dépendances..."
npm audit --audit-level moderate > /dev/null 2>&1
AUDIT_RESULT=$?
if [ $AUDIT_RESULT -ne 0 ]; then
    echo -e "${RED}❌ Vulnérabilités de sécurité détectées dans les dépendances${NC}"
    echo "Exécutez: npm audit pour plus de détails"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ Dépendances sécurisées${NC}"
fi

echo -e "\n4. 🔒 Vérification des routes API..."
UNPROTECTED_ROUTES=$(grep -r "export async function" src/app/api/ --include="*.ts" | grep -v "getServerSession" | wc -l)
if [ $UNPROTECTED_ROUTES -gt 0 ]; then
    echo -e "${YELLOW}⚠️ $UNPROTECTED_ROUTES routes API potentiellement non protégées${NC}"
    echo "Vérifiez manuellement l'authentification sur chaque route"
else
    echo -e "${GREEN}✅ Toutes les routes semblent protégées${NC}"
fi

echo -e "\n5. 📝 Vérification des logs sensibles..."
SENSITIVE_LOGS=$(grep -r "password\|token\|secret" src/ --include="*.ts" --include="*.tsx" | grep "console\|log" | wc -l)
if [ $SENSITIVE_LOGS -gt 0 ]; then
    echo -e "${RED}❌ Logs de données sensibles détectés${NC}"
    grep -r "password\|token\|secret" src/ --include="*.ts" --include="*.tsx" | grep "console\|log"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ Pas de logs de données sensibles${NC}"
fi

echo -e "\n6. 🌐 Vérification des headers de sécurité..."
if grep -q "X-Frame-Options\|X-Content-Type-Options\|X-XSS-Protection" src/app/layout.tsx; then
    echo -e "${GREEN}✅ Headers de sécurité configurés${NC}"
else
    echo -e "${RED}❌ Headers de sécurité manquants${NC}"
    ISSUES=$((ISSUES + 1))
fi

echo -e "\n7. 🚫 Vérification des hardcoded secrets..."
HARDCODED_SECRETS=$(grep -r "password.*=.*[\"'].*[\"']\|secret.*=.*[\"'].*[\"']\|key.*=.*[\"'].*[\"']" src/ --include="*.ts" --include="*.tsx" | wc -l)
if [ $HARDCODED_SECRETS -gt 0 ]; then
    echo -e "${RED}❌ Secrets potentiellement hardcodés détectés${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ Pas de secrets hardcodés détectés${NC}"
fi

echo -e "\n8. 📦 Vérification du fichier package.json..."
if grep -q "\"start\".*\"next start\"" package.json; then
    echo -e "${GREEN}✅ Script de production configuré${NC}"
else
    echo -e "${YELLOW}⚠️ Vérifiez la configuration de production${NC}"
fi

# Résumé
echo -e "\n🎯 RÉSUMÉ DE L'AUDIT"
echo "==================="
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ EXCELLENT ! Aucun problème critique détecté${NC}"
    echo -e "Score de sécurité: ${GREEN}🟢 ÉLEVÉ${NC}"
elif [ $ISSUES -le 2 ]; then
    echo -e "${YELLOW}⚠️  $ISSUES problème(s) détecté(s) - Corrections recommandées${NC}"
    echo -e "Score de sécurité: ${YELLOW}🟡 MOYEN${NC}"
else
    echo -e "${RED}❌ $ISSUES problèmes critiques détectés - CORRECTIONS URGENTES${NC}"
    echo -e "Score de sécurité: ${RED}🔴 FAIBLE${NC}"
fi

echo -e "\n📋 ACTIONS RECOMMANDÉES:"
if [ $CONSOLE_LOGS -gt 0 ]; then
    echo "1. Supprimer ou conditionner tous les console.log"
fi
if [ $NEXT_PUBLIC_SECRETS -gt 0 ]; then
    echo "2. Déplacer les secrets vers des variables serveur"
fi
if [ $UNPROTECTED_ROUTES -gt 0 ]; then
    echo "3. Vérifier l'authentification sur toutes les routes API"
fi
if [ $SENSITIVE_LOGS -gt 0 ]; then
    echo "4. Supprimer les logs de données sensibles"
fi
if [ $ISSUES -eq 0 ]; then
    echo "✅ Continuer la surveillance et effectuer des audits réguliers"
fi

echo -e "\n🔗 RESSOURCES UTILES:"
echo "- Documentation sécurité Next.js: https://nextjs.org/docs/advanced-features/security-headers"
echo "- OWASP Top 10: https://owasp.org/www-project-top-ten/"
echo "- Guide sécurité React: https://snyk.io/blog/10-react-security-best-practices/"

exit $ISSUES