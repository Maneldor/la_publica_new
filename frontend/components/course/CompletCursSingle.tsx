'use client';

import { useState } from 'react';

interface CompleteCourse {
  id: string;
  courseType: 'complet' | 'premium';
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  language: string;
  tags: string;
  coverImage: string;
  modules: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
      type: string;
      duration: number;
      isPreview: boolean;
    }>;
  }>;
  hasInstructor: boolean;
  instructor?: {
    name: string;
    avatar: string;
    expertise: string;
    rating: number;
    bio: string;
    courses: number;
    students: number;
  };
  price: number;
  memberPrice: number;
  modalities: string[];
  hasCertificate: boolean;
  certificateType: string;
  hasDownloadables: boolean;
  hasProjects: boolean;
  hasExercises: boolean;
  hasForum: boolean;
  hasGuarantee: boolean;
  status: string;
  rating: number;
  totalRatings: number;
  enrollmentCount: number;
  startDate?: string;
  endDate?: string;
  availableSlots?: number;
  totalSlots?: number;
}

interface CompletCursSingleProps {
  course: CompleteCourse;
}

export function CompletCursSingle({ course }: CompletCursSingleProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
  const totalDuration = course.modules.reduce((total, module) =>
    total + module.lessons.reduce((moduleTotal, lesson) => moduleTotal + lesson.duration, 0), 0
  );

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'online': return '💻';
      case 'presencial': return '🏢';
      case 'hibrid': return '🔄';
      default: return '📚';
    }
  };

  const getModeText = (mode: string) => {
    switch (mode) {
      case 'online': return 'En línia';
      case 'presencial': return 'Presencial';
      case 'hibrid': return 'Híbrid';
      default: return mode;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto bg-white">
      {/* Header Premium */}
      <div className="relative">
        {course.coverImage && (
          <div
            className="h-96 bg-cover bg-center"
            style={{ backgroundImage: `url(${course.coverImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/50" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-4 py-2 text-sm font-semibold rounded ${
                course.courseType === 'premium'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              }`}>
                {course.courseType === 'premium' ? 'CURS PREMIUM' : 'CURS COMPLET'}
              </span>
              <span className="px-3 py-1 bg-gray-700/80 text-sm rounded">{course.category}</span>
              <span className="px-3 py-1 bg-orange-600 text-sm rounded">{course.level}</span>
              {course.hasCertificate && (
                <span className="px-3 py-1 bg-green-600 text-sm rounded">🎓 Certificat</span>
              )}
            </div>
            <h1 className="text-5xl font-bold mb-4 leading-tight">{course.title}</h1>
            <p className="text-xl text-gray-200 mb-6 max-w-4xl">{course.subtitle}</p>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                {renderStars(course.rating)}
                <span className="ml-2 font-medium">{course.rating} ({course.totalRatings} valoracions)</span>
              </div>
              <span className="font-medium">{course.enrollmentCount} estudiants</span>
              <span className="font-medium">{Math.floor(totalDuration / 60)}h {totalDuration % 60}min</span>
              <span className="font-medium">{totalLessons} lliçons</span>
              <span className="font-medium">{course.modules.length} mòduls</span>
            </div>
          </div>
        </div>
      </div>

      {/* Layout completo con sidebar sticky */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
        {/* Columna principal */}
        <div className="lg:col-span-2">
          {/* Tabs completos */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Descripció' },
                { id: 'curriculum', label: 'Temari' },
                { id: 'instructor', label: 'Instructor' },
                { id: 'reviews', label: 'Valoracions' },
                { id: 'faq', label: 'FAQ' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenido de los tabs */}
          <div>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6">Sobre aquest curs</h2>
                  <div className="prose max-w-none">
                    <p className="text-lg text-gray-700 leading-relaxed">{course.description}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-4">Què aprendràs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'Dominar els conceptes fonamentals',
                      'Aplicar els coneixements en projectes reals',
                      'Desenvolupar habilitats pràctiques',
                      'Obtenir certificació reconeguda',
                      'Accedir a materials exclusius',
                      'Rebre suport personalitzat'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-4">Requisits</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Coneixements bàsics del tema</li>
                    <li>• Accés a un ordinador amb connexió a internet</li>
                    <li>• Motivació per aprendre i practicar</li>
                  </ul>
                </div>

                {course.tags && (
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Etiquetes</h3>
                    <div className="flex flex-wrap gap-3">
                      {course.tags.split(',').map((tag, index) => (
                        <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold">Temari del curs</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Expandir tot
                  </button>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium">
                    {course.modules.length} mòduls • {totalLessons} lliçons • {Math.floor(totalDuration / 60)}h {totalDuration % 60}min de contingut
                  </p>
                </div>

                <div className="space-y-4">
                  {course.modules.map((module, moduleIndex) => (
                    <div key={module.id} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <h3 className="font-semibold text-lg">
                            Mòdul {moduleIndex + 1}: {module.title}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {module.lessons.length} lliçons • {Math.floor(module.lessons.reduce((total, lesson) => total + lesson.duration, 0) / 60)}h {module.lessons.reduce((total, lesson) => total + lesson.duration, 0) % 60}min
                          </p>
                        </div>
                        <span className="text-2xl text-gray-400">
                          {expandedModule === module.id ? '−' : '+'}
                        </span>
                      </button>

                      {expandedModule === module.id && (
                        <div className="border-t bg-gray-50">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="px-6 py-4 flex items-center justify-between border-b border-gray-200 last:border-b-0">
                              <div className="flex items-center gap-4">
                                <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                                  {lessonIndex + 1}
                                </span>
                                <div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-lg">
                                      {lesson.type === 'video' ? '🎥' : lesson.type === 'text' ? '📄' : lesson.type === 'quiz' ? '❓' : '💻'}
                                    </span>
                                    <span className="font-medium">{lesson.title}</span>
                                    {lesson.isPreview && (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                                        PREVISUALITZACIÓ
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1 capitalize">{lesson.type}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">{lesson.duration} min</span>
                                {lesson.isPreview ? (
                                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Reproduir
                                  </button>
                                ) : (
                                  <span className="text-gray-400">🔒</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'instructor' && course.hasInstructor && course.instructor && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold">El teu instructor</h2>

                <div className="flex items-start gap-6 p-6 border rounded-lg">
                  <img
                    src={course.instructor.avatar || '/default-avatar.png'}
                    alt={course.instructor.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{course.instructor.name}</h3>
                    <p className="text-lg text-blue-600 mb-3">{course.instructor.expertise}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        {renderStars(course.instructor.rating)}
                        <span className="ml-1 font-medium">{course.instructor.rating}</span>
                      </div>
                      <span>{course.instructor.students} estudiants</span>
                      <span>{course.instructor.courses} cursos</span>
                    </div>

                    <p className="text-gray-700 leading-relaxed">{course.instructor.bio || 'Expert en la matèria amb anys d&apos;experiència en el sector.'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold">Valoracions dels estudiants</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <div className="text-5xl font-bold text-yellow-600 mb-2">{course.rating}</div>
                    <div className="flex justify-center mb-2">{renderStars(course.rating)}</div>
                    <div className="text-gray-600">{course.totalRatings} valoracions</div>
                  </div>

                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="text-sm w-8">{stars} ⭐</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${stars === 5 ? 70 : stars === 4 ? 20 : 10}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-10">{stars === 5 ? '70%' : stars === 4 ? '20%' : '10%'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Comentaris destacats</h3>
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <p>Les valoracions detallades apareixeran aquí quan els estudiants completin el curs.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Preguntes freqüents</h2>

                <div className="space-y-4">
                  {[
                    {
                      q: "Quan puc començar el curs?",
                      a: "Pots començar immediatament després de la inscripció si és un curs online, o en la data d'inici si té sessions programades."
                    },
                    {
                      q: "Obtindré un certificat?",
                      a: course.hasCertificate ? `Sí, rebràs un certificat ${course.certificateType} al completar el curs.` : "Aquest curs no inclou certificat."
                    },
                    {
                      q: "Hi ha garantia de devolució?",
                      a: course.hasGuarantee ? "Sí, oferim una garantia de devolució de 30 dies." : "Consulta les condicions de devolució amb l'organitzador."
                    },
                    {
                      q: "Puc accedir al contingut després de completar el curs?",
                      a: "Sí, mantindràs accés al contingut de forma permanent."
                    }
                  ].map((faq, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <h4 className="font-semibold text-lg mb-2">{faq.q}</h4>
                      <p className="text-gray-700">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar sticky completo */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Card principal de precio e inscripción */}
            <div className="border rounded-lg p-6 bg-white shadow-lg">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {course.price === 0 ? 'Gratuït' : `${course.price}€`}
                </div>
                {course.memberPrice < course.price && (
                  <div className="text-lg text-green-600 font-medium">
                    Membres: {course.memberPrice === 0 ? 'Gratuït' : `${course.memberPrice}€`}
                    <span className="block text-sm text-gray-500">
                      Estalvies {course.price - course.memberPrice}€
                    </span>
                  </div>
                )}
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all mb-4">
                Inscriu-te ara
              </button>

              {course.hasGuarantee && (
                <div className="text-center text-sm text-gray-600 mb-4">
                  <span className="text-green-600">✓</span> Garantia de devolució de 30 dies
                </div>
              )}

              <div className="space-y-4 text-sm border-t pt-4">
                <div className="flex items-center justify-between">
                  <span>⏱️ Durada total:</span>
                  <span className="font-medium">{Math.floor(totalDuration / 60)}h {totalDuration % 60}min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>📚 Lliçons:</span>
                  <span className="font-medium">{totalLessons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>📁 Mòduls:</span>
                  <span className="font-medium">{course.modules.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{getModeIcon(course.modalities[0])} Modalitat:</span>
                  <span className="font-medium">{getModeText(course.modalities[0])}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>📊 Nivell:</span>
                  <span className="font-medium">{course.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>🌐 Idioma:</span>
                  <span className="font-medium">{course.language}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>👥 Estudiants:</span>
                  <span className="font-medium">{course.enrollmentCount}</span>
                </div>
                {course.hasCertificate && (
                  <div className="flex items-center justify-between">
                    <span>🎓 Certificat:</span>
                    <span className="font-medium text-green-600">Inclòs</span>
                  </div>
                )}
              </div>
            </div>

            {/* Fechas y disponibilidad */}
            {course.startDate && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">📅 Dates del curs</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Inici:</span>
                    <span className="ml-2 font-medium">{formatDate(course.startDate)}</span>
                  </div>
                  {course.endDate && (
                    <div>
                      <span className="text-gray-600">Fi:</span>
                      <span className="ml-2 font-medium">{formatDate(course.endDate)}</span>
                    </div>
                  )}
                  {course.availableSlots && course.totalSlots && (
                    <div className="pt-2 border-t">
                      <span className="text-gray-600">Places disponibles:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {course.availableSlots} de {course.totalSlots}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Características premium */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">✨ Aquest curs inclou:</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Accés complet al contingut</span>
                </div>
                {course.hasDownloadables && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Materials descarregables</span>
                  </div>
                )}
                {course.hasProjects && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Projectes pràctics</span>
                  </div>
                )}
                {course.hasExercises && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Exercicis autocorregibles</span>
                  </div>
                )}
                {course.hasForum && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Fòrum d&apos;estudiants</span>
                  </div>
                )}
                {course.hasInstructor && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Suport de l&apos;instructor</span>
                  </div>
                )}
                {course.hasCertificate && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Certificat d&apos;acabament</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Accés des de qualsevol dispositiu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Accés de per vida</span>
                </div>
              </div>
            </div>

            {/* Compartir */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Compartir aquest curs</h3>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  Facebook
                </button>
                <button className="flex-1 py-2 bg-sky-400 text-white rounded text-sm hover:bg-sky-500">
                  Twitter
                </button>
                <button className="flex-1 py-2 bg-blue-800 text-white rounded text-sm hover:bg-blue-900">
                  LinkedIn
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}