/*
  Warnings:

  - The primary key for the `VipLevel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `VipLevel` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "vipLevel" INTEGER NOT NULL DEFAULT 0,
    "totalInvested" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userid") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Profile_vipLevel_fkey" FOREIGN KEY ("vipLevel") REFERENCES "VipLevel" ("level") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("createdAt", "id", "totalInvested", "updatedAt", "userId", "vipLevel") SELECT "createdAt", "id", "totalInvested", "updatedAt", "userId", "vipLevel" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
CREATE TABLE "new_VipLevel" (
    "level" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "profitPerOrder" REAL NOT NULL DEFAULT 0.0,
    "appsPerSet" INTEGER NOT NULL,
    "minBalance" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_VipLevel" ("appsPerSet", "createdAt", "level", "minBalance", "name", "profitPerOrder") SELECT "appsPerSet", "createdAt", "level", "minBalance", "name", "profitPerOrder" FROM "VipLevel";
DROP TABLE "VipLevel";
ALTER TABLE "new_VipLevel" RENAME TO "VipLevel";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
