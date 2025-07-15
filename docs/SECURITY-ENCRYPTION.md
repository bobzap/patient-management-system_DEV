# 🔐 Guide de Sécurité - Chiffrement des Données

## Vue d'ensemble

Le système Vital Sync implémente un chiffrement AES-256-CBC pour protéger les données sensibles des patients et des entretiens. Ce document explique le fonctionnement, la configuration et la maintenance du système de chiffrement.

## 🛡️ Sécurité du chiffrement

- **Algorithme** : AES-256-CBC (Advanced Encryption Standard)
- **Taille de clé** : 256 bits
- **Vecteur d'initialisation** : 16 bytes aléatoires par chiffrement
- **Dérivation de clé** : PBKDF2 avec SHA-256
- **Stockage** : Données chiffrées stockées au format JSON en base

## 🛡️ Données protégées

### Données patients chiffrées
- **Nom** : Nom de famille du patient
- **Prénom** : Prénom du patient  
- **Date de naissance** : Date de naissance complète
- **Numéro de ligne** : Identifiant interne (si présent)

### Données d'entretien chiffrées
- **Données d'entretien** : Contenu JSON complet des entretiens
- **Métadonnées** : Informations complémentaires sensibles

## 🔧 Configuration initiale

### 1. Génération des clés de chiffrement

```bash
# Génération des clés pour l'environnement
npm run encryption:generate

# Configuration complète (génération + .env.example)
npm run encryption:setup
```

### 2. Configuration des variables d'environnement

Ajoutez les variables suivantes à votre fichier `.env` :

```env
# Clés de chiffrement (générées par le script)
ENCRYPTION_KEY=your-256-bit-key-here
ENCRYPTION_SALT=your-salt-here

# Configuration optionnelle
ENCRYPTION_ENABLED=true
ENCRYPTION_LOG_LEVEL=info
```

### 3. Test du système

```bash
# Vérification du fonctionnement
npm run encryption:test

# Vérification de l'environnement de production
npm run encryption:check
```

## 🔄 Migration des données existantes

### Migration complète (recommandée)

```bash
# Migration complète avec sauvegarde
npm run migrate:encryption:full
```

### Migration étape par étape

```bash
# 1. Création d'une sauvegarde
npm run migrate:encryption:backup

# 2. Migration des patients
node scripts/migrate-encryption.js patients

# 3. Migration des entretiens
node scripts/migrate-encryption.js entretiens

# 4. Vérification de l'intégrité
npm run migrate:encryption:verify
```

## 🏗️ Architecture technique

### Algorithme de chiffrement
- **Algorithme** : AES-256-GCM
- **Longueur de clé** : 256 bits (32 bytes)
- **Longueur IV** : 128 bits (16 bytes)  
- **Longueur du tag** : 128 bits (16 bytes)

### Structure des données chiffrées

```typescript
interface EncryptedData {
  encrypted: string;  // Données chiffrées (hex)
  iv: string;        // Vecteur d'initialisation (hex)
  tag: string;       // Tag d'authentification GCM (hex)
  version: string;   // Version du chiffrement ("1.0")
}
```

### Middlewares Prisma

Le système utilise des middlewares Prisma pour le chiffrement/déchiffrement automatique :

```typescript
// Chiffrement automatique lors de l'écriture
prisma.$use(encryptionMiddleware);

// Déchiffrement automatique lors de la lecture
prisma.$use(decryptionMiddleware);
```

## 🔍 Utilisation dans le code

### Chiffrement manuel

```typescript
import { encryptString, decryptString } from '@/lib/encryption';

// Chiffrement
const encrypted = encryptString('Données sensibles');

// Déchiffrement
const decrypted = decryptString(encrypted);
```

### Chiffrement des données patient

```typescript
import { encryptPatientData, decryptPatientData } from '@/lib/encryption';

// Chiffrement automatique des champs sensibles
const encryptedPatient = encryptPatientData(patient);

// Déchiffrement automatique
const decryptedPatient = decryptPatientData(encryptedPatient);
```

### Vérification du chiffrement

```typescript
import { isEncrypted } from '@/lib/encryption';

// Vérification si une donnée est chiffrée
if (isEncrypted(data)) {
  console.log('Données chiffrées détectées');
}
```

## 📊 Monitoring et logs

### Logs de chiffrement

Le système génère des logs détaillés :

```
🔒 Chiffrement des données patient...
🔓 Déchiffrement des données patient (unique)...
```

### Vérification de l'intégrité

```bash
# Vérification régulière de l'intégrité
npm run migrate:encryption:verify
```

## 🚨 Procédures d'urgence

### Rotation des clés

1. **Génération de nouvelles clés** :
   ```bash
   npm run encryption:generate
   ```

2. **Mise à jour des variables d'environnement**

3. **Migration des données** :
   ```bash
   npm run migrate:encryption:full
   ```

### Récupération en cas de perte de clés

⚠️ **IMPORTANT** : Sans les clés de chiffrement, les données sont **définitivement perdues**.

Procédure de récupération :
1. Restaurer les clés depuis la sauvegarde sécurisée
2. Redémarrer l'application
3. Vérifier l'intégrité des données

### Désactivation temporaire

En cas d'urgence, le chiffrement peut être désactivé :

```env
ENCRYPTION_ENABLED=false
```

⚠️ **Attention** : Les nouvelles données ne seront plus chiffrées.

## 🔒 Bonnes pratiques de sécurité

### Gestion des clés

1. **Sauvegarde sécurisée** :
   - Stockage dans un coffre-fort numérique
   - Accès limité aux administrateurs
   - Chiffrement des sauvegardes

2. **Rotation régulière** :
   - Changement des clés tous les 6 mois
   - Procédure documentée et testée
   - Historique des rotations

3. **Séparation des environnements** :
   - Clés différentes pour dev/test/prod
   - Pas de clés de production en développement

### Monitoring de sécurité

1. **Surveillance des logs** :
   - Détection d'erreurs de chiffrement
   - Monitoring des performances
   - Alertes automatiques

2. **Audit régulier** :
   - Vérification de l'intégrité mensuelle
   - Test de récupération trimestriel
   - Revue des accès annuelle

### Déploiement sécurisé

1. **Variables d'environnement** :
   - Utilisation d'un gestionnaire de secrets
   - Jamais de clés en dur dans le code
   - Chiffrement des configurations

2. **Accès restreint** :
   - Principe du moindre privilège
   - Authentification multi-facteurs
   - Logs d'accès détaillés

## 📋 Checklist de déploiement

### Avant le déploiement
- [ ] Clés de chiffrement générées et sauvegardées
- [ ] Variables d'environnement configurées
- [ ] Tests de chiffrement réussis
- [ ] Sauvegarde des données existantes
- [ ] Migration des données testée

### Après le déploiement
- [ ] Vérification de l'intégrité des données
- [ ] Tests fonctionnels complets
- [ ] Monitoring actif
- [ ] Documentation mise à jour
- [ ] Formation de l'équipe

## 🆘 Support et maintenance

### Contacts d'urgence
- **Administrateur système** : [contact-admin]
- **Développeur principal** : [contact-dev]
- **Support technique** : [contact-support]

### Procédures de support
1. **Niveau 1** : Vérification des logs et redémarrage
2. **Niveau 2** : Analyse des erreurs et correction
3. **Niveau 3** : Récupération des données et restauration

### Maintenance préventive
- **Quotidienne** : Vérification des logs
- **Hebdomadaire** : Test de performance
- **Mensuelle** : Audit d'intégrité
- **Trimestrielle** : Test de récupération
- **Annuelle** : Rotation des clés

## 📚 Ressources complémentaires

- [Documentation officielle AES-GCM](https://csrc.nist.gov/publications/detail/sp/800-38d/final)
- [Guides de sécurité Prisma](https://www.prisma.io/docs/concepts/components/prisma-client/middleware)
- [Bonnes pratiques Node.js Crypto](https://nodejs.org/api/crypto.html)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)

---

**Version** : 1.0  
**Dernière mise à jour** : [Date]  
**Auteur** : Équipe Vital Sync  
**Classification** : Confidentiel