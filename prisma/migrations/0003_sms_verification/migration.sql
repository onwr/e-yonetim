-- CreateTable
CREATE TABLE `SmsVerification` (
  `id` VARCHAR(191) NOT NULL,
  `tenantId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `telefon` VARCHAR(191) NOT NULL,
  `type` ENUM('register', 'login') NOT NULL,
  `codeHash` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `usedAt` DATETIME(3) NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `SmsVerification_tenantId_telefon_type_createdAt_idx`(`tenantId`, `telefon`, `type`, `createdAt`),
  INDEX `SmsVerification_tenantId_userId_type_createdAt_idx`(`tenantId`, `userId`, `type`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SmsVerification` ADD CONSTRAINT `SmsVerification_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SmsVerification` ADD CONSTRAINT `SmsVerification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

