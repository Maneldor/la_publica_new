/*
  Warnings:

  - You are about to drop the `PlanConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'COMMUNITY_MANAGER', 'ADMIN', 'SUPER_ADMIN', 'COMPANY');

-- CreateEnum
CREATE TYPE "AnuncioType" AS ENUM ('GENERAL', 'URGENT', 'EVENT', 'MAINTENANCE', 'NEWS', 'ALERT', 'PROMOTION', 'REGULATION');

-- CreateEnum
CREATE TYPE "AnuncioStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AudienceType" AS ENUM ('ALL', 'EMPLOYEES', 'COMPANIES', 'SPECIFIC', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('PLATFORM', 'EMAIL', 'SMS', 'PUSH', 'ALL_CHANNELS');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('EMPLOYEE', 'COMPANY_OWNER', 'COMPANY_MEMBER', 'ACCOUNT_MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CompanyRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING');

-- DropTable
DROP TABLE "public"."PlanConfig";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "communityId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userType" "UserType" NOT NULL DEFAULT 'EMPLOYEE',
    "ownedCompanyId" TEXT,
    "memberCompanyId" TEXT,
    "companyRole" "CompanyRole",
    "cargo" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comunidad" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comunidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anuncio" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "type" "AnuncioType" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "status" "AnuncioStatus" NOT NULL DEFAULT 'DRAFT',
    "audience" "AudienceType" NOT NULL,
    "targetCommunities" TEXT[],
    "targetRoles" TEXT[],
    "publishAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "sendNotification" BOOLEAN NOT NULL DEFAULT false,
    "notificationChannels" "NotificationChannel"[],
    "imageUrl" TEXT,
    "attachmentUrl" TEXT,
    "externalUrl" TEXT,
    "tags" TEXT[],
    "isSticky" BOOLEAN NOT NULL DEFAULT false,
    "allowComments" BOOLEAN NOT NULL DEFAULT true,
    "slug" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "reactions" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "sharesCount" INTEGER NOT NULL DEFAULT 0,
    "communityId" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Anuncio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnuncioComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "attachmentUrl" TEXT,
    "parentId" TEXT,
    "anuncioId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDING',
    "moderatedBy" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "moderationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AnuncioComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnuncioMetrics" (
    "id" TEXT NOT NULL,
    "anuncioId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "reactions" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "emailOpens" INTEGER NOT NULL DEFAULT 0,
    "emailClicks" INTEGER NOT NULL DEFAULT 0,
    "pushOpens" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "lastInteractionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnuncioMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cif" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "logo" TEXT,
    "description" TEXT,
    "website" TEXT,
    "currentPlanId" TEXT,
    "accountManagerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_configs" (
    "id" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombreCorto" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precioMensual" DOUBLE PRECISION NOT NULL,
    "precioAnual" DOUBLE PRECISION,
    "limitesJSON" TEXT NOT NULL,
    "caracteristicas" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "esSistema" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "precioMensual" DOUBLE PRECISION NOT NULL,
    "precioAnual" DOUBLE PRECISION,
    "limites" JSONB NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "isAutoRenew" BOOLEAN NOT NULL DEFAULT true,
    "extras" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_ownedCompanyId_key" ON "User"("ownedCompanyId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_communityId_idx" ON "User"("communityId");

-- CreateIndex
CREATE INDEX "User_userType_idx" ON "User"("userType");

-- CreateIndex
CREATE INDEX "User_ownedCompanyId_idx" ON "User"("ownedCompanyId");

-- CreateIndex
CREATE INDEX "User_memberCompanyId_idx" ON "User"("memberCompanyId");

-- CreateIndex
CREATE INDEX "Comunidad_activa_idx" ON "Comunidad"("activa");

-- CreateIndex
CREATE INDEX "Anuncio_communityId_status_publishAt_idx" ON "Anuncio"("communityId", "status", "publishAt");

-- CreateIndex
CREATE INDEX "Anuncio_type_audience_idx" ON "Anuncio"("type", "audience");

-- CreateIndex
CREATE INDEX "Anuncio_authorId_idx" ON "Anuncio"("authorId");

-- CreateIndex
CREATE INDEX "Anuncio_deletedAt_idx" ON "Anuncio"("deletedAt");

-- CreateIndex
CREATE INDEX "Anuncio_slug_idx" ON "Anuncio"("slug");

-- CreateIndex
CREATE INDEX "Anuncio_publishAt_expiresAt_idx" ON "Anuncio"("publishAt", "expiresAt");

-- CreateIndex
CREATE INDEX "AnuncioComment_anuncioId_status_idx" ON "AnuncioComment"("anuncioId", "status");

-- CreateIndex
CREATE INDEX "AnuncioComment_authorId_idx" ON "AnuncioComment"("authorId");

-- CreateIndex
CREATE INDEX "AnuncioComment_parentId_idx" ON "AnuncioComment"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "AnuncioMetrics_anuncioId_key" ON "AnuncioMetrics"("anuncioId");

-- CreateIndex
CREATE INDEX "AnuncioMetrics_engagementRate_idx" ON "AnuncioMetrics"("engagementRate");

-- CreateIndex
CREATE INDEX "AnuncioMetrics_lastViewedAt_idx" ON "AnuncioMetrics"("lastViewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "companies_cif_key" ON "companies"("cif");

-- CreateIndex
CREATE INDEX "companies_cif_idx" ON "companies"("cif");

-- CreateIndex
CREATE INDEX "companies_currentPlanId_idx" ON "companies"("currentPlanId");

-- CreateIndex
CREATE INDEX "companies_accountManagerId_idx" ON "companies"("accountManagerId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_configs_planType_key" ON "plan_configs"("planType");

-- CreateIndex
CREATE INDEX "plan_configs_planType_idx" ON "plan_configs"("planType");

-- CreateIndex
CREATE INDEX "plan_configs_activo_visible_idx" ON "plan_configs"("activo", "visible");

-- CreateIndex
CREATE INDEX "plan_configs_orden_idx" ON "plan_configs"("orden");

-- CreateIndex
CREATE INDEX "subscriptions_companyId_idx" ON "subscriptions"("companyId");

-- CreateIndex
CREATE INDEX "subscriptions_planId_idx" ON "subscriptions"("planId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_endDate_idx" ON "subscriptions"("endDate");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_ownedCompanyId_fkey" FOREIGN KEY ("ownedCompanyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_memberCompanyId_fkey" FOREIGN KEY ("memberCompanyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Comunidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Comunidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnuncioComment" ADD CONSTRAINT "AnuncioComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AnuncioComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnuncioComment" ADD CONSTRAINT "AnuncioComment_anuncioId_fkey" FOREIGN KEY ("anuncioId") REFERENCES "Anuncio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnuncioComment" ADD CONSTRAINT "AnuncioComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnuncioMetrics" ADD CONSTRAINT "AnuncioMetrics_anuncioId_fkey" FOREIGN KEY ("anuncioId") REFERENCES "Anuncio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_currentPlanId_fkey" FOREIGN KEY ("currentPlanId") REFERENCES "plan_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plan_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
