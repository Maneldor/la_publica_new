'use client';

import { useState } from 'react';

interface BasicCourse {
  id: string;
  courseType: 'basic';
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
  };
  price: number;
  memberPrice: number;
  modalities: string[];
  status: string;
  rating: number;
  totalRatings: number;
  enrollmentCount: number;
}

interface BasicCursSingleProps {
  course: BasicCourse;
}

export function BasicCursSingle({ course }: BasicCursSingleProps) {
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

  return (
    <div className="max-w-7xl mx-auto bg-white">
      {/* Header */}
      <div className="relative">
        {course.coverImage && (
          <div
            className="h-80 bg-cover bg-center"
            style={{ backgroundImage: `url(${course.coverImage})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-blue-600 text-sm rounded">CURS BÀSIC</span>
              <span className="px-3 py-1 bg-gray-700 text-sm rounded">{course.category}</span>
              <span className="px-3 py-1 bg-purple-600 text-sm rounded">{course.level}</span>
            </div>
            <h1 className="text-4xl font-bold mb-3">{course.title}</h1>
            <p className="text-xl text-gray-200 mb-4">{course.subtitle}</p>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                {renderStars(course.rating)}
                <span className="ml-2">{course.rating} ({course.totalRatings} valoracions)</span>
              </div>
              <span>{course.enrollmentCount} estudiants</span>
              <span>{Math.floor(totalDuration / 60)} hores</span>
              <span>{totalLessons} lliçons</span>
            </div>
          </div>
        </div>
      </div>

      {/* Layout de 2 columnas */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
        {/* Columna principal */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Descripció' },
                { id: 'curriculum', label: 'Temari' },
                { id: 'reviews', label: 'Valoracions' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
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
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Sobre aquest curs</h2>
                  <p className="text-gray-700 leading-relaxed">{course.description}</p>
                </div>

                {course.hasInstructor && course.instructor && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Instructor</h3>
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={course.instructor.avatar || '/default-avatar.png'}
                        alt={course.instructor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-lg">{course.instructor.name}</h4>
                        <p className="text-gray-600">{course.instructor.expertise}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(course.instructor.rating)}
                          <span className="text-sm text-gray-500 ml-2">{course.instructor.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {course.tags && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Etiquetes</h3>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.split(',').map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Temari del curs</h2>
                <p className="text-gray-600 mb-6">
                  {course.modules.length} mòduls • {totalLessons} lliçons • {Math.floor(totalDuration / 60)}h {totalDuration % 60}min
                </p>

                <div className="space-y-4">
                  {course.modules.map((module) => (
                    <div key={module.id} className="border rounded-lg">
                      <button
                        onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                      >
                        <div>
                          <h3 className="font-medium">{module.title}</h3>
                          <p className="text-sm text-gray-500">
                            {module.lessons.length} lliçons • {Math.floor(module.lessons.reduce((total, lesson) => total + lesson.duration, 0) / 60)}h
                          </p>
                        </div>
                        <span className="text-gray-400">
                          {expandedModule === module.id ? '−' : '+'}
                        </span>
                      </button>

                      {expandedModule === module.id && (
                        <div className="border-t bg-gray-50">
                          {module.lessons.map((lesson) => (
                            <div key={lesson.id} className="px-6 py-3 flex items-center justify-between border-b border-gray-200 last:border-b-0">
                              <div className="flex items-center gap-3">
                                <span className="text-gray-400">
                                  {lesson.type === 'video' ? '🎥' : lesson.type === 'text' ? '📄' : '❓'}
                                </span>
                                <span className="font-medium">{lesson.title}</span>
                                {lesson.isPreview && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                    Previsualització
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">{lesson.duration} min</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Valoracions dels estudiants</h2>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">{course.rating}</div>
                    <div className="flex justify-center">{renderStars(course.rating)}</div>
                    <div className="text-sm text-gray-500">{course.totalRatings} valoracions</div>
                  </div>
                </div>

                <div className="text-center py-8 text-gray-500">
                  <p>Les valoracions detallades apareixeran aquí quan els estudiants completin el curs.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar simple */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Card de información del curso */}
            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {course.price === 0 ? 'Gratuït' : `${course.price}€`}
                </div>
                {course.memberPrice < course.price && (
                  <div className="text-sm text-green-600">
                    Membres: {course.memberPrice === 0 ? 'Gratuït' : `${course.memberPrice}€`}
                  </div>
                )}
              </div>

              <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mb-4">
                Inscriu-te ara
              </button>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span>{Math.floor(totalDuration / 60)} hores de contingut</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📚</span>
                  <span>{totalLessons} lliçons</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{getModeIcon(course.modalities[0])}</span>
                  <span>{getModeText(course.modalities[0])}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📊</span>
                  <span>Nivell {course.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🌐</span>
                  <span>{course.language}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👥</span>
                  <span>{course.enrollmentCount} estudiants inscrits</span>
                </div>
              </div>
            </div>

            {/* Características adicionales */}
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Aquest curs inclou:</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Accés complet al contingut</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Materials descarregables</span>
                </div>
                {course.hasInstructor && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Suport de l&apos;instructor</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Accés des de qualsevol dispositiu</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}