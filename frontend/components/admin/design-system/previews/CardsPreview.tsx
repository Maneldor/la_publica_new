'use client'

import {
  Building2,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Star,
  MapPin,
  Calendar,
  ExternalLink,
  Heart,
  Share2,
  ChevronRight,
  Briefcase
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
  CardHoverContent
} from '@/components/ui/card'

interface CardsPreviewProps {
  selectedCard?: string
  onCardSelect?: (card: string) => void
}

export function CardsPreview({ selectedCard, onCardSelect }: CardsPreviewProps) {
  return (
    <div className="space-y-8">
      {/* Base Cards - Usant components del Design System */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
          Cards Base (Design System)
        </h4>
        <div className="grid grid-cols-3 gap-4">
          {/* Card Default */}
          <div
            onClick={() => onCardSelect?.('default')}
            className={cn(
              'cursor-pointer transition-all',
              selectedCard === 'default' && 'ring-2 ring-blue-500 rounded-xl'
            )}
          >
            <Card>
              <CardHeader>
                <CardTitle>Card Default</CardTitle>
                <CardDescription>Variant per defecte</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Card estàndard amb estils del Design System.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Card Highlighted */}
          <div
            onClick={() => onCardSelect?.('highlighted')}
            className={cn(
              'cursor-pointer transition-all',
              selectedCard === 'highlighted' && 'ring-2 ring-blue-500 rounded-xl'
            )}
          >
            <Card variant="highlighted">
              <CardHeader>
                <CardTitle>Card Destacada</CardTitle>
                <CardDescription>Variant highlighted</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Per destacar contingut important.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Card Interactive */}
          <div
            onClick={() => onCardSelect?.('interactive')}
            className={cn(
              selectedCard === 'interactive' && 'ring-2 ring-blue-500 rounded-xl'
            )}
          >
            <Card variant="interactive">
              <CardHeader>
                <CardTitle>Card Interactiva</CardTitle>
                <CardDescription>Variant interactive</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Amb efecte hover per indicar que és clicable.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Card Interactive Expand - Nova variant */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
          Card Expandible (Nova!)
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div
            onClick={() => onCardSelect?.('interactive-expand')}
            className={cn(
              selectedCard === 'interactive-expand' && 'ring-2 ring-blue-500 rounded-xl'
            )}
          >
            <Card variant="interactive-expand">
              <CardHeader noDivider>
                <CardTitle
                  icon={<Users className="h-5 w-5 text-blue-600" />}
                >
                  Maria Garcia
                </CardTitle>
                <CardDescription>@mariagarcia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 text-sm text-slate-600">
                  <span>125 Connexions</span>
                  <span>48 Seguidors</span>
                </div>
                <CardHoverContent>
                  <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
                    <p className="text-sm text-slate-600">Administració Central</p>
                    <p className="text-xs text-slate-500">Membre des de gen. 2024</p>
                    <button className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg">
                      Connectar
                    </button>
                  </div>
                </CardHoverContent>
              </CardContent>
            </Card>
          </div>

          <Card variant="interactive-expand">
            <CardHeader noDivider>
              <CardTitle
                icon={<Building2 className="h-5 w-5 text-indigo-600" />}
              >
                Tech Solutions SL
              </CardTitle>
              <CardDescription>Tecnologia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  4.8
                </span>
                <span>Barcelona</span>
              </div>
              <CardHoverContent>
                <div className="pt-3 mt-3 border-t border-slate-100">
                  <p className="text-sm text-slate-600 mb-2">
                    Especialistes en solucions cloud i ciberseguretat.
                  </p>
                  <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg">
                    Veure empresa
                  </button>
                </div>
              </CardHoverContent>
            </CardContent>
          </Card>

          <Card variant="interactive-expand">
            <CardHeader noDivider>
              <CardTitle
                icon={<Briefcase className="h-5 w-5 text-emerald-600" />}
              >
                Oferta Especial
              </CardTitle>
              <CardDescription>-25% Consultoria IT</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 text-sm text-slate-600">
                <span className="text-emerald-600 font-medium">750€</span>
                <span className="line-through text-slate-400">1000€</span>
              </div>
              <CardHoverContent>
                <div className="pt-3 mt-3 border-t border-slate-100">
                  <p className="text-sm text-slate-600 mb-2">
                    Vàlid fins 31/03/2025. Inclou auditoria gratuïta.
                  </p>
                  <button className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg">
                    Obtenir oferta
                  </button>
                </div>
              </CardHoverContent>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cards amb Header i icona */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
          Cards amb Header i Icona
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle
                icon={<Building2 className="h-5 w-5 text-blue-600" />}
                subtitle="Gestió d'empreses"
                action={
                  <button className="p-2 hover:bg-slate-100 rounded-lg">
                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                  </button>
                }
              >
                Empreses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Contingut de la card amb header i icona. El header proporciona context visual.
              </p>
            </CardContent>
          </Card>

          <Card variant="highlighted">
            <CardHeader noDivider>
              <CardTitle
                icon={<TrendingUp className="h-5 w-5 text-indigo-600" />}
                subtitle="Rendiment del mes"
              >
                Estadístiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Card destacada amb icona per a seccions especials.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cards d'Estadístiques */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
          Cards d'Estadístiques
        </h4>
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent padding="compact" className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">Total Empreses</span>
                <Building2 className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-[var(--card-title-color,#111827)]">245</p>
              <div className="flex items-center gap-1 mt-2 text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">12%</span>
                <span className="text-slate-500">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent padding="compact" className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">Usuaris Actius</span>
                <Users className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-[var(--card-title-color,#111827)]">1,234</p>
              <div className="flex items-center gap-1 mt-2 text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">8.5%</span>
                <span className="text-slate-500">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent padding="compact" className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">Conversió</span>
                <TrendingUp className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-[var(--card-title-color,#111827)]">8.5%</p>
              <div className="flex items-center gap-1 mt-2 text-sm">
                <ArrowDownRight className="h-4 w-4 text-red-500" />
                <span className="text-red-600 font-medium">2.1%</span>
                <span className="text-slate-500">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card variant="highlighted" className="bg-gradient-to-br from-blue-600 to-indigo-600 border-0">
            <CardContent padding="compact" className="pt-4 text-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-blue-100">Ingressos</span>
                <TrendingUp className="h-5 w-5 text-blue-200" />
              </div>
              <p className="text-2xl font-bold">24,500€</p>
              <div className="flex items-center gap-1 mt-2 text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-300" />
                <span className="text-green-300 font-medium">15%</span>
                <span className="text-blue-100">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cards amb Footer */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
          Cards amb Footer
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader noDivider>
              <CardTitle>Títol de la Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Contingut principal de la card amb informació detallada sobre el tema.
              </p>
            </CardContent>
            <CardFooter withBackground className="justify-between">
              <span className="text-xs text-slate-500">Actualitzat fa 2 hores</span>
              <button className="text-sm text-blue-600 font-medium hover:underline">
                Veure detalls
              </button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader noDivider>
              <CardTitle>Acció Requerida</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Aquesta card requereix una acció per part de l'usuari.
              </p>
            </CardContent>
            <CardFooter withBackground className="justify-end gap-2">
              <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded-lg">
                Cancel·lar
              </button>
              <button className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
                Confirmar
              </button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Cards de Contingut Tipus */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
          Cards de Contingut
        </h4>
        <div className="grid grid-cols-3 gap-4">
          {/* Company Card Style */}
          <Card variant="interactive" className="overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
              <span className="absolute top-3 right-3 px-2 py-1 bg-white/90 rounded-full text-xs font-medium text-blue-600">
                Enterprise
              </span>
            </div>
            <CardContent padding="compact" className="pt-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center -mt-10 shadow-sm">
                  <Building2 className="h-6 w-6 text-slate-600" />
                </div>
                <div className="flex-1 pt-1">
                  <h5 className="font-semibold text-[var(--card-title-color,#111827)]">Tech Solutions</h5>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Barcelona
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                Empresa especialitzada en solucions tecnològiques per al sector públic.
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium">4.5</span>
                  <span className="text-xs text-slate-500">(28)</span>
                </div>
                <button className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                  Veure <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Offer Card Style */}
          <Card variant="interactive">
            <CardContent padding="compact" className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  -20%
                </span>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg">
                    <Heart className="h-4 w-4 text-slate-400" />
                  </button>
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg">
                    <Share2 className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>
              <h5 className="font-semibold text-[var(--card-title-color,#111827)] mb-1">
                Descompte en serveis IT
              </h5>
              <p className="text-sm text-slate-600 line-clamp-2">
                Oferta especial per a empleats públics amb assessorament gratuït.
              </p>
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                Fins 31/03/2025
              </div>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-slate-600" />
                </div>
                <span className="text-sm text-slate-700">Tech Solutions</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Card Style */}
          <Card variant="interactive">
            <CardContent padding="compact" className="py-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ExternalLink className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-[var(--card-title-color,#111827)]">Veure totes</h5>
                  <p className="text-sm text-slate-500">Explora més opcions</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
