// app/welcome/WelcomeExperience.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Heart, Handshake, Home,
  Gift, Sparkles, Star, MessageCircle,
  Award, Lightbulb, Compass, Rocket,
  Trophy, Zap, Shield, User,
  ArrowRight, TrendingUp, CheckCircle,
  MessageSquare,
  type LucideIcon
} from 'lucide-react'
import { completeOnboarding } from '@/lib/actions/onboarding-actions'

interface WelcomeExperienceProps {
  userName: string
  userId: string
}

type Step = 'letter' | 'tour-1' | 'tour-2' | 'tour-3'

interface FloatingElement {
  id: number
  type: 'icon' | 'word'
  content: LucideIcon | string
  position: { x: string; y: string }
  rotation: number
  color: string
  size?: string
  strokeWidth?: number
  delay: number
}

// 28 elementos flotantes distribuidos ORGÁNICAMENTE
const floatingElements: FloatingElement[] = [
  // === IZQUIERDA (dispersos, no en línea) ===
  {
    id: 1,
    type: 'icon',
    content: Users,
    position: { x: '3%', y: '12%' },
    rotation: -12,
    color: 'text-blue-500',
    size: 'w-12 h-12',
    strokeWidth: 1.5,
    delay: 0.5,
  },
  {
    id: 2,
    type: 'word',
    content: 'Connexió',
    position: { x: '8%', y: '28%' },
    rotation: -5,
    color: 'text-cyan-500',
    size: 'text-4xl',
    delay: 1.0,
  },
  {
    id: 3,
    type: 'icon',
    content: Heart,
    position: { x: '2%', y: '42%' },
    rotation: -8,
    color: 'text-red-500',
    size: 'w-10 h-10',
    strokeWidth: 1.5,
    delay: 1.5,
  },
  {
    id: 4,
    type: 'word',
    content: 'Confiança',
    position: { x: '5%', y: '55%' },
    rotation: -10,
    color: 'text-purple-500',
    size: 'text-4xl',
    delay: 2.0,
  },
  {
    id: 5,
    type: 'icon',
    content: Handshake,
    position: { x: '10%', y: '68%' },
    rotation: -6,
    color: 'text-indigo-500',
    size: 'w-11 h-11',
    strokeWidth: 1.5,
    delay: 2.5,
  },
  {
    id: 6,
    type: 'word',
    content: 'Suport',
    position: { x: '3%', y: '78%' },
    rotation: -8,
    color: 'text-emerald-500',
    size: 'text-4xl',
    delay: 3.0,
  },
  {
    id: 7,
    type: 'icon',
    content: Home,
    position: { x: '7%', y: '88%' },
    rotation: -4,
    color: 'text-orange-500',
    size: 'w-10 h-10',
    strokeWidth: 1.5,
    delay: 3.5,
  },
  {
    id: 8,
    type: 'word',
    content: 'Equip',
    position: { x: '12%', y: '38%' },
    rotation: -7,
    color: 'text-amber-500',
    size: 'text-4xl',
    delay: 4.0,
  },

  // === DERECHA (dispersos, no en línea) ===
  {
    id: 9,
    type: 'word',
    content: 'Comunitat',
    position: { x: '82%', y: '10%' },
    rotation: 7,
    color: 'text-rose-500',
    size: 'text-4xl',
    delay: 0.8,
  },
  {
    id: 10,
    type: 'icon',
    content: Gift,
    position: { x: '92%', y: '22%' },
    rotation: 10,
    color: 'text-pink-500',
    size: 'w-11 h-11',
    strokeWidth: 1.5,
    delay: 1.3,
  },
  {
    id: 11,
    type: 'word',
    content: 'Amistat',
    position: { x: '85%', y: '35%' },
    rotation: 5,
    color: 'text-violet-500',
    size: 'text-4xl',
    delay: 1.8,
  },
  {
    id: 12,
    type: 'icon',
    content: Sparkles,
    position: { x: '90%', y: '48%' },
    rotation: 12,
    color: 'text-yellow-500',
    size: 'w-10 h-10',
    strokeWidth: 1.5,
    delay: 2.3,
  },
  {
    id: 13,
    type: 'word',
    content: 'Pertinença',
    position: { x: '80%', y: '58%' },
    rotation: 6,
    color: 'text-teal-500',
    size: 'text-4xl',
    delay: 2.8,
  },
  {
    id: 14,
    type: 'icon',
    content: Star,
    position: { x: '93%', y: '70%' },
    rotation: 8,
    color: 'text-amber-500',
    size: 'w-12 h-12',
    strokeWidth: 1.5,
    delay: 3.3,
  },
  {
    id: 15,
    type: 'word',
    content: 'Beneficis',
    position: { x: '83%', y: '82%' },
    rotation: 9,
    color: 'text-blue-500',
    size: 'text-4xl',
    delay: 3.8,
  },
  {
    id: 16,
    type: 'icon',
    content: MessageCircle,
    position: { x: '88%', y: '92%' },
    rotation: 6,
    color: 'text-green-500',
    size: 'w-10 h-10',
    strokeWidth: 1.5,
    delay: 4.3,
  },

  // === ZONA SUPERIOR (cerca del logo) ===
  {
    id: 17,
    type: 'icon',
    content: Award,
    position: { x: '25%', y: '8%' },
    rotation: -10,
    color: 'text-yellow-500',
    size: 'w-10 h-10',
    strokeWidth: 1.5,
    delay: 0.6,
  },
  {
    id: 18,
    type: 'word',
    content: 'Creixement',
    position: { x: '70%', y: '6%' },
    rotation: 8,
    color: 'text-lime-500',
    size: 'text-4xl',
    delay: 0.9,
  },
  {
    id: 19,
    type: 'icon',
    content: Lightbulb,
    position: { x: '18%', y: '18%' },
    rotation: -5,
    color: 'text-amber-500',
    size: 'w-9 h-9',
    strokeWidth: 1.5,
    delay: 1.2,
  },
  {
    id: 20,
    type: 'icon',
    content: Compass,
    position: { x: '78%', y: '5%' },
    rotation: 12,
    color: 'text-sky-500',
    size: 'w-10 h-10',
    strokeWidth: 1.5,
    delay: 1.4,
  },
  {
    id: 21,
    type: 'icon',
    content: Zap,
    position: { x: '15%', y: '5%' },
    rotation: -15,
    color: 'text-orange-500',
    size: 'w-8 h-8',
    strokeWidth: 1.5,
    delay: 0.7,
  },
  {
    id: 22,
    type: 'word',
    content: 'Èxit',
    position: { x: '88%', y: '15%' },
    rotation: 5,
    color: 'text-fuchsia-500',
    size: 'text-4xl',
    delay: 1.1,
  },

  // === ZONA INFERIOR (cerca del botón) ===
  {
    id: 23,
    type: 'word',
    content: 'Futur',
    position: { x: '20%', y: '88%' },
    rotation: -6,
    color: 'text-cyan-500',
    size: 'text-4xl',
    delay: 3.6,
  },
  {
    id: 24,
    type: 'icon',
    content: Rocket,
    position: { x: '30%', y: '82%' },
    rotation: -12,
    color: 'text-red-500',
    size: 'w-10 h-10',
    strokeWidth: 1.5,
    delay: 3.9,
  },
  {
    id: 25,
    type: 'word',
    content: 'Junts',
    position: { x: '75%', y: '90%' },
    rotation: 8,
    color: 'text-indigo-500',
    size: 'text-4xl',
    delay: 4.1,
  },
  {
    id: 26,
    type: 'icon',
    content: Trophy,
    position: { x: '68%', y: '85%' },
    rotation: 10,
    color: 'text-amber-500',
    size: 'w-11 h-11',
    strokeWidth: 1.5,
    delay: 4.4,
  },
  {
    id: 27,
    type: 'icon',
    content: Shield,
    position: { x: '25%', y: '72%' },
    rotation: -8,
    color: 'text-blue-500',
    size: 'w-9 h-9',
    strokeWidth: 1.5,
    delay: 2.7,
  },
  {
    id: 28,
    type: 'word',
    content: 'Valor',
    position: { x: '72%', y: '78%' },
    rotation: 6,
    color: 'text-emerald-500',
    size: 'text-4xl',
    delay: 3.2,
  },
]

// Variantes de animación para page turn 3D
const pageTurnVariants = {
  initial: {
    rotateY: 90,
    opacity: 0,
    transformOrigin: 'right center',
  },
  animate: {
    rotateY: 0,
    opacity: 1,
    transformOrigin: 'right center',
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    rotateY: -90,
    opacity: 0,
    transformOrigin: 'left center',
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// Configuración de los 3 pasos del tour
const tourSteps = [
  {
    step: 1,
    title: 'La Comunitat',
    description: 'Connecta amb milers d\'empleats públics de tot Catalunya. Comparteix experiències, coneixement i creix professionalment amb persones que entenen la teva feina.',
    mainIcon: Users,
    iconColor: 'bg-blue-500',
    bgGradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    features: [
      { icon: MessageSquare, text: 'Fòrums i discussions', color: 'text-blue-500' },
      { icon: Users, text: 'Grups professionals', color: 'text-indigo-500' },
      { icon: Heart, text: 'Connexions autèntiques', color: 'text-pink-500' },
    ],
  },
  {
    step: 2,
    title: 'Els Beneficis',
    description: 'Accedeix a ofertes i descomptes exclusius d\'empreses col·laboradores. Avantatges únics només per a tu, per ser part del servei públic.',
    mainIcon: Gift,
    iconColor: 'bg-emerald-500',
    bgGradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    features: [
      { icon: Star, text: 'Ofertes exclusives', color: 'text-amber-500' },
      { icon: TrendingUp, text: 'Estalvi acumulat', color: 'text-emerald-500' },
      { icon: Zap, text: 'Accés immediat', color: 'text-yellow-500' },
    ],
  },
  {
    step: 3,
    title: 'El Teu Espai',
    description: 'El teu perfil personalitzat, les teves connexions, el teu historial d\'estalvi. Tot el que necessites, organitzat i accessible des d\'un sol lloc.',
    mainIcon: User,
    iconColor: 'bg-purple-500',
    bgGradient: 'bg-gradient-to-br from-purple-500 to-pink-600',
    features: [
      { icon: User, text: 'Perfil professional', color: 'text-purple-500' },
      { icon: Shield, text: 'Dades segures', color: 'text-blue-500' },
      { icon: CheckCircle, text: 'Tot organitzat', color: 'text-green-500' },
    ],
  },
]

export function WelcomeExperience({ userName, userId }: WelcomeExperienceProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('letter')
  const [letterText, setLetterText] = useState('')
  const [showButton, setShowButton] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [visibleElements, setVisibleElements] = useState<number[]>([])

  const fullLetterText = `Hola, ${userName}.

Ens alegra que siguis aquí.

A La Pública trobaràs una comunitat de persones com tu, que cada dia treballen al servei públic.

Un espai on connectar, aprendre, compartir i gaudir de beneficis exclusius.

Benvingut a casa.`

  // Efecto typewriter
  useEffect(() => {
    if (currentStep !== 'letter') return

    let index = 0
    const timer = setInterval(() => {
      if (index < fullLetterText.length) {
        setLetterText(fullLetterText.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
        setTimeout(() => setShowButton(true), 800)
      }
    }, 65)

    return () => clearInterval(timer)
  }, [currentStep, fullLetterText])

  // Mostrar elementos flotantes progresivamente
  useEffect(() => {
    if (currentStep !== 'letter') return

    floatingElements.forEach((element) => {
      setTimeout(() => {
        setVisibleElements(prev => [...prev, element.id])
      }, element.delay * 1000)
    })
  }, [currentStep])

  const handleNext = () => {
    switch (currentStep) {
      case 'letter':
        setCurrentStep('tour-1')
        break
      case 'tour-1':
        setCurrentStep('tour-2')
        break
      case 'tour-2':
        setCurrentStep('tour-3')
        break
      case 'tour-3':
        handleComplete()
        break
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      await completeOnboarding(userId)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    setIsLoading(true)
    try {
      await completeOnboarding(userId)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error skipping onboarding:', error)
      setIsLoading(false)
    }
  }

  // Determinar si estamos en la carta o en el tour
  const isLetter = currentStep === 'letter'

  return (
    <div
      className={`min-h-screen relative overflow-hidden flex items-center justify-center p-6 transition-colors duration-700 ${
        isLetter ? '' : 'bg-gray-50'
      }`}
      style={isLetter ? { backgroundColor: '#f5f0e6' } : {}}
    >
      {/* Fondo sepia con textura solo para la carta */}
      {isLetter && (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              opacity: 0.08,
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 0%, rgba(139, 119, 92, 0.12) 100%)',
            }}
          />
          <FloatingElements
            elements={floatingElements}
            visibleIds={visibleElements}
          />
        </>
      )}

      {/* Contenido con AnimatePresence para transiciones page-turn */}
      <AnimatePresence mode="wait">
        {currentStep === 'letter' && (
          <motion.div
            key="letter"
            variants={pageTurnVariants}
            initial="animate"
            exit="exit"
            style={{ perspective: 1500 }}
            className="w-full flex justify-center"
          >
            <LetterStep
              text={letterText}
              showButton={showButton}
              onNext={handleNext}
              onSkip={handleSkip}
            />
          </motion.div>
        )}

        {currentStep === 'tour-1' && (
          <ModernTourStep
            key="tour-1"
            {...tourSteps[0]}
            onNext={handleNext}
            onSkip={handleSkip}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'tour-2' && (
          <ModernTourStep
            key="tour-2"
            {...tourSteps[1]}
            onNext={handleNext}
            onSkip={handleSkip}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'tour-3' && (
          <ModernTourStep
            key="tour-3"
            {...tourSteps[2]}
            onNext={handleNext}
            onSkip={handleSkip}
            isLast
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Componente de elementos flotantes con BRILLO
function FloatingElements({
  elements,
  visibleIds
}: {
  elements: typeof floatingElements
  visibleIds: number[]
}) {
  return (
    <>
      {elements.map((element) => {
        const isVisible = visibleIds.includes(element.id)
        const IconComponent = element.type === 'icon' ? element.content as React.ComponentType<{ className?: string; strokeWidth?: number }> : null

        return (
          <motion.div
            key={element.id}
            className={`absolute ${element.color} pointer-events-none select-none`}
            style={{
              left: element.position.x,
              top: element.position.y,
              filter: 'drop-shadow(0 0 8px currentColor)',
            }}
            initial={{
              opacity: 0,
              scale: 0,
              rotate: element.rotation - 20,
              y: 30,
            }}
            animate={isVisible ? {
              opacity: 0.8,
              scale: 1,
              rotate: element.rotation,
              y: 0,
            } : {
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: 1,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            {element.type === 'icon' && IconComponent && (
              <IconComponent className={element.size || 'w-10 h-10'} strokeWidth={element.strokeWidth || 1.5} />
            )}
            {element.type === 'word' && (
              <span
                className={element.size || 'text-4xl'}
                style={{ fontFamily: '"Dynalight", cursive' }}
              >
                {String(element.content)}
              </span>
            )}
          </motion.div>
        )
      })}
    </>
  )
}

// Componente de la Carta con DYNALIGHT inline
function LetterStep({
  text,
  showButton,
  onNext,
  onSkip
}: {
  text: string
  showButton: boolean
  onNext: () => void
  onSkip: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl w-full text-center z-10 relative"
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 1.2,
          ease: [0.34, 1.56, 0.64, 1],
        }}
        className="mb-16"
      >
        <img
          src="/images/cropped-logo_la-Pública-ok-2.png"
          alt="La Pública"
          className="h-20 md:h-24 mx-auto"
        />
      </motion.div>

      {/* Carta - TIPOGRAFÍA DYNALIGHT con style inline */}
      <div
        className="text-4xl text-gray-900 leading-relaxed text-center min-h-[320px]"
        style={{ fontFamily: '"Dynalight", cursive' }}
      >
        {text.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className="mb-6">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Botón */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showButton ? 1 : 0, y: showButton ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-12"
      >
        <button
          onClick={onNext}
          disabled={!showButton}
          className="px-10 py-4 bg-amber-800 text-amber-50 text-lg rounded-lg font-medium hover:bg-amber-900 transition-all hover:scale-105 disabled:opacity-0 disabled:pointer-events-none shadow-lg"
        >
          Descobrir La Pública
        </button>
        <p className="mt-4 text-sm text-amber-700/60">
          Tour de 45 segons
        </p>
        <button
          onClick={onSkip}
          disabled={!showButton}
          className="mt-3 text-xs text-amber-600/40 hover:text-amber-600/60 transition-colors disabled:opacity-0"
        >
          Saltar i anar al dashboard
        </button>
      </motion.div>
    </motion.div>
  )
}

// Componente de icono animado para features
function AnimatedFeatureIcon({
  icon: Icon,
  color,
  delay = 0
}: {
  icon: LucideIcon
  color: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        delay,
        duration: 0.5,
        type: 'spring',
        stiffness: 200,
      }}
      className={`${color} p-3 rounded-2xl bg-white shadow-lg`}
    >
      <Icon className="w-8 h-8" strokeWidth={1.5} />
    </motion.div>
  )
}

// Componente del Tour MODERNO con page-turn
function ModernTourStep({
  step,
  title,
  description,
  features,
  mainIcon: MainIcon,
  iconColor,
  bgGradient,
  onNext,
  onSkip,
  isLast = false,
  isLoading = false
}: {
  step: number
  title: string
  description: string
  features: { icon: LucideIcon; text: string; color: string }[]
  mainIcon: LucideIcon
  iconColor: string
  bgGradient: string
  onNext: () => void
  onSkip: () => void
  isLast?: boolean
  isLoading?: boolean
}) {
  return (
    <motion.div
      variants={pageTurnVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ perspective: 1500 }}
      className="w-full max-w-4xl mx-auto z-10"
    >
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Header con gradiente y icono principal */}
        <div className={`${bgGradient} p-8 md:p-12 relative overflow-hidden`}>

          {/* Elementos decorativos de fondo */}
          <div className="absolute inset-0 opacity-10">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full"
            />
            <motion.div
              animate={{
                rotate: -360,
              }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full"
            />
          </div>

          {/* Icono principal animado */}
          <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
            className="relative z-10 flex justify-center mb-6"
          >
            <div className={`${iconColor} p-6 rounded-3xl bg-white/20 backdrop-blur-sm`}>
              <MainIcon className="w-16 h-16 md:w-20 md:h-20 text-white" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* Progress dots */}
          <div className="relative z-10 flex justify-center gap-2 mb-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 * i }}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === step ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Título */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative z-10 text-3xl md:text-4xl font-bold text-white text-center"
          >
            {title}
          </motion.h2>
        </div>

        {/* Contenido */}
        <div className="p-8 md:p-12">

          {/* Descripción */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-gray-600 text-center mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {description}
          </motion.p>

          {/* Features con iconos animados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.15 }}
                className="flex flex-col items-center text-center p-4"
              >
                <AnimatedFeatureIcon
                  icon={feature.icon}
                  color={feature.color}
                  delay={0.7 + idx * 0.15}
                />
                <p className="mt-4 text-gray-700 font-medium">{feature.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Botón siguiente */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <button
              onClick={onNext}
              disabled={isLoading}
              className="group flex items-center gap-3 px-8 py-4 bg-gray-900 text-white text-lg font-medium rounded-xl hover:bg-gray-800 transition-all hover:scale-105 shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'Carregant...' : isLast ? 'Començar' : 'Següent'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Skip button */}
            {!isLast && (
              <button
                onClick={onSkip}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Saltar tour
              </button>
            )}

            {/* Indicador de paso */}
            <p className="text-sm text-gray-400">
              Pas {step} de 3
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
