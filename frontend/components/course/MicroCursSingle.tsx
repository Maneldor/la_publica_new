'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MicroCourse {
  id: string;
  courseType: 'micro';
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  language: string;
  tags: string;
  coverImage: string;
  aiGeneratedContent: {
    lessons: Array<{
      id: string;
      title: string;
      duration: number;
      type: string;
      content: string;
    }>;
    totalDuration: number;
  };
  instructor?: string;
  price: number;
  status: string;
  createdAt: string;
}

interface MicroCursSingleProps {
  course: MicroCourse;
}

export function MicroCursSingle({ course }: MicroCursSingleProps) {
  const router = useRouter();
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const handleStartCourse = () => {
    setIsEnrolled(true);
    setCurrentLesson(0);
  };

  const handleLessonComplete = () => {
    if (currentLesson < course.aiGeneratedContent.lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    } else {
      // Curso completado
      alert('Felicitats! Has completat el micro-curs.');
    }
  };

  const getModeIcon = () => '💻'; // Micro cursos son siempre online

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Header simple para micro-cursos */}
      <div className="relative">
        {course.coverImage && (
          <div
            className="h-64 bg-cover bg-center"
            style={{ backgroundImage: `url(${course.coverImage})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-green-600 text-xs rounded">MICRO-CURS</span>
            <span className="px-2 py-1 bg-blue-600 text-xs rounded">{course.category}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-gray-200">{course.subtitle}</p>
        </div>
      </div>

      {/* Contenido principal - Layout simple de 1 columna */}
      <div className="p-6">
        {!isEnrolled ? (
          // Vista previa del curso
          <div className="space-y-6">
            {/* Información básica */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span>{getModeIcon()}</span>
                  <span>En línia</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span>{course.aiGeneratedContent.totalDuration} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📚</span>
                  <span>{course.aiGeneratedContent.lessons.length} lliçons</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📊</span>
                  <span>{course.level}</span>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <h2 className="text-xl font-bold mb-3">Sobre aquest micro-curs</h2>
              <p className="text-gray-700 leading-relaxed">{course.description}</p>
            </div>

            {/* Lista de lecciones */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contingut del curs</h3>
              <div className="space-y-2">
                {course.aiGeneratedContent.lessons.map((lesson, index) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium">{lesson.title}</h4>
                        <p className="text-sm text-gray-500">{lesson.type} • {lesson.duration} min</p>
                      </div>
                    </div>
                    <span className="text-gray-400">🔒</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {course.tags && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Etiquetes</h3>
                <div className="flex flex-wrap gap-2">
                  {course.tags.split(',').map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Botón de inicio */}
            <div className="pt-6 border-t">
              <button
                onClick={handleStartCourse}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                🚀 Començar micro-curs (Gratuït)
              </button>
              <p className="text-center text-sm text-gray-500 mt-2">
                Durada estimada: {course.aiGeneratedContent.totalDuration} minuts
              </p>
            </div>
          </div>
        ) : (
          // Vista del curso en progreso
          <div className="space-y-6">
            {/* Progreso */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">Progres del curs</h2>
                <span className="text-sm text-blue-600">
                  {currentLesson + 1} de {course.aiGeneratedContent.lessons.length}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentLesson + 1) / course.aiGeneratedContent.lessons.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Lección actual */}
            {course.aiGeneratedContent.lessons[currentLesson] && (
              <div className="border rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2">
                    Lliçó {currentLesson + 1}: {course.aiGeneratedContent.lessons[currentLesson].title}
                  </h3>
                  <p className="text-gray-600">
                    {course.aiGeneratedContent.lessons[currentLesson].type} • {course.aiGeneratedContent.lessons[currentLesson].duration} min
                  </p>
                </div>

                {/* Contenido de la lección */}
                <div className="prose max-w-none">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{course.aiGeneratedContent.lessons[currentLesson].content}</p>
                  </div>
                </div>

                {/* Botón de completar lección */}
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => currentLesson > 0 && setCurrentLesson(currentLesson - 1)}
                    disabled={currentLesson === 0}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Anterior
                  </button>

                  <button
                    onClick={handleLessonComplete}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {currentLesson < course.aiGeneratedContent.lessons.length - 1
                      ? 'Següent lliçó →'
                      : 'Finalitzar curs 🎉'
                    }
                  </button>
                </div>
              </div>
            )}

            {/* Lista de todas las lecciones */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Totes les lliçons</h3>
              <div className="space-y-2">
                {course.aiGeneratedContent.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      index === currentLesson
                        ? 'border-blue-500 bg-blue-50'
                        : index < currentLesson
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200'
                    }`}
                    onClick={() => index <= currentLesson && setCurrentLesson(index)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index < currentLesson
                          ? 'bg-green-500 text-white'
                          : index === currentLesson
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200'
                      }`}>
                        {index < currentLesson ? '✓' : index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium">{lesson.title}</h4>
                        <p className="text-sm text-gray-500">{lesson.type} • {lesson.duration} min</p>
                      </div>
                    </div>
                    {index > currentLesson && <span className="text-gray-400">🔒</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}