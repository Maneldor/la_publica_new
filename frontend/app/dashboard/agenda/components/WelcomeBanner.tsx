'use client'

import { motion } from 'framer-motion'
import { X, Settings } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { TYPOGRAPHY, BUTTONS } from '@/lib/design-system'
import { SparklesIcon } from '@/components/icons'

interface WelcomeBannerProps {
  onDismissTemporary: () => void
  onDismissPermanent: () => void
}

export function WelcomeBanner({ onDismissTemporary, onDismissPermanent }: WelcomeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 relative">
        <button
          onClick={onDismissTemporary}
          className="absolute top-3 right-3 p-1.5 hover:bg-amber-100 rounded-lg transition-colors z-10"
          aria-label="Tancar"
        >
          <X className="w-5 h-5 text-amber-600" />
        </button>

        <CardContent padding="default">
          <div className="flex items-start gap-4">
            <SparklesIcon size="lg" />

            <div className="flex-1 pr-8">
              <h3 className="font-semibold text-amber-900 text-lg mb-1">
                Benvingut/da a la teva Agenda!
              </h3>
              <p className={`${TYPOGRAPHY.body} text-amber-700 mb-4`}>
                Hem creat alguns exemples perquè vegis com funciona. T&apos;aconsellem anar a
                <strong> &quot;Configurar Agenda&quot;</strong> per personalitzar-la segons les teves necessitats:
                pots eliminar els exemples, afegir nous hàbits, activar mòduls opcionals i molt més.
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={onDismissPermanent}
                  className={`${BUTTONS.primary} bg-amber-600 hover:bg-amber-700`}
                >
                  <Settings className="w-4 h-4" />
                  Configurar ara
                </button>
                <button
                  onClick={onDismissTemporary}
                  className={`${BUTTONS.secondary} text-amber-700 hover:bg-amber-100 border-transparent`}
                >
                  Més tard, gràcies
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}