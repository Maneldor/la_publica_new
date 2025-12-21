'use client'

import { useEffect, useState } from 'react'
import { Target, Check, ChevronRight, Plus, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/design-system'

interface Task {
  id: string
  text: string
  completed: boolean
}

interface Goal {
  id: string
  text: string
  tasks: Task[]
}

export function TodayGoals({ userId }: { userId: string }) {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const res = await fetch(`/api/agenda/goals?date=${today}`)
        if (res.ok) {
          const data = await res.json()
          setGoal(data)
        }
      } catch (error) {
        console.error('Error fetching goal:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchGoal()
  }, [userId])

  const completedTasks = goal?.tasks?.filter(t => t.completed).length || 0
  const totalTasks = goal?.tasks?.length || 0
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle
          icon={<Target className="w-5 h-5 text-emerald-500" />}
          action={
            <Link
              href="/dashboard/agenda"
              className={`${TYPOGRAPHY.link} flex items-center gap-1`}
            >
              Editar
              <ChevronRight className="w-4 h-4" />
            </Link>
          }
        >
          Objectiu del dia
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <div className="h-6 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-2 bg-gray-100 rounded-full animate-pulse" />
          </div>
        ) : goal?.text ? (
          <>
            <div className="mb-4">
              <p className="text-gray-900 font-medium text-base italic">"{goal.text}"</p>
            </div>

            {goal.tasks && goal.tasks.length > 0 && (
              <>
                <div className="space-y-2 mb-4">
                  {goal.tasks.slice(0, 4).map((task) => (
                    <div key={task.id} className="flex items-start gap-3 text-sm">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-gray-300 hover:border-emerald-400'
                      }`}>
                        {task.completed && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`flex-1 transition-colors ${
                        task.completed
                          ? 'text-gray-400 line-through'
                          : 'text-gray-700'
                      }`}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                  {goal.tasks.length > 4 && (
                    <p className={`${TYPOGRAPHY.small} ml-8`}>+{goal.tasks.length - 4} tasques més</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progrés del dia</span>
                    <span className="font-medium">{completedTasks}/{totalTasks} completades</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full transition-all duration-700 flex items-center justify-end pr-1"
                      style={{ width: `${Math.max(progressPercent, 0)}%` }}
                    >
                      {progressPercent > 20 && (
                        <span className="text-white text-xs font-bold">
                          {Math.round(progressPercent)}%
                        </span>
                      )}
                    </div>
                  </div>
                  {progressPercent === 100 && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <p className="text-emerald-600 text-xs font-medium">
                        Objectiu completat!
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <Target className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className={`${TYPOGRAPHY.body} mb-3`}>No tens objectiu definit per avui</p>
            <Link
              href="/dashboard/agenda"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Definir objectiu
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}