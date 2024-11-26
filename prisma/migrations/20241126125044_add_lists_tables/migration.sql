/*
  Warnings:

  - You are about to drop the column `code` on the `ListCategory` table. All the data in the column will be lost.
  - Added the required column `listId` to the `ListCategory` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ListCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ListCategory" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "ListCategory";
DROP TABLE "ListCategory";
ALTER TABLE "new_ListCategory" RENAME TO "ListCategory";
CREATE UNIQUE INDEX "ListCategory_listId_key" ON "ListCategory"("listId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
