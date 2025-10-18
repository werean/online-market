/*
  Warnings:

  - You are about to drop the column `token` on the `PasswordResetToken` table. All the data in the column will be lost.
  - You are about to drop the column `used` on the `PasswordResetToken` table. All the data in the column will be lost.
  - Added the required column `resendAvailableAt` to the `PasswordResetToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenHash` to the `PasswordResetToken` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "resendAvailableAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "verified" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_PasswordResetToken" ("createdAt", "email", "expiresAt", "id") SELECT "createdAt", "email", "expiresAt", "id" FROM "PasswordResetToken";
DROP TABLE "PasswordResetToken";
ALTER TABLE "new_PasswordResetToken" RENAME TO "PasswordResetToken";
CREATE UNIQUE INDEX "PasswordResetToken_email_key" ON "PasswordResetToken"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
