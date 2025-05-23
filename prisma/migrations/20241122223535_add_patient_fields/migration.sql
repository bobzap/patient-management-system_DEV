-- CreateTable
CREATE TABLE "Patient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "civilite" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "etatCivil" TEXT NOT NULL,
    "poste" TEXT NOT NULL,
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
