# Guide d'intégration du système de consentement LPD

## Vue d'ensemble

Ce guide décrit l'intégration complète du système de consentement LPD dans VitalSync, conforme à la législation suisse sur la protection des données.

## Architecture mise en place

### 1. Modèle de données

**Tables ajoutées :**
- `patient_consents` : Stockage des consentements patients
- `consent_history` : Historique des modifications
- `consent_status` : Énumération des statuts possibles

**Statuts disponibles :**
- `ACCEPTED` : Consentement accordé
- `REFUSED` : Consentement refusé
- `PENDING` : En attente de clarification
- `REVOKED` : Consentement révoqué
- `EXPIRED` : Consentement expiré

### 2. Routes API

**Endpoints créés :**
- `GET /api/patients/[id]/consent` : Récupérer le consentement
- `POST /api/patients/[id]/consent` : Créer/modifier le consentement
- `DELETE /api/patients/[id]/consent` : Supprimer (admin uniquement)
- `GET /api/consent/bulk` : Statistiques globales
- `POST /api/consent/bulk` : Modifications en lot (admin)

### 3. Composants UI

**Composants développés :**
- `ConsentManagement` : Composant principal de gestion
- `ConsentDialog` : Dialogue de modification
- `ConsentStatusBadge` : Badge de statut visuel
- `ConsentHistory` : Historique des modifications
- `ConsentAlert` : Alertes contextuelles

## Utilisation

### 1. Création de patient

Le consentement est intégré dans le formulaire de création patient comme 3ème étape :

```tsx
import { ConsentManagement } from '@/components/consent';

// Dans le formulaire patient
<ConsentManagement
  patientId={0}
  patientName={`${formData.civilites} ${formData.nom} ${formData.prenom}`}
  isCreationMode={true}
  onConsentChange={setConsentData}
/>
```

### 2. Dossier patient

Le widget de consentement est intégré dans la colonne latérale :

```tsx
import { ConsentManagement } from '@/components/consent';

// Dans PatientDetails
<ConsentManagement
  patientId={patient.id!}
  patientName={`${patient.civilites} ${patient.nom} ${patient.prenom}`}
  className="bg-transparent"
/>
```

### 3. Alertes contextuelles

Les alertes s'affichent automatiquement selon le statut :

```tsx
import { ConsentAlert } from '@/components/consent';

<ConsentAlert 
  status="REFUSED"
  patientName="Martin Dubois"
  onDismiss={() => setShowAlert(false)}
  showDismiss
/>
```

## Migration de la base de données

**Étapes à suivre :**

1. Exécuter le script SQL de migration :
```bash
psql -d your_database -f prisma/migrations/add_consent_tables.sql
```

2. Ou utiliser Prisma (si configuré) :
```bash
npm run db:migrate
```

## Sécurité et conformité

### Chiffrement des données

Les données sensibles sont automatiquement chiffrées :
- Commentaires utilisateur
- Adresses IP (si nécessaire)
- Historique des modifications

### Audit et traçabilité

Chaque action est tracée :
- Date et heure de modification
- Utilisateur responsable
- Raison de la modification
- Adresse IP et user agent

### Permissions

- **Utilisateurs normaux** : Peuvent consulter et modifier
- **Administrateurs** : Peuvent supprimer et faire des modifications en lot

## Tests

### Test manuel

Utiliser le composant de test :

```tsx
import { ConsentTest } from '@/components/consent/ConsentTest';

// Accéder à /test-consent pour valider l'intégration
```

### Tests automatisés

```bash
# Lancer les tests
npm run test

# Tests spécifiques au consentement
npm run test -- --testNamePattern="Consent"
```

## Maintenance

### Monitoring

- Surveiller les logs des API de consentement
- Vérifier les statistiques de compliance
- Auditer les modifications administratives

### Mise à jour de la version LPD

Lorsque la législation change :

1. Mettre à jour la version dans le schéma
2. Créer une migration pour les consentements existants
3. Informer les utilisateurs des changements

## Dépannage

### Problèmes courants

1. **Consentement non trouvé** : Vérifier la relation patient-consentement
2. **Permissions insuffisantes** : Contrôler les rôles utilisateur
3. **Erreurs de chiffrement** : Vérifier la configuration des clés

### Logs utiles

```bash
# Logs API
tail -f logs/api.log | grep consent

# Logs base de données
tail -f logs/db.log | grep patient_consents
```

## API Documentation

### Créer un consentement

```http
POST /api/patients/123/consent
Content-Type: application/json

{
  "status": "ACCEPTED",
  "commentaire": "Consentement donné lors de la consultation",
  "raisonModification": "Consentement initial"
}
```

### Récupérer les statistiques

```http
GET /api/consent/bulk?departement=Chirurgie&includePending=true
```

## Conformité LPD

### Points clés respectés

- ✅ Consentement explicite requis
- ✅ Possibilité de révocation
- ✅ Traçabilité complète
- ✅ Sécurité des données
- ✅ Limitation des finalités
- ✅ Transparence sur l'utilisation

### Obligations légales

- Informer clairement sur l'utilisation des données
- Permettre la révocation à tout moment
- Limiter l'utilisation aux finalités déclarées
- Assurer la sécurité des données
- Tenir un registre des traitements

## Support

Pour toute question ou problème :

1. Consulter les logs d'application
2. Vérifier la documentation API
3. Contacter l'équipe de développement
4. Créer un ticket de support si nécessaire

---

*Ce guide est maintenu par l'équipe de développement VitalSync. Dernière mise à jour : Juillet 2025*