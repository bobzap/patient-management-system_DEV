-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "eventType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planifie',
    "patientId" INTEGER,
    "entretienId" INTEGER,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "recurrence" TEXT,
    "parentEventId" INTEGER,
    CONSTRAINT "CalendarEvent_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CalendarEvent_entretienId_fkey" FOREIGN KEY ("entretienId") REFERENCES "Entretien" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CalendarEvent_patientId_idx" ON "CalendarEvent"("patientId");

-- CreateIndex
CREATE INDEX "CalendarEvent_entretienId_idx" ON "CalendarEvent"("entretienId");

-- CreateIndex
CREATE INDEX "CalendarEvent_startDate_endDate_idx" ON "CalendarEvent"("startDate", "endDate");
