# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🏥 Système de Gestion Médicale - Vue d'ensemble

**Vital Sync** - Système de gestion médicale sécurisé avec chiffrement AES-256 et authentification 2FA obligatoire.

### Stack Technique
- **Next.js 15.3.3** (App Router) + TypeScript
- **PostgreSQL** + Prisma ORM 5.7.1
- **NextAuth.js 4.24.5** avec 2FA/MFA personnalisé
- **Chiffrement AES-256-CBC** pour données sensibles
- **Tailwind CSS** + Radix UI, design glassmorphisme

## 🚀 Commandes Essentielles

```bash
# Développement
npm run dev                 # Serveur développement
npm run build              # Build production
npm run type-check         # Validation TypeScript

# Base de données
npm run db:migrate         # Migrations Prisma
npm run db:studio          # Interface Prisma Studio
npm run db:seed            # Peuplement BDD

# Sécurité
npm run encryption:setup   # Initialisation clés chiffrement
npm run auth:create-admin  # Créer utilisateur admin

# Docker
npm run dev:up            # Environnement dev
npm run prod:up           # Environnement production
```

## 🔐 Architecture Sécurité (CRITIQUE)

### Chiffrement Multi-Couches
- **Méthode**: AES-256-CBC transparent via middleware Prisma
- **Champs chiffrés**: 21 champs sensibles (noms patients, données médicales)
- **Localisation**: `src/lib/encryption.ts`, `src/lib/prisma-encryption.ts`
- **Conformité**: RGPD ready avec anonymisation complète

### Authentification 2FA Obligatoire
- **Algorithme**: TOTP (RFC 6238) + 10 codes backup chiffrés
- **Intégration**: NextAuth avec middleware custom
- **Flux**: Obligatoire pour tous utilisateurs
- **Score sécurité**: 98/100 après audit

### Gestion des Rôles
```typescript
enum UserRole {
  ADMIN,           // Accès complet système
  INFIRMIER,       // Gestion patients + entretiens
  INFIRMIER_CHEF,  // + supervision équipe
  MEDECIN          // + validation médicale
}
```

## 📁 Structure Critique du Code

### Composants Principaux
```
src/
├── app/api/               # Routes API RESTful sécurisées
│   ├── patients/          # CRUD patients chiffrés
│   ├── entretiens/        # Gestion entretiens médicaux
│   └── calendar/          # Calendrier avec événements chiffrés
├── components/
│   ├── entretiens/        # Formulaires médicaux 4 sections
│   ├── patients/          # Interface gestion patients
│   └── calendar/          # Système calendrier
├── hooks/
│   ├── useEntretienTimer.ts  # Timer entretiens avec persistance
│   └── useNavigationGuard.ts # Protection navigation non sauvegardée
├── lib/
│   ├── encryption.ts      # Système chiffrement AES-256
│   ├── auth.ts           # Configuration NextAuth + 2FA
│   └── prisma.ts         # Client Prisma avec middleware
└── utils/
    ├── entretien-data.ts  # Validation/merge données entretiens
    └── json.ts           # Parsing JSON sécurisé
```

### Patterns Architecturaux Clés

**1. Formulaires Médicaux (Entretiens)**
- **Structure**: 4 sections (Santé Travail, Examen Clinique, IMAA, Conclusion)
- **Timer intégré**: Pause/reprise automatique, sauvegarde périodique
- **Validation**: Schémas Zod pour intégrité données
- **Localisation**: `src/components/entretiens/EntretienForm/`

**2. Gestion Timer Entretiens**
- **Hook principal**: `useEntretienTimer.ts`
- **Fonctionnalités**: Persistance BDD, gestion pauses, sauvegarde auto
- **API**: `/api/entretiens/[id]/elapsed-time`, `/api/entretiens/[id]/timer`

**3. Système Calendrier**
- **Vues**: Mois, semaine, jour
- **Chiffrement**: Noms patients et détails événements
- **Types**: Configurable via interface admin

**4. Protection Navigation**
- **Hook**: `useNavigationGuard.ts` pour changements non sauvegardés
- **Intégration**: Formulaires avec état dirty
- **UX**: Confirmation avant perte données

## 🗄️ Modèles Base de Données (Prisma)

### Modèles Critiques
```typescript
model Patient {
  // 9 champs chiffrés automatiquement
  nom: String @encrypted
  prenom: String @encrypted
  email: String? @encrypted
  // ... autres champs sensibles
}

model Entretien {
  donneesEntretien: String @encrypted  // JSON entretien complet
  tempsEcoule: Int?                   // Secondes timer
  enPause: Boolean                    // État pause
}

model UserMFA {
  secretKey: String @encrypted        // Clé TOTP
  backupCodes: String @encrypted      // Codes secours
}
```

## 🔒 Sécurité (Non-négociable)

- **Jamais de secrets hardcodés** - Variables d'environnement uniquement
- **Validation stricte** - Tous inputs utilisateur validés/échappés  
- **Pas de SQL dynamique** - Paramètres préparés obligatoires
- **Gestion d'erreurs sécurisée** - Pas d'exposition stack traces/infos sensibles
- **Dépendances vérifiées** - Scan sécurité avant ajout
- **Chiffrement obligatoire** - Toujours tester encryption pour nouveaux champs sensibles
- **Audit 2FA** - Vérifier intégration pour nouveaux flux authentification

## ⚙️ Standards de Développement

- **Tests obligatoires** pour chaque fonctionnalité
- **Code simple et lisible** avant optimisation prématurée
- **Documentation** des fonctions publiques
- **Respect linting** et formatage projet
- **Pattern de composants**: Feature-based organization
- **TypeScript strict**: Mode strict activé, types complets
- **Gestion d'état**: React hooks pattern, pas de store externe

## 🚨 Points d'Attention Critiques

### Chiffrement
- **Middleware automatique**: Tous champs marqués `@encrypted` sont transparents
- **Test obligatoire**: Vérifier chiffrement pour nouveaux champs sensibles
- **Performance**: Pas d'impact significant grâce au middleware

### Timer Entretiens
- **Persistance critique**: Sauvegarde auto temps (10s) + données (30s)
- **Gestion erreurs**: Graceful degradation si API indisponible
- **États cohérents**: Synchronisation pause/reprise avec BDD

### API Routes
- **Protection middleware**: Toutes routes protégées par auth + rôles
- **Pattern RESTful**: GET/POST/PUT/DELETE avec validation Zod
- **Gestion erreurs**: Messages utilisateur sécurisés

### Variables d'Environnement Essentielles
```bash
DATABASE_URL         # PostgreSQL
ENCRYPTION_KEY       # AES-256 (généré via npm run encryption:setup)
NEXTAUTH_SECRET      # JWT signing
MFA_ISSUER          # Nom TOTP (ex: "Vital Sync")
```

## 🔄 Processus de Validation Automatique

**PROCÉDURE OBLIGATOIRE** à exécuter lors de la validation d'une phase/tâche/plan :

### 1. **Phase de Nettoyage**
- Supprimer tout code de test/debug temporaire
- Éliminer les duplications de code
- Nettoyer les imports/exports inutiles
- Vérifier l'ordre des déclarations (éviter erreurs lexicales)

### 2. **Phase d'Optimisation**
- Vérifier les performances des nouvelles fonctionnalités
- Optimiser les requêtes API si nécessaire
- Valider les patterns React (hooks, callbacks, effects)
- Contrôler la gestion mémoire

### 3. **Phase de Validation**
- Tester toutes les fonctionnalités implémentées
- Vérifier la compatibilité avec l'existant
- Valider la sécurité (chiffrement, authentification)
- Contrôler le respect des bonnes pratiques

### 4. **Phase de Documentation**
- Mettre à jour `tasks/sessions.md` avec détails complets
- Actualiser `tasks/todo.md` avec statuts finaux
- Documenter les optimisations effectuées
- Noter les tests réalisés et résultats

### 5. **Phase de Stabilisation**
- Vérifier la stabilité du serveur
- Résoudre les conflits de ports/configuration
- Tester en conditions réelles
- Valider l'expérience utilisateur

### 📋 Checklist de Validation

**Avant de marquer une tâche comme terminée** :
- [ ] Code nettoyé et optimisé
- [ ] Fonctionnalités testées et opérationnelles
- [ ] Documentation mise à jour
- [ ] Aucune régression détectée
- [ ] Serveur stable et fonctionnel

