/*
  Warnings:

  - You are about to drop the column `create_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isSeller` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "images" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "sellerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("createdAt", "description", "id", "images", "name", "price", "sellerId", "stock", "updatedAt") SELECT "createdAt", "description", "id", "images", "name", "price", "sellerId", "stock", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME
);
INSERT INTO "new_User" ("address", "deletedAt", "email", "id", "isDeleted", "name", "password", "updatedAt") SELECT "address", "deletedAt", "email", "id", "isDeleted", "name", "password", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Seller_email_key" ON "Seller"("email");
