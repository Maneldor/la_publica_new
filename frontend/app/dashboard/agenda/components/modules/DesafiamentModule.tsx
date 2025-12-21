'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, Check, Trophy, Flame } from 'lucide-react'
import { TrophyIcon } from '@/components/icons'

interface ChallengeLog {
  id: string
  day: number
  date: string
  completed: boolean
  notes?: string
}

interface Challenge {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  isActive: boolean
  isCompleted: boolean
  logs: ChallengeLog[]
}

interface DesafiamentModuleProps {
  onClose?: () => void
}

export function DesafiamentModule({ onClose }: DesafiamentModuleProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadChallenges()
  }, [])

  const loadChallenges = async () => {
    try {
      const res = await fetch('/api/agenda/challenges?active=true')
      if (res.ok) {
        const data = await res.json()
        setChallenges(data)
      }
    } catch (error) {
      console.error('Error carregant reptes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createChallenge = async () => {
    if (!newTitle.trim()) return
    setSaving(true)

    try {
      const res = await fetch('/api/agenda/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDescription })
      })

      if (res.ok) {
        setNewTitle('')
        setNewDescription('')
        setShowNewForm(false)
        loadChallenges()
      }
    } catch (error) {
      console.error('Error creant repte:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleDay = async (challengeId: string, day: number, currentCompleted: boolean) => {
    try {
      await fetch(`/api/agenda/challenges/${challengeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day, completed: !currentCompleted })
      })
      loadChallenges()
    } catch (error) {
      console.error('Error actualitzant dia:', error)
    }
  }

  const getCompletedCount = (logs: ChallengeLog[]) => {
    return logs.filter(l => l.completed).length
  }

  const getCurrentStreak = (logs: ChallengeLog[]) => {
    let streak = 0
    const sortedLogs = [...logs].sort((a, b) => b.day - a.day)

    for (const log of sortedLogs) {
      if (log.completed) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  const getTodayDay = (challenge: Challenge) => {
    const start = new Date(challenge.startDate)
    const today = new Date()
    const diffTime = today.getTime() - start.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return Math.min(21, Math.max(1, diffDays + 1))
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  const activeChallenge = challenges.find(c => c.isActive && !c.isCompleted)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <TrophyIcon size="md" />
          <h3 className="font-semibold text-gray-900">Desafiament 21 dies</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {!activeChallenge && !showNewForm && (
        <div className="text-center py-6">
          <Trophy className="w-12 h-12 text-amber-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">
            Comença un repte de 21 dies per crear un nou hàbit
          </p>
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nou desafiament
          </button>
        </div>
      )}

      {showNewForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="El meu repte de 21 dies..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            autoFocus
          />
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Descripció (opcional)"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowNewForm(false)}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel·lar
            </button>
            <button
              onClick={createChallenge}
              disabled={saving || !newTitle.trim()}
              className="px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Creant...' : 'Començar'}
            </button>
          </div>
        </motion.div>
      )}

      {activeChallenge && (
        <div className="space-y-4">
          {/* Info del reto */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{activeChallenge.title}</h4>
              {activeChallenge.description && (
                <p className="text-sm text-gray-500">{activeChallenge.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getCurrentStreak(activeChallenge.logs) > 0 && (
                <span className="flex items-center gap-1 text-sm text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                  <Flame className="w-4 h-4" />
                  {getCurrentStreak(activeChallenge.logs)}
                </span>
              )}
            </div>
          </div>

          {/* Progreso */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all"
                style={{ width: `${(getCompletedCount(activeChallenge.logs) / 21) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {getCompletedCount(activeChallenge.logs)}/21
            </span>
          </div>

          {/* Grid de días */}
          <div className="grid grid-cols-7 gap-1.5">
            {activeChallenge.logs.map((log) => {
              const todayDay = getTodayDay(activeChallenge)
              const isToday = log.day === todayDay
              const isPast = log.day < todayDay
              const isFuture = log.day > todayDay

              return (
                <button
                  key={log.day}
                  onClick={() => !isFuture && toggleDay(activeChallenge.id, log.day, log.completed)}
                  disabled={isFuture}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all
                    ${log.completed
                      ? 'bg-amber-500 text-white'
                      : isToday
                        ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500'
                        : isPast
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-gray-50 text-gray-300'
                    }
                    ${!isFuture && 'hover:scale-110 cursor-pointer'}
                    ${isFuture && 'cursor-not-allowed opacity-50'}
                  `}
                >
                  {log.completed ? <Check className="w-3 h-3" /> : log.day}
                </button>
              )
            })}
          </div>

          {/* Día actual */}
          <p className="text-center text-sm text-gray-500">
            Dia {getTodayDay(activeChallenge)} de 21
          </p>
        </div>
      )}
    </div>
  )
}
