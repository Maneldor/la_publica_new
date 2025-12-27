// lib/services/courseAIService.ts

import { prisma } from '@/lib/prisma'
import { CourseType, CourseLevel, LessonType, QuestionType } from '@prisma/client'
import { createCourse, createModule, createLesson, createQuiz, updateLesson } from './courseService'

// ============================================
// TIPUS
// ============================================

export interface GenerateCourseInput {
  topic: string
  type: CourseType
  level: CourseLevel
  targetAudience?: string
  additionalInstructions?: string
  categoryId?: string
  createdById: string
  language?: 'ca' | 'es'
}

export interface CourseOutline {
  title: string
  shortDescription: string
  description: string
  objectives: string[]
  requirements: string[]
  targetAudience: string
  modules: {
    title: string
    description: string
    lessons: {
      title: string
      description: string
      type: LessonType
      estimatedDuration: number
    }[]
  }[]
}

interface AIConfiguration {
  temperature: number
  maxTokens: number
}

// ============================================
// CONFIGURACIÓ DE TIPUS DE CURS
// ============================================

const COURSE_TYPE_CONFIG = {
  MICRO: { maxModules: 1, maxLessons: 5, maxDuration: 60 },
  BASIC: { maxModules: 4, maxLessons: 20, maxDuration: 300 },
  COMPLETE: { maxModules: 10, maxLessons: 50, maxDuration: 1800 },
  PREMIUM: { maxModules: 20, maxLessons: 100, maxDuration: 3600 }
}

// ============================================
// FUNCIONS PRINCIPALS
// ============================================

export async function generateCourseOutline(input: GenerateCourseInput): Promise<CourseOutline> {
  const config = COURSE_TYPE_CONFIG[input.type]
  const lang = input.language === 'es' ? 'castellà' : 'català'

  const prompt = `Genera l'estructura d'un curs de formació en ${lang} sobre: "${input.topic}"

TIPUS DE CURS: ${input.type}
NIVELL: ${input.level}
${input.targetAudience ? `AUDIÈNCIA: ${input.targetAudience}` : ''}
${input.additionalInstructions ? `INSTRUCCIONS ADDICIONALS: ${input.additionalInstructions}` : ''}

RESTRICCIONS:
- Màxim ${config.maxModules} mòduls
- Màxim ${config.maxLessons} lliçons en total
- Duració total màxima: ${config.maxDuration} minuts

Respon NOMÉS amb un JSON vàlid amb aquesta estructura exacta:
{
  "title": "Títol del curs",
  "shortDescription": "Descripció curta (màx 150 caràcters)",
  "description": "Descripció completa del curs (2-3 paràgrafs en HTML amb <p>)",
  "objectives": ["Objectiu 1", "Objectiu 2", "Objectiu 3", "Objectiu 4"],
  "requirements": ["Requisit 1", "Requisit 2"],
  "targetAudience": "Descripció de l'audiència objectiu",
  "modules": [
    {
      "title": "Títol del mòdul",
      "description": "Descripció del mòdul",
      "lessons": [
        {
          "title": "Títol de la lliçó",
          "description": "Descripció breu",
          "type": "TEXT",
          "estimatedDuration": 10
        }
      ]
    }
  ]
}

IMPORTANT:
- El tipus de lliçó pot ser: TEXT, VIDEO, QUIZ, DOCUMENT
- Inclou almenys un QUIZ per mòdul si el curs és BASIC o superior
- La duració és en minuts
- Tot en ${lang.toUpperCase()}
- Els objectius han de ser específics i mesurables`

  const response = await callAI(prompt)

  // Parsejar JSON de la resposta
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No s\'ha pogut generar l\'estructura del curs')
  }

  try {
    return JSON.parse(jsonMatch[0])
  } catch (e) {
    throw new Error('Error parsejant la resposta de la IA')
  }
}

export async function generateFullCourse(input: GenerateCourseInput): Promise<string> {
  // 1. Generar estructura
  const outline = await generateCourseOutline(input)

  // 2. Crear curs
  const course = await createCourse({
    title: outline.title,
    description: outline.description,
    shortDescription: outline.shortDescription,
    type: input.type,
    level: input.level,
    categoryId: input.categoryId,
    objectives: outline.objectives,
    requirements: outline.requirements,
    targetAudience: outline.targetAudience,
    aiGenerated: true,
    aiPrompt: input.topic,
    createdById: input.createdById,
    isFree: input.type === 'MICRO',
    hasCertificate: input.type !== 'MICRO'
  })

  // 3. Crear mòduls i lliçons
  for (let i = 0; i < outline.modules.length; i++) {
    const moduleData = outline.modules[i]

    const module = await createModule({
      courseId: course.id,
      title: moduleData.title,
      description: moduleData.description,
      order: i,
      isFree: i === 0 // Primer mòdul gratuït
    })

    // Crear lliçons
    for (let j = 0; j < moduleData.lessons.length; j++) {
      const lessonData = moduleData.lessons[j]

      // Generar contingut per cada lliçó de tipus TEXT
      let content: string | undefined

      if (lessonData.type === 'TEXT') {
        content = await generateLessonContent({
          courseTitle: outline.title,
          moduleTitle: moduleData.title,
          lessonTitle: lessonData.title,
          lessonDescription: lessonData.description,
          level: input.level,
          language: input.language
        })
      }

      const lesson = await createLesson({
        moduleId: module.id,
        title: lessonData.title,
        description: lessonData.description,
        type: lessonData.type as LessonType,
        content,
        estimatedDuration: lessonData.estimatedDuration,
        order: j,
        isFree: i === 0 && j === 0, // Primera lliçó gratuïta
        aiGenerated: true
      })

      // Si és QUIZ, generar preguntes
      if (lessonData.type === 'QUIZ') {
        const quizData = await generateQuiz({
          courseTitle: outline.title,
          moduleTitle: moduleData.title,
          level: input.level,
          language: input.language
        })

        await createQuiz(lesson.id, quizData)
      }
    }
  }

  return course.id
}

async function generateLessonContent(params: {
  courseTitle: string
  moduleTitle: string
  lessonTitle: string
  lessonDescription: string
  level: CourseLevel
  language?: 'ca' | 'es'
}): Promise<string> {
  const lang = params.language === 'es' ? 'castellà' : 'català'

  const levelDescriptions = {
    BEGINNER: 'principiant - usa termes senzills i exemples bàsics',
    INTERMEDIATE: 'intermedi - pots assumir coneixements bàsics',
    ADVANCED: 'avançat - pots usar terminologia tècnica',
    EXPERT: 'expert - contingut professional i detallat'
  }

  const prompt = `Genera el contingut complet per una lliçó de formació en ${lang}.

CURS: ${params.courseTitle}
MÒDUL: ${params.moduleTitle}
LLIÇÓ: ${params.lessonTitle}
DESCRIPCIÓ: ${params.lessonDescription}
NIVELL: ${levelDescriptions[params.level]}

El contingut ha de:
- Estar en format HTML
- Incloure encapçalaments (h2, h3) per estructurar el contingut
- Incloure paràgrafs explicatius clars
- Incloure llistes (ul, ol) quan sigui apropiat
- Incloure exemples pràctics
- Destacar conceptes clau amb <strong>
- Ser adequat al nivell indicat
- Tenir entre 600-1200 paraules
- NO incloure el títol de la lliçó (ja es mostra a la UI)

Respon NOMÉS amb el contingut HTML, sense cap explicació addicional.`

  return await callAI(prompt)
}

async function generateQuiz(params: {
  courseTitle: string
  moduleTitle: string
  level: CourseLevel
  language?: 'ca' | 'es'
}): Promise<{
  title: string
  description: string
  passingScore: number
  questions: {
    type: QuestionType
    question: string
    explanation: string
    options: { text: string; isCorrect: boolean }[]
  }[]
}> {
  const lang = params.language === 'es' ? 'castellà' : 'català'
  const numQuestions = params.level === 'BEGINNER' ? 5 :
                       params.level === 'INTERMEDIATE' ? 8 : 10

  const prompt = `Genera un quiz de ${numQuestions} preguntes en ${lang} per avaluar els coneixements del mòdul.

CURS: ${params.courseTitle}
MÒDUL: ${params.moduleTitle}
NIVELL: ${params.level}

Respon NOMÉS amb un JSON vàlid:
{
  "title": "Avaluació: ${params.moduleTitle}",
  "description": "Comprova el que has après en aquest mòdul",
  "passingScore": 70,
  "questions": [
    {
      "type": "SINGLE_CHOICE",
      "question": "Pregunta clara i concisa?",
      "explanation": "Explicació detallada de per què aquesta és la resposta correcta",
      "options": [
        { "text": "Opció correcta", "isCorrect": true },
        { "text": "Opció incorrecta A", "isCorrect": false },
        { "text": "Opció incorrecta B", "isCorrect": false },
        { "text": "Opció incorrecta C", "isCorrect": false }
      ]
    }
  ]
}

IMPORTANT:
- Tipus vàlids: SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE
- Per TRUE_FALSE, les opcions han de ser només "Verdader" i "Fals"
- Cada pregunta ha de tenir una explicació clara
- Barreja els tipus de preguntes
- Les preguntes han de ser rellevants al contingut del mòdul
- Les opcions incorrectes han de ser plausibles
- Per MULTIPLE_CHOICE, pot haver-hi múltiples opcions correctes`

  const response = await callAI(prompt)

  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No s\'ha pogut generar el quiz')
  }

  try {
    return JSON.parse(jsonMatch[0])
  } catch (e) {
    throw new Error('Error parsejant el quiz de la IA')
  }
}

// ============================================
// REGENERACIÓ DE CONTINGUT
// ============================================

export async function regenerateLessonContent(lessonId: string): Promise<void> {
  const lesson = await prisma.courseLesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: true
        }
      }
    }
  })

  if (!lesson) throw new Error('Lliçó no trobada')

  const content = await generateLessonContent({
    courseTitle: lesson.module.course.title,
    moduleTitle: lesson.module.title,
    lessonTitle: lesson.title,
    lessonDescription: lesson.description || '',
    level: lesson.module.course.level
  })

  await updateLesson(lessonId, { content })
}

export async function improveLessonContent(lessonId: string, instructions: string): Promise<void> {
  const lesson = await prisma.courseLesson.findUnique({
    where: { id: lessonId }
  })

  if (!lesson || !lesson.content) throw new Error('Lliçó no trobada o sense contingut')

  const prompt = `Millora el següent contingut de formació en CATALÀ segons aquestes instruccions:

INSTRUCCIONS: ${instructions}

CONTINGUT ACTUAL:
${lesson.content}

IMPORTANT:
- Manté el format HTML
- Manté l'estructura general però aplica les millores sol·licitades
- El resultat ha de ser contingut HTML vàlid

Respon NOMÉS amb el contingut HTML millorat.`

  const improvedContent = await callAI(prompt)

  await updateLesson(lessonId, { content: improvedContent })
}

export async function expandLessonContent(lessonId: string): Promise<void> {
  const lesson = await prisma.courseLesson.findUnique({
    where: { id: lessonId }
  })

  if (!lesson || !lesson.content) throw new Error('Lliçó no trobada o sense contingut')

  const prompt = `Amplia i desenvolupa el següent contingut de formació:

CONTINGUT ACTUAL:
${lesson.content}

IMPORTANT:
- Afegeix més detalls i exemples
- Afegeix seccions addicionals si és apropiat
- Manté el format HTML
- Duplica aproximadament la longitud
- Manté el to i estil original

Respon NOMÉS amb el contingut HTML ampliat.`

  const expandedContent = await callAI(prompt)

  await updateLesson(lessonId, { content: expandedContent })
}

export async function simplifyLessonContent(lessonId: string): Promise<void> {
  const lesson = await prisma.courseLesson.findUnique({
    where: { id: lessonId }
  })

  if (!lesson || !lesson.content) throw new Error('Lliçó no trobada o sense contingut')

  const prompt = `Simplifica el següent contingut de formació:

CONTINGUT ACTUAL:
${lesson.content}

IMPORTANT:
- Utilitza paraules més senzilles
- Frases més curtes
- Elimina tecnicismes innecessaris
- Manté la informació essencial
- Manté el format HTML

Respon NOMÉS amb el contingut HTML simplificat.`

  const simplifiedContent = await callAI(prompt)

  await updateLesson(lessonId, { content: simplifiedContent })
}

// ============================================
// GENERACIÓ DE CONTINGUT ESPECÍFIC
// ============================================

export async function generateLessonSummary(lessonId: string): Promise<string> {
  const lesson = await prisma.courseLesson.findUnique({
    where: { id: lessonId }
  })

  if (!lesson || !lesson.content) throw new Error('Lliçó no trobada o sense contingut')

  const prompt = `Genera un resum executiu d'aquest contingut de formació:

${lesson.content}

El resum ha de:
- Tenir màxim 200 paraules
- Destacar els punts clau
- Ser útil com a repàs ràpid
- Estar en format de llista amb punts

Respon NOMÉS amb el resum en format HTML.`

  return await callAI(prompt)
}

export async function generatePracticeExercises(lessonId: string): Promise<string> {
  const lesson = await prisma.courseLesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: { course: true }
      }
    }
  })

  if (!lesson) throw new Error('Lliçó no trobada')

  const prompt = `Genera 3-5 exercicis pràctics per aquesta lliçó:

CURS: ${lesson.module.course.title}
LLIÇÓ: ${lesson.title}
CONTINGUT: ${lesson.content || lesson.description}

Els exercicis han de:
- Ser pràctics i aplicables
- Tenir diferents nivells de dificultat
- Incloure instruccions clares
- Ser rellevants al contingut

Format de resposta (HTML):
<div class="exercise">
  <h3>Exercici 1: [Títol]</h3>
  <p><strong>Objectiu:</strong> ...</p>
  <p><strong>Instruccions:</strong> ...</p>
  <p><strong>Resultat esperat:</strong> ...</p>
</div>

Respon NOMÉS amb els exercicis en format HTML.`

  return await callAI(prompt)
}

// ============================================
// CRIDA A LA IA
// ============================================

async function callAI(prompt: string): Promise<string> {
  // Intentar obtenir configuració de la base de dades
  const configuration = await prisma.aIConfiguration.findFirst({
    where: {
      useCase: 'CONTENT',
      isActive: true
    },
    include: {
      model: {
        include: {
          provider: true
        }
      },
      provider: true
    }
  })

  if (configuration?.model) {
    const { model, provider } = configuration
    const config: AIConfiguration = {
      temperature: configuration.temperature,
      maxTokens: configuration.maxTokens
    }

    switch (provider.type) {
      case 'ANTHROPIC':
        return callAnthropic(model.modelId, prompt, config)
      case 'OPENAI':
        return callOpenAI(model.modelId, prompt, config)
      case 'DEEPSEEK':
        return callDeepSeek(model.modelId, prompt, config)
      case 'GEMINI':
        return callGemini(model.modelId, prompt, config)
    }
  }

  // Fallback: provar proveïdors en ordre
  if (process.env.DEEPSEEK_API_KEY) {
    return callDeepSeek('deepseek-chat', prompt, { temperature: 0.7, maxTokens: 4096 })
  }

  if (process.env.OPENAI_API_KEY) {
    return callOpenAI('gpt-4o-mini', prompt, { temperature: 0.7, maxTokens: 4096 })
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return callAnthropic('claude-3-haiku-20240307', prompt, { temperature: 0.7, maxTokens: 4096 })
  }

  throw new Error('No hi ha cap proveïdor d\'IA configurat')
}

async function callAnthropic(modelId: string, prompt: string, config: AIConfiguration): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY no configurada')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error: ${error}`)
  }

  const data = await response.json()
  return data.content[0].text
}

async function callOpenAI(modelId: string, prompt: string, config: AIConfiguration): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY no configurada')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callDeepSeek(modelId: string, prompt: string, config: AIConfiguration): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY no configurada')

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DeepSeek API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callGemini(modelId: string, prompt: string, config: AIConfiguration): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY no configurada')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: config.maxTokens,
          temperature: config.temperature
        }
      })
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}
