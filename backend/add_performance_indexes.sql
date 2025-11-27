-- Script SQL para añadir índices de rendimiento
-- Ejecutar directamente en la base de datos para evitar problemas con drift

-- Índices para User (optimizar consultas de dashboard)
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX IF NOT EXISTS "User_isActive_createdAt_idx" ON "User"("isActive", "createdAt");

-- Índices para companies (nombre real de la tabla)
CREATE INDEX IF NOT EXISTS "companies_isActive_idx" ON "companies"("isActive");
CREATE INDEX IF NOT EXISTS "companies_createdAt_idx" ON "companies"("createdAt");
CREATE INDEX IF NOT EXISTS "companies_status_isActive_idx" ON "companies"("status", "isActive");

-- Índices para Offer (ya existe status_idx, solo añadir si falta)
-- CREATE INDEX IF NOT EXISTS "Offer_status_idx" ON "Offer"("status"); -- Ya existe

-- Índices para company_leads (nombre real de la tabla)
CREATE INDEX IF NOT EXISTS "company_leads_status_idx" ON "company_leads"("status");
CREATE INDEX IF NOT EXISTS "company_leads_createdAt_idx" ON "company_leads"("createdAt");
CREATE INDEX IF NOT EXISTS "company_leads_status_createdAt_idx" ON "company_leads"("status", "createdAt");

-- Índices para coupons
CREATE INDEX IF NOT EXISTS "coupons_status_idx" ON "coupons"("status");

-- Índices para notifications
CREATE INDEX IF NOT EXISTS "notifications_isRead_idx" ON "notifications"("isRead");

-- Índices para invoices
CREATE INDEX IF NOT EXISTS "invoices_status_idx" ON "invoices"("status");

-- Índices para offer_events (optimizar consultas de eventos recientes)
CREATE INDEX IF NOT EXISTS "offer_events_eventType_createdAt_idx" ON "offer_events"("eventType", "createdAt");

-- Verificar índices creados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('User', 'companies', 'Offer', 'company_leads', 'coupons', 'notifications', 'invoices', 'offer_events')
ORDER BY tablename, indexname;

