# Ejemplos de Uso - Plan Limits

## 1. Proteger una API con límite simple
```typescript
// app/api/empresa/ofertas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkLimitMiddleware } from '@/lib/plan-limits';

export async function POST(request: NextRequest) {
  // Verificar límite antes de crear oferta
  const limitCheck = await checkLimitMiddleware(request, {
    limitType: 'activeOffers',
    quantity: 1,
    errorMessage: 'Has alcanzado el límite de ofertas activas de tu plan'
  });

  if (!limitCheck.allowed) {
    return limitCheck.response;
  }

  // Continuar con la creación de la oferta...
  const body = await request.json();

  // ... lógica de creación

  return NextResponse.json({ success: true });
}
```

## 2. Verificar múltiples límites
```typescript
// app/api/empresa/equipo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkMultipleLimitsMiddleware } from '@/lib/plan-limits';

export async function POST(request: NextRequest) {
  // Verificar múltiples límites
  const limitCheck = await checkMultipleLimitsMiddleware(request, [
    {
      limitType: 'teamMembers',
      quantity: 1,
      errorMessage: 'Has alcanzado el límite de miembros del equipo'
    },
    {
      limitType: 'storage',
      quantity: 100, // MB
      errorMessage: 'No tienes suficiente espacio de almacenamiento'
    }
  ]);

  if (!limitCheck.allowed) {
    return limitCheck.response;
  }

  // Continuar con la lógica...
}
```

## 3. Solo obtener companyId autenticado
```typescript
// app/api/empresa/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedCompanyId } from '@/lib/plan-limits';

export async function GET(request: NextRequest) {
  const { companyId, response } = await getAuthenticatedCompanyId(request);

  if (!companyId) {
    return response;
  }

  // Usar companyId para obtener stats...
}
```

## 4. Verificar límite manualmente (sin middleware)
```typescript
import { checkCompanyLimit, canAddMore } from '@/lib/plan-limits';

// Verificar estado actual
const check = await checkCompanyLimit(companyId, 'activeOffers');
console.log(`Ofertas: ${check.current}/${check.limit}`);

// Verificar si puede añadir 5 más
const canAdd = await canAddMore(companyId, 'activeOffers', 5);
if (!canAdd.allowed) {
  throw new Error(canAdd.message);
}
```

## 5. Obtener todos los límites de una empresa
```typescript
import { checkMultipleLimits } from '@/lib/plan-limits';

const limits = await checkMultipleLimits(companyId, [
  'activeOffers',
  'teamMembers',
  'featuredOffers',
  'storage'
]);

// Retornar en respuesta
return NextResponse.json({
  limits: {
    activeOffers: limits.activeOffers,
    teamMembers: limits.teamMembers,
    featuredOffers: limits.featuredOffers,
    storage: limits.storage
  }
});
```