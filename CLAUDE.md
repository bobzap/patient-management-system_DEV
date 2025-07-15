# CLAUDE.md

## 🏗️ Workflow

1. **Analyse** → Lisez la base de code, identifiez les fichiers pertinents
2. **Plan** → Rédigez un plan dans `tasks/todo.md` avec actions cochables  
3. **Validation** → Contactez-moi pour révision du plan avant exécution
4. **Exécution** → Travaillez étape par étape, marquez les tâches terminées
5. **Documentation** → Expliquez clairement chaque modification
6. **Simplicité** → Impact minimal, évitez les modifications massives
7. **Révision** → Ajoutez section résumé dans `todo.md` avec modifications et points d'attention

## 🔒 Sécurité (Non-négociable)

- **Jamais de secrets hardcodés** - Variables d'environnement uniquement
- **Validation stricte** - Tous inputs utilisateur validés/échappés  
- **Pas de SQL dynamique** - Paramètres préparés obligatoires
- **Gestion d'erreurs sécurisée** - Pas d'exposition stack traces/infos sensibles
- **Dépendances vérifiées** - Scan sécurité avant ajout

## ⚙️ Standards

- **Tests obligatoires** pour chaque fonctionnalité
- **Code simple et lisible** avant optimisation prématurée
- **Documentation** des fonctions publiques
- **Respect linting** et formatage projet