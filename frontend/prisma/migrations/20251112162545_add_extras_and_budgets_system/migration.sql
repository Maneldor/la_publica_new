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

-- AlterTable
ALTER TABLE "invoice_items" ADD COLUMN     "extraId" TEXT,
ADD COLUMN     "isProrated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "itemType" "InvoiceItemType" NOT NULL DEFAULT 'CUSTOM',
ADD COLUMN     "planId" TEXT,
ADD COLUMN     "proratedDays" INTEGER;

-- CreateTable
CREATE TABLE "extras" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ExtraCategory" NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "priceType" "PriceType" NOT NULL,
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

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "extras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plan_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
