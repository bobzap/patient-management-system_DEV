-- Migration pour ajouter les tables de consentement
-- À exécuter manuellement avec psql ou pgAdmin

-- Créer l'énumération pour le statut du consentement
CREATE TYPE "consent_status" AS ENUM ('ACCEPTED', 'REFUSED', 'PENDING', 'REVOKED', 'EXPIRED');

-- Créer la table patient_consents
CREATE TABLE "patient_consents" (
    "id" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "status" "consent_status" NOT NULL DEFAULT 'PENDING',
    "dateConsent" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateModification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "versionLpd" TEXT NOT NULL DEFAULT '1.0',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "commentaire" TEXT,
    "createdBy" TEXT,
    "modifiedBy" TEXT,

    CONSTRAINT "patient_consents_pkey" PRIMARY KEY ("id")
);

-- Créer la table consent_history
CREATE TABLE "consent_history" (
    "id" TEXT NOT NULL,
    "consentId" TEXT NOT NULL,
    "ancienStatus" "consent_status" NOT NULL,
    "nouveauStatus" "consent_status" NOT NULL,
    "dateModification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raisonModification" TEXT,
    "modifiePar" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "consent_history_pkey" PRIMARY KEY ("id")
);

-- Créer les index et contraintes
CREATE UNIQUE INDEX "patient_consents_patientId_key" ON "patient_consents"("patientId");

-- Ajouter les clés étrangères
ALTER TABLE "patient_consents" ADD CONSTRAINT "patient_consents_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "consent_history" ADD CONSTRAINT "consent_history_consentId_fkey" FOREIGN KEY ("consentId") REFERENCES "patient_consents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Trigger pour mettre à jour automatiquement dateModification
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."dateModification" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patient_consents_modified
    BEFORE UPDATE ON "patient_consents"
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Optionnel : Ajouter des données de test
-- INSERT INTO "patient_consents" ("id", "patientId", "status", "commentaire", "createdBy", "modifiedBy") 
-- VALUES ('test1', 1, 'ACCEPTED', 'Consentement initial', 'system', 'system');