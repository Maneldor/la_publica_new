'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Quote, RefreshCw } from 'lucide-react'

// Frases motivadores en català
const QUOTES = [
  { text: "Cada dia és una nova oportunitat per ser millor.", author: "Anònim" },
  { text: "El secret de l'èxit és començar.", author: "Mark Twain" },
  { text: "No comptis els dies, fes que els dies comptin.", author: "Muhammad Ali" },
  { text: "La disciplina és el pont entre objectius i èxit.", author: "Jim Rohn" },
  { text: "Fes-ho ara. De vegades 'després' es converteix en 'mai'.", author: "Anònim" },
  { text: "Els petits passos cada dia porten a grans canvis.", author: "Anònim" },
  { text: "L'únic impossible és allò que no intentes.", author: "Anònim" },
  { text: "Converteix els teus obstacles en oportunitats.", author: "Anònim" },
  { text: "La constància supera el talent.", author: "Anònim" },
  { text: "Avui és un bon dia per tenir un bon dia.", author: "Anònim" },
]

export function WelcomeBanner() {
  const [quote, setQuote] = useState(QUOTES[0])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Seleccionar una frase aleatòria al carregar
    const randomIndex = Math.floor(Math.random() * QUOTES.length)
    setQuote(QUOTES[randomIndex])
  }, [])

  const refreshQuote = () => {
    const randomIndex = Math.floor(Math.random() * QUOTES.length)
    setQuote(QUOTES[randomIndex])
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 relative"
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 p-1 hover:bg-blue-100 rounded-lg transition-colors"
          aria-label="Tancar"
        >
          <X className="w-4 h-4 text-blue-400" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Quote className="w-4 h-4 text-blue-600" />
          </div>

          <div className="flex-1">
            <p className="text-gray-700 font-medium italic">
              &ldquo;{quote.text}&rdquo;
            </p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-500">
                — {quote.author}
              </p>
              <button
                onClick={refreshQuote}
                className="p-1 hover:bg-blue-100 rounded-lg transition-colors text-blue-500"
                aria-label="Nova frase"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}