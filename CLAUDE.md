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

## 🏗️ Workflow de Développement Obligatoire

### 📋 Gestion des Tâches et Sessions

**OBLIGATOIRE pour chaque instance Claude** :

1. **Début de Session** :
   - Lire `tasks/sessions.md` pour historique et contexte projet
   - Lire `tasks/todo.md` (peut être vide si tout terminé)
   - Utiliser **TodoWrite** pour créer nouveau plan basé sur demande utilisateur
   - Marquer tâches `in_progress` avant de commencer

2. **Pendant l'Exécution** :
   - Mettre à jour todos en temps réel avec TodoWrite
   - Marquer `completed` immédiatement après chaque tâche finie
   - Supprimer tâches terminées de `todo.md` (garder seulement en cours/pending)

3. **Fin de Session** :
   - Vider `tasks/todo.md` si toutes tâches terminées
   - Ajouter entrée complète dans `tasks/sessions.md` avec date et réalisations
   - Noter points d'attention pour prochaines sessions

### 📂 Structure des Fichiers de Suivi

```
tasks/
├── todo.md          # Plan actuel + historique tâches
├── sessions.md      # Journal sessions avec dates/réalisations
└── architecture.md  # Notes évolution architecture
```

### 🔄 Workflow Session Standard

1. **Analyse** → Contexte via `tasks/` + identification fichiers pertinents
2. **Plan** → TodoWrite avec actions détaillées basées sur demande utilisateur
3. **Validation** → Si complexe, utiliser exit_plan_mode pour révision
4. **Exécution** → Étape par étape avec mise à jour todos temps réel
5. **Documentation** → Modifications claires + fichiers modifiés
6. **Traçabilité** → Mise à jour `sessions.md` avec résumé succinct + date
7. **Continuité** → Points d'attention pour prochaine instance

### 📝 Format Session Standard

**tasks/sessions.md** :
```markdown
## YYYY-MM-DD - [Titre Session]
**Durée**: Xh **Status**: ✅/⏳/❌
**Objectif**: Description succincte
**Réalisations**:
- Point 1 avec référence fichier:ligne
- Point 2
**Fichiers modifiés**: `file:line`
**Points d'attention**: Notes pour suite
```

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
- **Persistance critique**: Sauvegarde auto toutes les 10 secondes
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