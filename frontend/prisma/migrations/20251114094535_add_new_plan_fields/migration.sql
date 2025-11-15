-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE', 'CUSTOM');

-- AlterTable
ALTER TABLE "plan_configs" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "badgeColor" TEXT,
ADD COLUMN     "basePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "durationMonths" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "features" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "firstYearDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "hasFreeTrial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPioneer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxActiveOffers" INTEGER,
ADD COLUMN     "maxFeaturedOffers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxStorage" INTEGER,
ADD COLUMN     "maxTeamMembers" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "nameEn" TEXT,
ADD COLUMN     "nameEs" TEXT,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slug" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tier" "PlanTier" NOT NULL DEFAULT 'CUSTOM',
ADD COLUMN     "trialDurationDays" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "plan_configs_slug_key" ON "plan_configs"("slug");

-- CreateIndex
CREATE INDEX "plan_configs_tier_idx" ON "plan_configs"("tier");

-- CreateIndex
CREATE INDEX "plan_configs_slug_idx" ON "plan_configs"("slug");

-- CreateIndex
CREATE INDEX "plan_configs_priority_idx" ON "plan_configs"("priority");