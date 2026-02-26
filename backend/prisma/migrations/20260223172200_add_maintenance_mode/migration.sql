-- AlterTable
ALTER TABLE "system_settings" ADD COLUMN "maintenanceMode" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "system_settings" ADD COLUMN "maintenanceMessage" TEXT;
