'use client'

import { cn } from '@/lib/utils'

interface TypographyToken {
  name: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  sample?: string
  letterSpacing?: string
}

interface TypographyPreviewProps {
  tokens: TypographyToken[]
  selectedToken?: string
  onTokenSelect?: (token: TypographyToken) => void
}

export function TypographyPreview({
  tokens,
  selectedToken,
  onTokenSelect
}: TypographyPreviewProps) {
  return (
    <div className="space-y-8">
      {/* Type Scale */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h4 className="font-semibold text-slate-900">Escala Tipografica</h4>
        </div>
        <div className="divide-y divide-slate-100">
          {tokens.map((token) => (
            <button
              key={token.name}
              onClick={() => onTokenSelect?.(token)}
              className={cn(
                'w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors',
                selectedToken === token.name && 'bg-blue-50'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p
                    className="text-slate-900 truncate"
                    style={{
                      fontSize: token.fontSize,
                      fontWeight: token.fontWeight,
                      lineHeight: token.lineHeight,
                      letterSpacing: token.letterSpacing,
                    }}
                  >
                    {token.sample || 'La Publica - Connectant empreses i empleats publics'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-slate-900">{token.name}</p>
                  <p className="text-xs text-slate-500 font-mono">
                    {token.fontSize} / {token.fontWeight}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Heading Hierarchy */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-6">
          Jerarquia de Titols
        </h4>
        <div className="space-y-6">
          <div>
            <span className="text-xs text-slate-500 font-mono">h1 - 2.25rem/700</span>
            <h1 className="text-4xl font-bold text-slate-900 mt-1">
              Titol Principal de Pagina
            </h1>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-mono">h2 - 1.875rem/600</span>
            <h2 className="text-3xl font-semibold text-slate-900 mt-1">
              Titol de Seccio
            </h2>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-mono">h3 - 1.5rem/600</span>
            <h3 className="text-2xl font-semibold text-slate-900 mt-1">
              Subtitol Important
            </h3>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-mono">h4 - 1.25rem/600</span>
            <h4 className="text-xl font-semibold text-slate-900 mt-1">
              Titol de Card
            </h4>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-mono">h5 - 1.125rem/600</span>
            <h5 className="text-lg font-semibold text-slate-900 mt-1">
              Titol Petit
            </h5>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-mono">h6 - 1rem/600</span>
            <h6 className="text-base font-semibold text-slate-900 mt-1">
              Titol Minim
            </h6>
          </div>
        </div>
      </div>

      {/* Body Text */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-6">
          Text de Cos
        </h4>
        <div className="space-y-6">
          <div>
            <span className="text-xs text-slate-500 font-mono">body-xl - 1.25rem</span>
            <p className="text-xl text-slate-700 mt-1">
              Text gran per a introduccions o destacats. Utilitzat en seccions hero o descripcions principals.
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-mono">body-lg - 1.125rem</span>
            <p className="text-lg text-slate-700 mt-1">
              Text lleugerament mes gran que el normal. Ideal per a subtitols o text destacat dins de seccions.
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-mono">body - 1rem</span>
            <p className="text-base text-slate-700 mt-1">
              Text estàndard per a la majoria del contingut. Proporciona una lectura còmoda i clara per a paràgrafs llargs i descripcions detallades.
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-mono">body-sm - 0.875rem</span>
            <p className="text-sm text-slate-600 mt-1">
              Text petit per a informació secundària, notes al peu o metadades. Encara llegible però menys prominent.
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-mono">body-xs - 0.75rem</span>
            <p className="text-xs text-slate-500 mt-1">
              Text molt petit per a llegendes, timestamps o informació auxiliar. Utilitzar amb moderació.
            </p>
          </div>
        </div>
      </div>

      {/* UI Text */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-6">
          Text UI
        </h4>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs text-slate-500 font-mono">label</span>
              <label className="block text-sm font-medium text-slate-700 mt-1">
                Etiqueta de formulari
              </label>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-mono">button</span>
              <span className="block text-sm font-medium text-slate-900 mt-1">
                Text de boto
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-mono">link</span>
              <a href="#" className="block text-sm font-medium text-blue-600 hover:underline mt-1">
                Enllac interactiu
              </a>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-slate-500 font-mono">caption</span>
              <p className="text-xs text-slate-500 mt-1">
                Text de llegenda o peu de foto
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-mono">overline</span>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Text overline
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-mono">helper</span>
              <p className="text-xs text-slate-400 mt-1">
                Text d'ajuda sota un camp
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Font Weights */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-6">
          Pesos Tipografics
        </h4>
        <div className="space-y-3">
          {[
            { weight: '300', name: 'Light', sample: 'Aa Bb Cc Dd Ee Ff Gg' },
            { weight: '400', name: 'Regular', sample: 'Aa Bb Cc Dd Ee Ff Gg' },
            { weight: '500', name: 'Medium', sample: 'Aa Bb Cc Dd Ee Ff Gg' },
            { weight: '600', name: 'SemiBold', sample: 'Aa Bb Cc Dd Ee Ff Gg' },
            { weight: '700', name: 'Bold', sample: 'Aa Bb Cc Dd Ee Ff Gg' },
          ].map((item) => (
            <div key={item.weight} className="flex items-center gap-4">
              <span className="w-24 text-xs text-slate-500 font-mono">
                {item.name} ({item.weight})
              </span>
              <span
                className="text-xl text-slate-900"
                style={{ fontWeight: item.weight }}
              >
                {item.sample}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Real Content Example */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-6">
          Exemple de Contingut Real
        </h4>
        <article className="prose prose-slate max-w-none">
          <h1>Benvingut a La Publica</h1>
          <p className="lead">
            La plataforma que connecta empreses i empleats del sector públic amb ofertes exclusives i serveis de qualitat.
          </p>
          <h2>Com funciona?</h2>
          <p>
            Registra't com a empleat públic o com a empresa i descobreix tots els avantatges que t'oferim. Les empreses poden publicar ofertes exclusives i els empleats poden aprofitar descomptes especials.
          </p>
          <h3>Per a empleats públics</h3>
          <ul>
            <li>Accés a ofertes exclusives</li>
            <li>Descomptes en serveis i productes</li>
            <li>Comunitat professional</li>
          </ul>
          <h3>Per a empreses</h3>
          <p>
            Arriba al teu públic objectiu amb les nostres eines de màrqueting i posicionament. <a href="#">Descobreix els nostres plans</a> i comença a créixer avui mateix.
          </p>
          <blockquote>
            "La Pública ens ha permès arribar a milers de professionals del sector públic de manera efectiva."
          </blockquote>
        </article>
      </div>
    </div>
  )
}
