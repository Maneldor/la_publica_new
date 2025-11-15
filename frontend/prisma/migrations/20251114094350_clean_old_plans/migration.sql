-- ============================================
-- LIMPIAR DATOS ANTIGUOS DE PLANES
-- ============================================

-- 1. Eliminar referencias en invoice_items
DELETE FROM "invoice_items" WHERE "planId" IS NOT NULL;

-- 2. Eliminar referencias en budget_items
DELETE FROM "budget_items" WHERE "planId" IS NOT NULL;

-- 3. Eliminar subscripciones
DELETE FROM "subscriptions";

-- 4. Desvincular empresas de planes
UPDATE "companies" SET "currentPlanId" = NULL WHERE "currentPlanId" IS NOT NULL;

-- 5. Eliminar planes antiguos
DELETE FROM "plan_configs";