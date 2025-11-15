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

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'CASH', 'CHECK', 'SEPA_DIRECT_DEBIT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExtraCategory" AS ENUM ('WEB_MAINTENANCE', 'BRANDING', 'MARKETING', 'SEO', 'CONTENT', 'CONSULTING', 'TRAINING', 'DEVELOPMENT', 'SUPPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('FIXED', 'MONTHLY', 'ANNUAL', 'HOURLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "BudgetStatus" AS ENUM ('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'INVOICED');

-- CreateEnum
CREATE TYPE "BudgetItemType" AS ENUM ('PLAN', 'EXTRA', 'CUSTOM', 'DISCOUNT');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'ANNUAL', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "InvoiceItemType" AS ENUM ('PLAN', 'EXTRA', 'UPGRADE', 'PRORATED', 'DISCOUNT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('REGULAR', 'PROFORMA', 'RECURRING', 'UPGRADE', 'ADJUSTMENT', 'REFUND');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('COMPANY_PENDING', 'COMPANY_APPROVED', 'COMPANY_REJECTED', 'PROFILE_CHANGE', 'GENERAL', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ProfileChangeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProfileChangeType" AS ENUM ('COMPANY_DATA', 'CONTACT_INFO', 'LOGO', 'DESCRIPTION', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE', 'CUSTOM');

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
    "password" TEXT,

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
    "status" "CompanyStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectedById" TEXT,
    "rejectionReason" TEXT,
    "lastReviewedAt" TIMESTAMP(3),
    "lastReviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_configs" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "planType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEs" TEXT,
    "nameEn" TEXT,
    "nombre" TEXT NOT NULL,
    "nombreCorto" TEXT NOT NULL,
    "description" TEXT,
    "descripcion" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "precioMensual" DOUBLE PRECISION NOT NULL,
    "precioAnual" DOUBLE PRECISION,
    "durationMonths" INTEGER NOT NULL DEFAULT 12,
    "firstYearDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxActiveOffers" INTEGER,
    "maxTeamMembers" INTEGER NOT NULL DEFAULT 1,
    "maxFeaturedOffers" INTEGER NOT NULL DEFAULT 0,
    "maxStorage" INTEGER,
    "features" JSONB NOT NULL,
    "limitesJSON" TEXT NOT NULL,
    "caracteristicas" TEXT NOT NULL,
    "badge" TEXT,
    "badgeColor" TEXT,
    "isPioneer" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "esSistema" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "hasFreeTrial" BOOLEAN NOT NULL DEFAULT false,
    "trialDurationDays" INTEGER,
    "priceIncludesVAT" BOOLEAN NOT NULL DEFAULT true,
    "displayNote" TEXT DEFAULT 'IVA incluido',
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

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceSeries" TEXT NOT NULL DEFAULT 'A',
    "companyId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "issuerName" TEXT NOT NULL DEFAULT 'La Pública Servicios Digitales S.L.',
    "issuerCif" TEXT NOT NULL DEFAULT 'B12345678',
    "issuerAddress" TEXT NOT NULL DEFAULT 'Calle Ejemplo 123, 08001 Barcelona',
    "issuerEmail" TEXT NOT NULL DEFAULT 'facturacion@lapublica.es',
    "issuerPhone" TEXT DEFAULT '933123456',
    "clientName" TEXT NOT NULL,
    "clientCif" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientAddress" TEXT NOT NULL,
    "clientPhone" TEXT,
    "clientCity" TEXT,
    "clientPostalCode" TEXT,
    "clientCountry" TEXT NOT NULL DEFAULT 'España',
    "concept" TEXT NOT NULL,
    "notes" TEXT,
    "subtotalAmount" INTEGER NOT NULL,
    "taxAmount" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 21.0,
    "taxType" TEXT NOT NULL DEFAULT 'IVA',
    "discountPercent" DOUBLE PRECISION,
    "discountAmount" INTEGER,
    "paidAmount" INTEGER NOT NULL DEFAULT 0,
    "pendingAmount" INTEGER NOT NULL,
    "legalText" TEXT NOT NULL DEFAULT 'Esta factura se emite conforme a la Ley 37/1992 del IVA y RD 1619/2012 de facturas',
    "retentionPercent" DOUBLE PRECISION,
    "retentionAmount" INTEGER,
    "pdfUrl" TEXT,
    "xmlUrl" TEXT,
    "pricesIncludeVAT" BOOLEAN NOT NULL DEFAULT true,
    "invoiceType" "InvoiceType" NOT NULL DEFAULT 'REGULAR',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "concept" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "unitPrice" INTEGER NOT NULL,
    "discountPercent" DOUBLE PRECISION,
    "discountAmount" INTEGER,
    "subtotalAmount" INTEGER NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 21.0,
    "taxAmount" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "itemType" "InvoiceItemType" NOT NULL DEFAULT 'CUSTOM',
    "extraId" TEXT,
    "planId" TEXT,
    "isProrated" BOOLEAN NOT NULL DEFAULT false,
    "proratedDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "paymentNumber" TEXT NOT NULL,
    "reference" TEXT,
    "externalId" TEXT,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "feeAmount" INTEGER,
    "netAmount" INTEGER NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedDate" TIMESTAMP(3),
    "settledDate" TIMESTAMP(3),
    "paymentDetails" JSONB,
    "description" TEXT,
    "notes" TEXT,
    "processedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extras" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ExtraCategory" NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "priceIncludesVAT" BOOLEAN NOT NULL DEFAULT true,
    "priceType" "PriceType" NOT NULL,
    "displayNote" TEXT DEFAULT 'IVA incluido',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "image" TEXT,
    "details" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "budgetNumber" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "status" "BudgetStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 21.00,
    "taxAmount" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2),
    "total" DECIMAL(10,2) NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "clientNIF" TEXT,
    "invoiceId" TEXT,
    "notes" TEXT,
    "internalNotes" TEXT,
    "terms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_items" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "itemType" "BudgetItemType" NOT NULL,
    "planId" TEXT,
    "extraId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "discountPercent" DECIMAL(5,2),
    "subtotal" DECIMAL(10,2) NOT NULL,
    "billingCycle" "BillingCycle",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "senderId" TEXT,
    "companyId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_profile_changes" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "ProfileChangeType" NOT NULL,
    "status" "ProfileChangeStatus" NOT NULL DEFAULT 'PENDING',
    "oldValue" JSONB,
    "newValue" JSONB,
    "description" TEXT,
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "rejectedById" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "company_profile_changes_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "companies_status_idx" ON "companies"("status");

-- CreateIndex
CREATE INDEX "companies_createdAt_idx" ON "companies"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "plan_configs_slug_key" ON "plan_configs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "plan_configs_planType_key" ON "plan_configs"("planType");

-- CreateIndex
CREATE INDEX "plan_configs_tier_idx" ON "plan_configs"("tier");

-- CreateIndex
CREATE INDEX "plan_configs_slug_idx" ON "plan_configs"("slug");

-- CreateIndex
CREATE INDEX "plan_configs_planType_idx" ON "plan_configs"("planType");

-- CreateIndex
CREATE INDEX "plan_configs_activo_visible_idx" ON "plan_configs"("activo", "visible");

-- CreateIndex
CREATE INDEX "plan_configs_priority_idx" ON "plan_configs"("priority");

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

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_companyId_status_idx" ON "invoices"("companyId", "status");

-- CreateIndex
CREATE INDEX "invoices_invoiceNumber_idx" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_dueDate_idx" ON "invoices"("dueDate");

-- CreateIndex
CREATE INDEX "invoices_issueDate_idx" ON "invoices"("issueDate");

-- CreateIndex
CREATE INDEX "invoices_clientCif_idx" ON "invoices"("clientCif");

-- CreateIndex
CREATE INDEX "invoice_items_invoiceId_idx" ON "invoice_items"("invoiceId");

-- CreateIndex
CREATE INDEX "invoice_items_order_idx" ON "invoice_items"("order");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentNumber_key" ON "payments"("paymentNumber");

-- CreateIndex
CREATE INDEX "payments_invoiceId_idx" ON "payments"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_paymentNumber_idx" ON "payments"("paymentNumber");

-- CreateIndex
CREATE INDEX "payments_method_idx" ON "payments"("method");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_paymentDate_idx" ON "payments"("paymentDate");

-- CreateIndex
CREATE UNIQUE INDEX "extras_slug_key" ON "extras"("slug");

-- CreateIndex
CREATE INDEX "extras_category_idx" ON "extras"("category");

-- CreateIndex
CREATE INDEX "extras_active_idx" ON "extras"("active");

-- CreateIndex
CREATE INDEX "extras_slug_idx" ON "extras"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_budgetNumber_key" ON "budgets"("budgetNumber");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_invoiceId_key" ON "budgets"("invoiceId");

-- CreateIndex
CREATE INDEX "budgets_companyId_idx" ON "budgets"("companyId");

-- CreateIndex
CREATE INDEX "budgets_status_idx" ON "budgets"("status");

-- CreateIndex
CREATE INDEX "budgets_budgetNumber_idx" ON "budgets"("budgetNumber");

-- CreateIndex
CREATE INDEX "budget_items_budgetId_idx" ON "budget_items"("budgetId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_type_priority_idx" ON "notifications"("type", "priority");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "company_profile_changes_companyId_status_idx" ON "company_profile_changes"("companyId", "status");

-- CreateIndex
CREATE INDEX "company_profile_changes_type_status_idx" ON "company_profile_changes"("type", "status");

-- CreateIndex
CREATE INDEX "company_profile_changes_createdAt_idx" ON "company_profile_changes"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Comunidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_memberCompanyId_fkey" FOREIGN KEY ("memberCompanyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_ownedCompanyId_fkey" FOREIGN KEY ("ownedCompanyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Comunidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnuncioComment" ADD CONSTRAINT "AnuncioComment_anuncioId_fkey" FOREIGN KEY ("anuncioId") REFERENCES "Anuncio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnuncioComment" ADD CONSTRAINT "AnuncioComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnuncioComment" ADD CONSTRAINT "AnuncioComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AnuncioComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnuncioMetrics" ADD CONSTRAINT "AnuncioMetrics_anuncioId_fkey" FOREIGN KEY ("anuncioId") REFERENCES "Anuncio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_currentPlanId_fkey" FOREIGN KEY ("currentPlanId") REFERENCES "plan_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_lastReviewedById_fkey" FOREIGN KEY ("lastReviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plan_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "extras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plan_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plan_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "extras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_profile_changes" ADD CONSTRAINT "company_profile_changes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

