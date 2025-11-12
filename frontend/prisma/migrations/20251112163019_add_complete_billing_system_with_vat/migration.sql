-- AlterTable
ALTER TABLE "extras" ADD COLUMN     "displayNote" TEXT DEFAULT 'IVA incluido',
ADD COLUMN     "priceIncludesVAT" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "invoiceType" "InvoiceType" NOT NULL DEFAULT 'REGULAR',
ADD COLUMN     "pricesIncludeVAT" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "plan_configs" ADD COLUMN     "displayNote" TEXT DEFAULT 'IVA incluido',
ADD COLUMN     "priceIncludesVAT" BOOLEAN NOT NULL DEFAULT true;
