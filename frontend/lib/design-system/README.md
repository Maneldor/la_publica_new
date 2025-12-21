# Sistema de Diseño - La Pública

## Referencia Visual

La página `/dashboard/avui` es el modelo de referencia para el diseño de todas las páginas.

---

## Espaciado de Página

| Elemento | Clase Tailwind | Valor |
|----------|----------------|-------|
| Padding de página | `px-6 py-6` | 24px |
| Gap entre secciones | `space-y-6` | 24px |
| Gap entre cards | `gap-6` | 24px |
| Padding interno de cards | `p-5` | 20px |
| Gap compacto | `gap-4` | 16px |

---

## Tipografía

| Elemento | Clase Tailwind |
|----------|----------------|
| Título de página (h1) | `text-2xl font-bold text-gray-900` |
| Subtítulo de página | `text-sm text-gray-500` |
| Título de card/sección (h2) | `text-lg font-semibold text-gray-900` |
| Título de subsección (h3) | `text-base font-semibold text-gray-900` |
| Texto body | `text-sm text-gray-600` |
| Labels | `text-sm font-medium text-gray-700` |
| Texto pequeño | `text-xs text-gray-500` |
| Links | `text-sm text-indigo-600 hover:text-indigo-800 font-medium` |

---

## Cards

### Card estándar
```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle icon={<Icon />} action={<Button />}>
      Título
    </CardTitle>
  </CardHeader>
  <CardContent>
    Contenido
  </CardContent>
  <CardFooter>
    Footer opcional
  </CardFooter>
</Card>
```

### Variantes de Card
- `default` - Card estándar blanca con borde gris
- `highlighted` - Card con gradiente indigo (para destacar)
- `interactive` - Card con hover effect (para clicables)

### Padding de CardContent
- `none` - Sin padding
- `compact` - `px-4 py-3` (compacto)
- `default` - `px-5 py-4` (estándar)
- `large` - `px-6 py-5` (grande)

---

## Grid Layouts

| Layout | Clase Tailwind |
|--------|----------------|
| 2 columnas | `grid grid-cols-1 lg:grid-cols-2 gap-6` |
| 3 columnas | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` |
| 4 columnas (stats) | `grid grid-cols-2 lg:grid-cols-4 gap-4` |
| Con sidebar | `grid grid-cols-1 lg:grid-cols-3 gap-6` |
| Contenido principal | `lg:col-span-2` |
| Sidebar | `lg:col-span-1 space-y-6` |

---

## Componentes Reutilizables

### 1. PageLayout
Wrapper de página con breadcrumb, título y padding consistente.

```tsx
import { PageLayout } from '@/components/layout/PageLayout'

<PageLayout
  breadcrumb={[
    { label: 'Tauler', href: '/dashboard' },
    { label: 'Membres' }
  ]}
  title="Membres"
  subtitle="Connecta amb altres professionals"
  icon={<Users className="w-6 h-6" />}
  actions={<Button>Acció</Button>}
>
  {/* Contenido de la página */}
</PageLayout>
```

### 2. StatsGrid
Grid de estadísticas estandarizado.

```tsx
import { StatsGrid } from '@/components/ui/StatsGrid'

const stats = [
  { label: 'Total', value: '2.4K', trend: '+18%', trendUp: true },
  { label: 'Nous', value: '12', icon: <Icon />, color: 'indigo' },
]

<StatsGrid stats={stats} columns={4} />
```

### 3. Card
Contenedor estándar con header opcional.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card variant="default">
  <CardHeader>
    <CardTitle icon={<Icon />} subtitle="Subtítulo">
      Título
    </CardTitle>
  </CardHeader>
  <CardContent padding="default">
    Contenido
  </CardContent>
</Card>
```

---

## Constantes de Diseño

Importar desde `@/lib/design-system/spacing`:

```tsx
import {
  PAGE_SPACING,
  TYPOGRAPHY,
  CARDS,
  LAYOUTS,
  BREADCRUMB,
  ICON_SIZES,
  BUTTONS,
  COLORS
} from '@/lib/design-system'
```

---

## Botones

| Tipo | Clase |
|------|-------|
| Primario | `px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700` |
| Secundario | `px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50` |
| Ghost | `px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg` |
| Icono | `p-2 rounded-lg hover:bg-gray-100` |

---

## Colores Semánticos

| Estado | Background | Border | Texto |
|--------|------------|--------|-------|
| Success | `bg-green-50` | `border-green-200` | `text-green-700` |
| Warning | `bg-amber-50` | `border-amber-200` | `text-amber-700` |
| Error | `bg-red-50` | `border-red-200` | `text-red-700` |
| Info | `bg-blue-50` | `border-blue-200` | `text-blue-700` |

---

## Ejemplo Completo de Página

```tsx
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatsGrid } from '@/components/ui/StatsGrid'
import { Users, Settings } from 'lucide-react'

export default function MembresPage() {
  const stats = [
    { label: 'Total Membres', value: '2.4K', trend: '+18%' },
    { label: 'Nous Avui', value: '12', trend: '+3' },
    { label: 'Actius', value: '1.8K', trend: '+15%' },
    { label: 'En Línia', value: '89', trend: '+7' },
  ]

  return (
    <PageLayout
      breadcrumb={[
        { label: 'Tauler', href: '/dashboard' },
        { label: 'Membres' }
      ]}
      title="Membres"
      subtitle="Connecta amb altres professionals del sector públic"
      icon={<Users className="w-6 h-6" />}
      actions={
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg">
          <Settings className="w-4 h-4" />
          Configurar
        </button>
      }
    >
      {/* Stats */}
      <StatsGrid stats={stats} />

      {/* Contenido principal con sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle action={<span className="text-indigo-600 text-sm cursor-pointer">Veure tots</span>}>
                Llista de membres
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Lista de miembros */}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
```
