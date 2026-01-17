/*
  Warnings:

  - You are about to drop the column `groupId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_groupId_fkey`;

-- DropIndex
DROP INDEX `User_groupId_fkey` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `groupId`,
    ADD COLUMN `rsvpStatus` ENUM('PENDING', 'ATTENDING', 'NOT_ATTENDING') NOT NULL DEFAULT 'PENDING',
    MODIFY `email` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `Group`;
