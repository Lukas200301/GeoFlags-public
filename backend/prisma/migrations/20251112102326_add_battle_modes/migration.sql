-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GameModeType" ADD VALUE 'BATTLE_FLAG_SPEED';
ALTER TYPE "GameModeType" ADD VALUE 'BATTLE_CAPITAL_RUSH';
ALTER TYPE "GameModeType" ADD VALUE 'BATTLE_GEOGRAPHY_DUEL';
ALTER TYPE "GameModeType" ADD VALUE 'BATTLE_EXPERT_SHOWDOWN';
