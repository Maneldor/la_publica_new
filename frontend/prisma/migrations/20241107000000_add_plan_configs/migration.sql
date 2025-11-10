-- CreateTable
CREATE TABLE "PlanConfig" (
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

    CONSTRAINT "PlanConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanConfig_planType_key" ON "PlanConfig"("planType");

-- CreateIndex
CREATE INDEX "PlanConfig_planType_idx" ON "PlanConfig"("planType");

-- CreateIndex
CREATE INDEX "PlanConfig_activo_visible_idx" ON "PlanConfig"("activo", "visible");

-- CreateIndex
CREATE INDEX "PlanConfig_orden_idx" ON "PlanConfig"("orden");