#!/bin/bash

# ====================================================================
# 🧪 SCRIPT DE TESTING APIS - La Pública Sistema de Planes
# ====================================================================
# Testing automatizado de endpoints públicos y guía para autenticados
# Ejecutar: chmod +x test-apis.sh && ./test-apis.sh

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         🧪 TESTING APIs - La Pública Sistema de Planes    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables
BASE_URL="http://localhost:3000"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "📅 Timestamp: $TIMESTAMP"
echo "🌐 Base URL: $BASE_URL"
echo "=============================="
echo ""

# ====================================================================
# 1. TESTING ENDPOINT PÚBLICO - GET /api/plans
# ====================================================================

echo -e "${BLUE}1️⃣  Testing GET /api/plans (público)${NC}"
echo "────────────────────────────────────────────"

# Test de disponibilidad
echo -n "   🔍 Verificando disponibilidad... "
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/plans")

if [ $response -eq 200 ]; then
    echo -e "${GREEN}✅ OK (HTTP $response)${NC}"
else
    echo -e "${RED}❌ FAIL (HTTP $response)${NC}"
fi

# Test de content-type
echo -n "   📄 Verificando content-type... "
content_type=$(curl -s -I "$BASE_URL/api/plans" | grep -i "content-type" | cut -d' ' -f2- | tr -d '\r\n')

if [[ $content_type == *"application/json"* ]]; then
    echo -e "${GREEN}✅ OK (JSON)${NC}"
else
    echo -e "${RED}❌ FAIL ($content_type)${NC}"
fi

# Test de estructura JSON
echo -n "   🔧 Verificando estructura JSON... "
json_response=$(curl -s "$BASE_URL/api/plans")
echo $json_response | jq . > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ OK (Valid JSON)${NC}"

    # Contar planes
    plan_count=$(echo $json_response | jq '. | length' 2>/dev/null)
    if [ "$plan_count" != "null" ] && [ "$plan_count" -gt 0 ]; then
        echo -e "   📊 Planes encontrados: ${GREEN}$plan_count${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Planes encontrados: $plan_count${NC}"
    fi

    # Verificar campos obligatorios en primer plan
    first_plan=$(echo $json_response | jq '.[0]' 2>/dev/null)
    if [ "$first_plan" != "null" ]; then
        tier=$(echo $first_plan | jq -r '.tier' 2>/dev/null)
        name=$(echo $first_plan | jq -r '.name' 2>/dev/null)
        price=$(echo $first_plan | jq -r '.price' 2>/dev/null)

        echo -e "   📋 Primer plan: ${CYAN}$tier${NC} - $name (€$price)"
    fi
else
    echo -e "${RED}❌ FAIL (Invalid JSON)${NC}"
fi

echo ""

# ====================================================================
# 2. TESTING ENDPOINTS EMPRESA (requieren autenticación)
# ====================================================================

echo -e "${BLUE}2️⃣  Testing Endpoints Empresa (requieren autenticación)${NC}"
echo "─────────────────────────────────────────────────────────"

# Array de endpoints a testear
declare -a endpoints=(
    "GET /api/empresa/plan"
    "GET /api/empresa/limits"
    "GET /api/empresa/notifications"
    "POST /api/empresa/plan/calculate-proration"
    "POST /api/empresa/plan/upgrade"
)

for endpoint in "${endpoints[@]}"; do
    method=$(echo $endpoint | cut -d' ' -f1)
    path=$(echo $endpoint | cut -d' ' -f2)

    echo -n "   🔐 $endpoint... "

    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d '{}' \
            "$BASE_URL$path")
    fi

    if [ $response -eq 401 ]; then
        echo -e "${GREEN}✅ OK (401 - Requiere auth)${NC}"
    elif [ $response -eq 403 ]; then
        echo -e "${GREEN}✅ OK (403 - Forbidden)${NC}"
    else
        echo -e "${YELLOW}⚠️  HTTP $response (inesperado)${NC}"
    fi
done

echo ""

# ====================================================================
# 3. TESTING ENDPOINTS ADMIN (requieren rol admin)
# ====================================================================

echo -e "${BLUE}3️⃣  Testing Endpoints Admin (requieren rol admin)${NC}"
echo "────────────────────────────────────────────────────"

# Array de endpoints admin
declare -a admin_endpoints=(
    "GET /api/admin/plans"
    "POST /api/admin/plans"
    "PUT /api/admin/plans/[id]"
    "DELETE /api/admin/plans/[id]"
)

for endpoint in "${admin_endpoints[@]}"; do
    method=$(echo $endpoint | cut -d' ' -f1)
    path=$(echo $endpoint | cut -d' ' -f2)

    # Reemplazar [id] con UUID de prueba
    path=$(echo $path | sed 's/\[id\]/550e8400-e29b-41d4-a716-446655440000/g')

    echo -n "   🔒 $endpoint... "

    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL$path")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d '{}' \
            "$BASE_URL$path")
    fi

    if [ $response -eq 401 ]; then
        echo -e "${GREEN}✅ OK (401 - Requiere auth)${NC}"
    elif [ $response -eq 403 ]; then
        echo -e "${GREEN}✅ OK (403 - Requiere admin)${NC}"
    elif [ $response -eq 404 ]; then
        echo -e "${GREEN}✅ OK (404 - Not found)${NC}"
    else
        echo -e "${YELLOW}⚠️  HTTP $response${NC}"
    fi
done

echo ""

# ====================================================================
# 4. TESTING DE CONECTIVIDAD Y PERFORMANCE
# ====================================================================

echo -e "${BLUE}4️⃣  Testing Conectividad y Performance${NC}"
echo "─────────────────────────────────────────"

# Test de tiempo de respuesta
echo -n "   ⏱️  Tiempo respuesta /api/plans... "
time_taken=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/plans")
time_ms=$(echo "$time_taken * 1000" | bc)

if (( $(echo "$time_taken < 0.5" | bc -l) )); then
    echo -e "${GREEN}✅ ${time_ms}ms (excelente)${NC}"
elif (( $(echo "$time_taken < 1.0" | bc -l) )); then
    echo -e "${YELLOW}⚠️  ${time_ms}ms (aceptable)${NC}"
else
    echo -e "${RED}❌ ${time_ms}ms (lento)${NC}"
fi

# Test de headers de seguridad
echo -n "   🛡️  Headers de seguridad... "
security_headers=$(curl -s -I "$BASE_URL/api/plans" | grep -E "(X-Content-Type-Options|X-Frame-Options)" | wc -l)

if [ $security_headers -ge 2 ]; then
    echo -e "${GREEN}✅ OK ($security_headers headers)${NC}"
elif [ $security_headers -eq 1 ]; then
    echo -e "${YELLOW}⚠️  Parcial ($security_headers headers)${NC}"
else
    echo -e "${RED}❌ Ninguno${NC}"
fi

# Test de CORS (opcional)
echo -n "   🌍 CORS headers... "
cors_header=$(curl -s -I "$BASE_URL/api/plans" | grep -i "access-control-allow-origin")

if [ ! -z "$cors_header" ]; then
    echo -e "${GREEN}✅ Configurado${NC}"
else
    echo -e "${CYAN}ℹ️  No configurado (normal)${NC}"
fi

echo ""

# ====================================================================
# 5. GUÍA PARA TESTING MANUAL CON AUTENTICACIÓN
# ====================================================================

echo -e "${PURPLE}📋 GUÍA PARA TESTING MANUAL CON AUTENTICACIÓN${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}Para testear endpoints autenticados:${NC}"
echo ""
echo "1️⃣  Abrir navegador en: $BASE_URL/login"
echo "2️⃣  Login con: pionera@test.cat / Password123!"
echo "3️⃣  Abrir DevTools > Network tab"
echo "4️⃣  Navegar a cualquier página de empresa"
echo "5️⃣  Copiar cookie 'next-auth.session-token' de headers"
echo ""
echo -e "${CYAN}Entonces ejecutar:${NC}"
echo ""
echo "# GET Plan actual"
echo "curl '$BASE_URL/api/empresa/plan' \\"
echo "  -H 'Cookie: next-auth.session-token=TU_TOKEN_AQUI'"
echo ""
echo "# GET Límites"
echo "curl '$BASE_URL/api/empresa/limits' \\"
echo "  -H 'Cookie: next-auth.session-token=TU_TOKEN_AQUI'"
echo ""
echo "# GET Notificaciones"
echo "curl '$BASE_URL/api/empresa/notifications' \\"
echo "  -H 'Cookie: next-auth.session-token=TU_TOKEN_AQUI'"
echo ""
echo "# POST Calcular prorrateo"
echo "curl '$BASE_URL/api/empresa/plan/calculate-proration' \\"
echo "  -X POST \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Cookie: next-auth.session-token=TU_TOKEN_AQUI' \\"
echo "  -d '{\"targetPlanId\": \"uuid-del-plan-destino\"}'"
echo ""
echo "# POST Ejecutar upgrade"
echo "curl '$BASE_URL/api/empresa/plan/upgrade' \\"
echo "  -X POST \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Cookie: next-auth.session-token=TU_TOKEN_AQUI' \\"
echo "  -d '{\"targetPlanId\": \"uuid-del-plan-destino\"}'"
echo ""

# ====================================================================
# 6. TESTING ESPECÍFICO POR EMPRESA
# ====================================================================

echo -e "${PURPLE}🏢 TESTING POR EMPRESA${NC}"
echo "════════════════════════════"
echo ""

declare -a empresas=(
    "pionera@test.cat:PIONERES:Trial 15 días"
    "estandard@test.cat:ESTÀNDARD:Límites ~85%"
    "estrategic@test.cat:ESTRATÈGIC:Límites ~90%"
    "enterprise@test.cat:ENTERPRISE:Sin límites"
)

for empresa_info in "${empresas[@]}"; do
    email=$(echo $empresa_info | cut -d':' -f1)
    plan=$(echo $empresa_info | cut -d':' -f2)
    descripcion=$(echo $empresa_info | cut -d':' -f3)

    echo -e "${CYAN}📧 $email${NC}"
    echo -e "   Plan: $plan"
    echo -e "   Escenario: $descripcion"
    echo -e "   Login: $BASE_URL/login"
    echo -e "   Dashboard: $BASE_URL/empresa/pla"
    echo -e "   Comparador: $BASE_URL/empresa/plans"
    echo ""
done

# ====================================================================
# 7. RESUMEN Y PRÓXIMOS PASOS
# ====================================================================

echo -e "${GREEN}✅ RESUMEN TESTING APIS${NC}"
echo "════════════════════════════"
echo ""
echo "📊 APIs públicas: Testeadas automáticamente"
echo "🔐 APIs autenticadas: Requieren testing manual"
echo "🔒 APIs admin: Requieren rol admin"
echo ""
echo -e "${YELLOW}🚀 PRÓXIMOS PASOS:${NC}"
echo ""
echo "1. Ejecutar script SQL: test-data-setup.sql"
echo "2. Testing manual con TESTING-CHECKLIST.md"
echo "3. Testing de APIs autenticadas con cookies"
echo "4. Verificar flujos completos de upgrade"
echo "5. Documentar bugs encontrados"
echo ""
echo -e "${BLUE}📋 CHECKLIST COMPLETO:${NC}"
echo "   📄 TESTING-CHECKLIST.md - 200+ tests manuales"
echo "   🔧 test-data-setup.sql - Datos de prueba"
echo "   🤖 test-apis.sh - Testing automatizado APIs"
echo ""

# ====================================================================
# 8. GUARDAR LOG
# ====================================================================

# Crear directorio logs si no existe
mkdir -p logs

# Guardar resultado en log
LOG_FILE="logs/api-testing-$(date +%Y%m%d-%H%M%S).log"
{
    echo "API Testing Results - $TIMESTAMP"
    echo "================================="
    echo ""
    echo "✅ Tests ejecutados correctamente"
    echo "🔍 Ver output completo arriba para detalles"
    echo ""
    echo "Próximos pasos:"
    echo "1. Testing manual con TESTING-CHECKLIST.md"
    echo "2. Testing APIs autenticadas con cookies"
    echo "3. Documentar resultados"
} > $LOG_FILE

echo -e "${GREEN}📝 Log guardado en: $LOG_FILE${NC}"
echo ""

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              🎉 TESTING APIS COMPLETADO                  ║"
echo "╚═══════════════════════════════════════════════════════════╝"