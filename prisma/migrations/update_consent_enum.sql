-- Migration pour retirer REVOKED et EXPIRED du enum ConsentStatus
-- À exécuter après la modification du schema Prisma

-- Créer le nouveau type enum sans REVOKED et EXPIRED
CREATE TYPE "consent_status_new" AS ENUM ('ACCEPTED', 'REFUSED', 'PENDING');

-- Migrer les données existantes (convertir REVOKED vers REFUSED et EXPIRED vers PENDING)
UPDATE "patient_consents" 
SET "status" = 'REFUSED' 
WHERE "status" = 'REVOKED';

UPDATE "patient_consents" 
SET "status" = 'PENDING' 
WHERE "status" = 'EXPIRED';

UPDATE "consent_history" 
SET "ancienStatus" = 'REFUSED' 
WHERE "ancienStatus" = 'REVOKED';

UPDATE "consent_history" 
SET "nouveauStatus" = 'REFUSED' 
WHERE "nouveauStatus" = 'REVOKED';

UPDATE "consent_history" 
SET "ancienStatus" = 'PENDING' 
WHERE "ancienStatus" = 'EXPIRED';

UPDATE "consent_history" 
SET "nouveauStatus" = 'PENDING' 
WHERE "nouveauStatus" = 'EXPIRED';

-- Modifier les colonnes pour utiliser le nouveau type
ALTER TABLE "patient_consents" 
ALTER COLUMN "status" TYPE "consent_status_new" 
USING ("status"::text::"consent_status_new");

ALTER TABLE "consent_history" 
ALTER COLUMN "ancienStatus" TYPE "consent_status_new" 
USING ("ancienStatus"::text::"consent_status_new");

ALTER TABLE "consent_history" 
ALTER COLUMN "nouveauStatus" TYPE "consent_status_new" 
USING ("nouveauStatus"::text::"consent_status_new");

-- Supprimer l'ancien type enum
DROP TYPE "consent_status";

-- Renommer le nouveau type
ALTER TYPE "consent_status_new" RENAME TO "consent_status";