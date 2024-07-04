/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Feedback` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isLiked" BOOLEAN NOT NULL,
    "messageId" INTEGER NOT NULL,
    CONSTRAINT "Feedback_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Feedback" ("id", "isLiked", "messageId") SELECT "id", "isLiked", "messageId" FROM "Feedback";
DROP TABLE "Feedback";
ALTER TABLE "new_Feedback" RENAME TO "Feedback";
CREATE UNIQUE INDEX "Feedback_messageId_key" ON "Feedback"("messageId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
