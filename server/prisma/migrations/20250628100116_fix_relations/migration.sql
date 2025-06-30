-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EarningsHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EarningsHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EarningsHistory" ("amount", "date", "id", "userId") SELECT "amount", "date", "id", "userId" FROM "EarningsHistory";
DROP TABLE "EarningsHistory";
ALTER TABLE "new_EarningsHistory" RENAME TO "EarningsHistory";
CREATE TABLE "new_Investment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastProfitDate" DATETIME,
    CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Investment" ("amount", "id", "lastProfitDate", "startDate", "userId") SELECT "amount", "id", "lastProfitDate", "startDate", "userId" FROM "Investment";
DROP TABLE "Investment";
ALTER TABLE "new_Investment" RENAME TO "Investment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
