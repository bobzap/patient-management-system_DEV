-- Créer la table EventType
CREATE TABLE "EventType" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "color" TEXT DEFAULT '#3b82f6',
  "icon" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Créer un index unique sur le nom
CREATE UNIQUE INDEX "EventType_name_key" ON "EventType"("name");

-- Ajouter une nouvelle colonne pour stocker temporairement les types
ALTER TABLE "CalendarEvent" ADD COLUMN "eventTypeString" TEXT;

-- Copier les données de eventType vers eventTypeString
UPDATE "CalendarEvent" SET "eventTypeString" = "eventType";

-- Créer la table de jonction pour la relation many-to-many
CREATE TABLE "_EventTypeToCalendarEvent" (
  "A" INTEGER NOT NULL,
  "B" INTEGER NOT NULL,
  FOREIGN KEY ("A") REFERENCES "EventType" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("B") REFERENCES "CalendarEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Créer les types d'événements à partir des valeurs existantes
INSERT INTO "EventType" ("name", "color", "updatedAt")
SELECT DISTINCT "eventType", 
  CASE "eventType"
    WHEN 'Entretien Infirmier' THEN '#3b82f6'
    WHEN 'Visite Médicale' THEN '#22c55e'
    WHEN 'Rappel Médical' THEN '#eab308'
    WHEN 'Étude de Poste' THEN '#a855f7'
    WHEN 'Entretien Manager' THEN '#6366f1'
    WHEN 'Limitation de Travail' THEN '#ef4444'
    WHEN 'Suivi Post-AT' THEN '#f97316'
    WHEN 'Vaccination' THEN '#14b8a6'
    WHEN 'Formation' THEN '#ec4899'
    ELSE '#71717a'
  END,
  CURRENT_TIMESTAMP
FROM "CalendarEvent"
WHERE "eventType" IS NOT NULL;
