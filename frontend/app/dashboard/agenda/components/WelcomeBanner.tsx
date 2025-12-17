'use client'

import { motion } from 'framer-motion'
import { X, Settings, Sparkles } from 'lucide-react'

interface WelcomeBannerProps {
  onDismiss: () => void
  onConfigure: () => void
}

export function WelcomeBanner({ onDismiss, onConfigure }: WelcomeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-6 relative"
    >
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 hover:bg-amber-100 rounded-lg transition-colors"
      >
        <X className="w-5 h-5 text-amber-600" />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-100 rounded-xl">
          <Sparkles className="w-6 h-6 text-amber-600" />
        </div>
        
        <div className="flex-1 pr-8">
          <h3 className="font-semibold text-amber-900 text-lg mb-1">
            👋 Benvingut/da a la teva Agenda!
          </h3>
          <p className="text-amber-700 text-sm mb-4">
            Hem creat alguns exemples perquè vegis com funciona. T'aconsellem anar a 
            <strong> "Configurar Agenda"</strong> per personalitzar-la segons les teves necessitats: 
            pots eliminar els exemples, afegir nous hàbits, activar mòduls opcionals i molt més.
          </p>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onConfigure}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm"
            >
              <Settings className="w-4 h-4" />
              Configurar ara
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors text-sm"
            >
              Més tard, gràcies
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}