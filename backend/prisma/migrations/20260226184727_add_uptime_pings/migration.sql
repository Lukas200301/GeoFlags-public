-- AlterEnum
ALTER TYPE "GameModeType" ADD VALUE 'SILHOUETTE';

-- CreateTable
CREATE TABLE "uptime_pings" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseTime" INTEGER NOT NULL,
    "isUp" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,

    CONSTRAINT "uptime_pings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "uptime_pings_timestamp_idx" ON "uptime_pings"("timestamp");
