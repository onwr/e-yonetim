-- DropForeignKey
ALTER TABLE `smsverification` DROP FOREIGN KEY `SmsVerification_tenantId_fkey`;

-- AlterTable
ALTER TABLE `smsverification` ADD COLUMN `payload` JSON NULL,
    MODIFY `tenantId` VARCHAR(191) NULL,
    MODIFY `type` ENUM('register', 'login', 'forgot_password') NOT NULL;

-- CreateTable
CREATE TABLE `PuantajLock` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `isLocked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PuantajLock_tenantId_year_month_key`(`tenantId`, `year`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SmsVerification` ADD CONSTRAINT `SmsVerification_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PuantajLock` ADD CONSTRAINT `PuantajLock_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
