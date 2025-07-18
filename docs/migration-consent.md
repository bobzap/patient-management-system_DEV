# Migration du Système de Consentement

## Option 1 : Migration automatique (recommandée)

Exécutez le script de migration automatique :

```bash
node scripts/migrate-consent.js
```

Ce script :
- Corrige automatiquement le problème DIRECT_URL
- Exécute la migration Prisma
- Restaure votre configuration .env

## Option 2 : Migration manuelle

### Étape 1 : Corriger le fichier .env

Ajoutez cette ligne dans votre fichier `.env` :

```bash
DIRECT_URL=votre_database_url_ici
```

### Étape 2 : Exécuter la migration

```bash
npx prisma migrate dev --name add-consent-system
```

### Étape 3 : Vérifier la migration

```bash
npx prisma studio
```

Vérifiez que les tables suivantes sont créées :
- `patient_consents`
- `consent_history`
- Énumération `consent_status`

## Option 3 : Migration SQL directe

Si les options précédentes ne fonctionnent pas, exécutez directement le SQL :

```bash
psql -d votre_database -f prisma/migrations/add_consent_tables.sql
```

## Vérification post-migration

1. **Vérifier les tables** :
   ```sql
   \dt patient_consents
   \dt consent_history
   ```

2. **Tester l'API** :
   ```bash
   curl http://localhost:3000/api/patients/1/consent
   ```

3. **Vérifier l'interface** :
   - Aller dans un dossier patient
   - Cliquer sur le badge de consentement
   - Vérifier que la modale s'ouvre

## En cas de problème

1. **Erreur DIRECT_URL** :
   - Utilisez l'option 1 (script automatique)
   - Ou ajoutez manuellement DIRECT_URL dans .env

2. **Tables déjà existantes** :
   ```sql
   DROP TABLE IF EXISTS consent_history;
   DROP TABLE IF EXISTS patient_consents;
   DROP TYPE IF EXISTS consent_status;
   ```

3. **Permissions PostgreSQL** :
   ```sql
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
   ```

## Statut de la migration

- [ ] Tables créées
- [ ] API fonctionnelle
- [ ] Interface utilisateur testée
- [ ] Données de test ajoutées (optionnel)

## Données de test (optionnel)

```sql
-- Ajouter un consentement de test
INSERT INTO "patient_consents" (id, "patientId", status, commentaire, "createdBy", "modifiedBy") 
VALUES (gen_random_uuid(), 1, 'ACCEPTED', 'Consentement initial', 'system', 'system');
```