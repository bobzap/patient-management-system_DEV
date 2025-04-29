-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Entretien" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "numeroEntretien" INTEGER NOT NULL,
    "dateCreation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateModification" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'brouillon',
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "baseEntretienId" INTEGER,
    "donneesEntretien" TEXT NOT NULL,
    "tempsDebut" DATETIME,
    "tempsFin" DATETIME,
    "tempsPause" INTEGER,
    "enPause" BOOLEAN NOT NULL DEFAULT false,
    "dernierePause" DATETIME,
    CONSTRAINT "Entretien_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Entretien" ("baseEntretienId", "dateCreation", "dateModification", "donneesEntretien", "id", "isTemplate", "numeroEntretien", "patientId", "status") SELECT "baseEntretienId", "dateCreation", "dateModification", "donneesEntretien", "id", "isTemplate", "numeroEntretien", "patientId", "status" FROM "Entretien";
DROP TABLE "Entretien";
ALTER TABLE "new_Entretien" RENAME TO "Entretien";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
