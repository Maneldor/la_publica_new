'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2, AlertCircle, Plus, Trash2, GripVertical, Check, HelpCircle, ChevronDown, ChevronRight } from 'lucide-react'

interface QuizQuestion {
  id?: string
  question: string
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE'
  options: {
    id?: string
    text: string
    isCorrect: boolean
  }[]
  explanation?: string
  order: number
}

interface Quiz {
  id: string
  title: string
  description: string | null
  passingScore: number
  maxAttempts: number | null
  timeLimit: number | null
  shuffleQuestions: boolean
  showCorrectAnswers: boolean
  questions: QuizQuestion[]
}

interface QuizEditorModalProps {
  lessonId: string
  onClose: () => void
  onSuccess: () => void
}

export function QuizEditorModal({ lessonId, onClose, onSuccess }: QuizEditorModalProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [title, setTitle] = useState('Quiz')
  const [description, setDescription] = useState('')
  const [passingScore, setPassingScore] = useState('70')
  const [maxAttempts, setMaxAttempts] = useState('')
  const [timeLimit, setTimeLimit] = useState('')
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])

  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set([0]))

  useEffect(() => {
    loadQuiz()
  }, [lessonId])

  async function loadQuiz() {
    try {
      const response = await fetch(`/api/gestio/courses/lessons?id=${lessonId}`)
      const data = await response.json()

      if (response.ok && data.lesson?.quiz) {
        const q = data.lesson.quiz
        setQuiz(q)
        setTitle(q.title || 'Quiz')
        setDescription(q.description || '')
        setPassingScore(q.passingScore?.toString() || '70')
        setMaxAttempts(q.maxAttempts?.toString() || '')
        setTimeLimit(q.timeLimit?.toString() || '')
        setShuffleQuestions(q.shuffleQuestions || false)
        setShowCorrectAnswers(q.showCorrectAnswers !== false)
        setQuestions(q.questions || [])
      } else {
        // No quiz yet, start with empty
        setQuestions([createEmptyQuestion(0)])
      }
    } catch (error) {
      console.error('Error loading quiz:', error)
      setQuestions([createEmptyQuestion(0)])
    } finally {
      setLoading(false)
    }
  }

  function createEmptyQuestion(order: number): QuizQuestion {
    return {
      question: '',
      type: 'SINGLE_CHOICE',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      explanation: '',
      order
    }
  }

  function addQuestion() {
    const newQuestion = createEmptyQuestion(questions.length)
    setQuestions([...questions, newQuestion])
    setExpandedQuestions(new Set([...expandedQuestions, questions.length]))
  }

  function removeQuestion(index: number) {
    if (questions.length <= 1) {
      setError('El quiz ha de tenir almenys una pregunta')
      return
    }
    const newQuestions = questions.filter((_, i) => i !== index)
    setQuestions(newQuestions.map((q, i) => ({ ...q, order: i })))
  }

  function updateQuestion(index: number, updates: Partial<QuizQuestion>) {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], ...updates }
    setQuestions(newQuestions)
  }

  function addOption(questionIndex: number) {
    const question = questions[questionIndex]
    if (question.options.length >= 6) return

    const newOptions = [...question.options, { text: '', isCorrect: false }]
    updateQuestion(questionIndex, { options: newOptions })
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    const question = questions[questionIndex]
    if (question.options.length <= 2) return

    const newOptions = question.options.filter((_, i) => i !== optionIndex)
    updateQuestion(questionIndex, { options: newOptions })
  }

  function updateOption(questionIndex: number, optionIndex: number, updates: { text?: string; isCorrect?: boolean }) {
    const question = questions[questionIndex]
    const newOptions = [...question.options]

    // For single choice, uncheck others if this one is being checked
    if (updates.isCorrect && question.type === 'SINGLE_CHOICE') {
      newOptions.forEach((opt, i) => {
        newOptions[i] = { ...opt, isCorrect: i === optionIndex }
      })
    } else {
      newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates }
    }

    updateQuestion(questionIndex, { options: newOptions })
  }

  function toggleQuestionExpand(index: number) {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedQuestions(newExpanded)
  }

  async function handleSubmit() {
    // Validate
    if (questions.length === 0) {
      setError('Cal afegir almenys una pregunta')
      return
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) {
        setError(`La pregunta ${i + 1} no té text`)
        return
      }
      if (q.options.filter(o => o.text.trim()).length < 2) {
        setError(`La pregunta ${i + 1} necessita almenys 2 opcions`)
        return
      }
      if (!q.options.some(o => o.isCorrect)) {
        setError(`La pregunta ${i + 1} no té cap resposta correcta marcada`)
        return
      }
    }

    setSaving(true)
    setError(null)

    try {
      if (quiz) {
        // Update existing quiz
        const response = await fetch('/api/gestio/courses/lessons', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'updateQuiz',
            quizId: quiz.id,
            title,
            description: description || null,
            passingScore: parseInt(passingScore) || 70,
            maxAttempts: maxAttempts ? parseInt(maxAttempts) : null,
            timeLimit: timeLimit ? parseInt(timeLimit) : null,
            shuffleQuestions,
            showCorrectAnswers
            // Note: For full question updates, you'd need a more complex API
          })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Error actualitzant el quiz')
        }
      } else {
        // Create new quiz
        const response = await fetch('/api/gestio/courses/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'createQuiz',
            lessonId,
            title,
            description: description || null,
            passingScore: parseInt(passingScore) || 70,
            maxAttempts: maxAttempts ? parseInt(maxAttempts) : null,
            timeLimit: timeLimit ? parseInt(timeLimit) : null,
            shuffleQuestions,
            showCorrectAnswers,
            questions: questions.map(q => ({
              question: q.question,
              type: q.type,
              explanation: q.explanation || null,
              order: q.order,
              options: q.options.filter(o => o.text.trim()).map((o, i) => ({
                text: o.text,
                isCorrect: o.isCorrect,
                order: i
              }))
            }))
          })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Error creant el quiz')
        }
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut')
    } finally {
      setSaving(false)
    }
  }

  function getQuestionTypeLabel(type: string) {
    switch (type) {
      case 'SINGLE_CHOICE': return 'Opció única'
      case 'MULTIPLE_CHOICE': return 'Opció múltiple'
      case 'TRUE_FALSE': return 'Vertader/Fals'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <HelpCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Editor de Quiz</h2>
              <p className="text-sm text-gray-500">Configura les preguntes i opcions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Quiz Settings */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h3 className="font-medium text-gray-900">Configuració general</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Títol</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Puntuació mínima (%)</label>
                  <input
                    type="number"
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Intents màxims</label>
                  <input
                    type="number"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(e.target.value)}
                    min="1"
                    placeholder="Il·limitats"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Límit de temps (minuts)</label>
                  <input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    min="1"
                    placeholder="Sense límit"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Barrejar preguntes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCorrectAnswers}
                    onChange={(e) => setShowCorrectAnswers(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Mostrar respostes correctes</span>
                </label>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Preguntes ({questions.length})</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  Afegir pregunta
                </button>
              </div>

              {questions.map((question, qIndex) => (
                <div key={qIndex} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Question header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer"
                    onClick={() => toggleQuestionExpand(qIndex)}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                      {expandedQuestions.has(qIndex) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        Pregunta {qIndex + 1}
                      </span>
                      {question.question && (
                        <span className="text-sm text-gray-500 truncate max-w-[200px]">
                          - {question.question}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {getQuestionTypeLabel(question.type)}
                      </span>
                      <button
                        onClick={() => removeQuestion(qIndex)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question content */}
                  {expandedQuestions.has(qIndex) && (
                    <div className="p-4 space-y-4">
                      {/* Question text */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pregunta *
                        </label>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                          placeholder="Escriu la pregunta..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-400"
                        />
                      </div>

                      {/* Question type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipus de pregunta
                        </label>
                        <select
                          value={question.type}
                          onChange={(e) => {
                            const newType = e.target.value as QuizQuestion['type']
                            let newOptions = question.options

                            if (newType === 'TRUE_FALSE') {
                              newOptions = [
                                { text: 'Vertader', isCorrect: false },
                                { text: 'Fals', isCorrect: false }
                              ]
                            }

                            updateQuestion(qIndex, { type: newType, options: newOptions })
                          }}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                        >
                          <option value="SINGLE_CHOICE">Opció única</option>
                          <option value="MULTIPLE_CHOICE">Opció múltiple</option>
                          <option value="TRUE_FALSE">Vertader/Fals</option>
                        </select>
                      </div>

                      {/* Options */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">Opcions</label>
                          {question.type !== 'TRUE_FALSE' && (
                            <button
                              type="button"
                              onClick={() => addOption(qIndex)}
                              disabled={question.options.length >= 6}
                              className="text-xs text-purple-600 hover:underline disabled:opacity-50"
                            >
                              + Afegir opció
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateOption(qIndex, oIndex, { isCorrect: !option.isCorrect })}
                                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  option.isCorrect
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                {option.isCorrect && <Check className="w-4 h-4" />}
                              </button>
                              <input
                                type="text"
                                value={option.text}
                                onChange={(e) => updateOption(qIndex, oIndex, { text: e.target.value })}
                                placeholder={`Opció ${oIndex + 1}`}
                                disabled={question.type === 'TRUE_FALSE'}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 text-gray-900 bg-white placeholder:text-gray-400"
                              />
                              {question.type !== 'TRUE_FALSE' && question.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(qIndex, oIndex)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {question.type === 'SINGLE_CHOICE'
                            ? 'Marca una opció com a correcta'
                            : question.type === 'MULTIPLE_CHOICE'
                            ? 'Marca totes les opcions correctes'
                            : 'Marca la resposta correcta'}
                        </p>
                      </div>

                      {/* Explanation */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Explicació (opcional)
                        </label>
                        <textarea
                          value={question.explanation || ''}
                          onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                          placeholder="Explicació que es mostrarà després de respondre..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-gray-900 bg-white placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add question button */}
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Afegir pregunta
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel·lar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardant...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar quiz
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
