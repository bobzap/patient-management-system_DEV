/*
  Warnings:

  - You are about to drop the column `civilite` on the `Patient` table. All the data in the column will be lost.
  - Added the required column `civilites` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Entretien" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "numeroEntretien" INTEGER NOT NULL,
    "dateCreation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateModification" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'brouillon',
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "baseEntretienId" INTEGER,
    "donneesEntretien" TEXT NOT NULL,
    CONSTRAINT "Entretien_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FormField" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sectionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "listId" TEXT,
    "defaultValue" TEXT,
    "validation" TEXT,
    "positionX" INTEGER NOT NULL DEFAULT 0,
    "positionY" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FormField_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "FormSection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FormField_listId_fkey" FOREIGN KEY ("listId") REFERENCES "ListCategory" ("listId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FormField" ("createdAt", "defaultValue", "id", "label", "listId", "name", "order", "positionX", "positionY", "required", "sectionId", "type", "updatedAt", "validation") SELECT "createdAt", "defaultValue", "id", "label", "listId", "name", "order", "positionX", "positionY", "required", "sectionId", "type", "updatedAt", "validation" FROM "FormField";
DROP TABLE "FormField";
ALTER TABLE "new_FormField" RENAME TO "FormField";
CREATE INDEX "FormField_sectionId_order_idx" ON "FormField"("sectionId", "order");
CREATE INDEX "FormField_listId_idx" ON "FormField"("listId");
CREATE UNIQUE INDEX "FormField_sectionId_name_key" ON "FormField"("sectionId", "name");
CREATE TABLE "new_FormSection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "formId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FormSection_formId_fkey" FOREIGN KEY ("formId") REFERENCES "FormConfiguration" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FormSection" ("createdAt", "formId", "id", "label", "name", "order", "updatedAt") SELECT "createdAt", "formId", "id", "label", "name", "order", "updatedAt" FROM "FormSection";
DROP TABLE "FormSection";
ALTER TABLE "new_FormSection" RENAME TO "FormSection";
CREATE INDEX "FormSection_formId_order_idx" ON "FormSection"("formId", "order");
CREATE UNIQUE INDEX "FormSection_formId_name_key" ON "FormSection"("formId", "name");
CREATE TABLE "new_ListItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ListItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ListCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ListItem" ("categoryId", "createdAt", "id", "order", "updatedAt", "value") SELECT "categoryId", "createdAt", "id", "order", "updatedAt", "value" FROM "ListItem";
DROP TABLE "ListItem";
ALTER TABLE "new_ListItem" RENAME TO "ListItem";
CREATE INDEX "ListItem_categoryId_order_idx" ON "ListItem"("categoryId", "order");
CREATE UNIQUE INDEX "ListItem_categoryId_value_key" ON "ListItem"("categoryId", "value");
CREATE TABLE "new_Patient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "civilites" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "etatCivil" TEXT NOT NULL,
    "poste" TEXT NOT NULL,
    "numeroLigne" TEXT,
    "manager" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "horaire" TEXT,
    "contrat" TEXT NOT NULL,
    "tauxActivite" TEXT NOT NULL,
    "departement" TEXT NOT NULL,
    "dateEntree" TEXT NOT NULL,
    "anciennete" TEXT NOT NULL,
    "tempsTrajetAller" TEXT NOT NULL,
    "tempsTrajetRetour" TEXT NOT NULL,
    "typeTransport" TEXT NOT NULL,
    "numeroEntretien" INTEGER,
    "nomEntretien" TEXT,
    "dateEntretien" TEXT,
    "heureDebut" TEXT,
    "heureFin" TEXT,
    "duree" TEXT,
    "typeEntretien" TEXT,
    "consentement" TEXT,
    "dateCreation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Patient" ("age", "anciennete", "consentement", "contrat", "createdAt", "dateCreation", "dateEntree", "dateEntretien", "dateNaissance", "departement", "duree", "etatCivil", "heureDebut", "heureFin", "horaire", "id", "manager", "nom", "nomEntretien", "numeroEntretien", "poste", "prenom", "tauxActivite", "tempsTrajetAller", "tempsTrajetRetour", "typeEntretien", "typeTransport", "updatedAt", "zone") SELECT "age", "anciennete", "consentement", "contrat", "createdAt", "dateCreation", "dateEntree", "dateEntretien", "dateNaissance", "departement", "duree", "etatCivil", "heureDebut", "heureFin", "horaire", "id", "manager", "nom", "nomEntretien", "numeroEntretien", "poste", "prenom", "tauxActivite", "tempsTrajetAller", "tempsTrajetRetour", "typeEntretien", "typeTransport", "updatedAt", "zone" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "FormConfiguration_pageId_idx" ON "FormConfiguration"("pageId");
