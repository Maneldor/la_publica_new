'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { coursesService, Course } from '../../../../lib/courses';

// Modal Components
const CourseDetailModal = ({ course, onClose }: { course: Course; onClose: () => void }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            {course.coverImage && (
              <div className="md:col-span-2">
                <img
                  src={course.coverImage}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Informació bàsica</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div><span className="font-medium">Instructor:</span> {course.instructor}</div>
                  <div><span className="font-medium">Institució:</span> {course.institution}</div>
                  <div><span className="font-medium">Categoria:</span> {course.category}</div>
                  <div><span className="font-medium">Nivell:</span> {course.level}</div>
                  <div><span className="font-medium">Modalitat:</span> {course.mode}</div>
                  <div><span className="font-medium">Durada:</span> {course.duration} hores</div>
                  <div><span className="font-medium">Idioma:</span> {course.language}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Dates</h3>
                <div className="mt-2 space-y-2 text-sm">
                  {course.startDate && <div><span className="font-medium">Inici:</span> {formatDate(course.startDate)}</div>}
                  {course.endDate && <div><span className="font-medium">Fi:</span> {formatDate(course.endDate)}</div>}
                  {course.enrollmentDeadline && <div><span className="font-medium">Límit inscripció:</span> {formatDate(course.enrollmentDeadline)}</div>}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Estadístiques</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div><span className="font-medium">Preu:</span> {course.price}{course.currency === 'EUR' ? '€' : course.currency}</div>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <div><span className="font-medium">Preu original:</span> {course.originalPrice}€</div>
                  )}
                  <div><span className="font-medium">Places totals:</span> {course.totalSlots}</div>
                  <div><span className="font-medium">Places disponibles:</span> {course.availableSlots}</div>
                  <div><span className="font-medium">Inscrits:</span> {course.enrollmentCount}</div>
                  <div><span className="font-medium">Visualitzacions:</span> {course.viewsCount}</div>
                  {course.averageRating && (
                    <div><span className="font-medium">Valoració:</span> {course.averageRating}/5 ({course.totalRatings} valoracions)</div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Estat</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div><span className="font-medium">Estat:</span> {course.status}</div>
                  <div><span className="font-medium">Destacat:</span> {course.isHighlighted ? 'Sí' : 'No'}</div>
                  <div><span className="font-medium">Principal:</span> {course.isFeatured ? 'Sí' : 'No'}</div>
                  <div><span className="font-medium">Nou:</span> {course.isNew ? 'Sí' : 'No'}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-900">Descripció</h3>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">{course.description}</p>
            </div>

            {/* Materials */}
            {course.materials && (
              <div className="md:col-span-2">
                <h3 className="font-semibold text-gray-900">Materials</h3>
                <p className="mt-2 text-sm text-gray-700">{course.materials}</p>
              </div>
            )}

            {/* Tags */}
            {course.tags && (
              <div className="md:col-span-2">
                <h3 className="font-semibold text-gray-900">Etiquetes</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {course.tags.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Tancar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditCourseModal = ({ course, onClose, onSave }: { course: Course; onClose: () => void; onSave: (updatedCourse: Course) => void }) => {
  const [formData, setFormData] = useState(course);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [materialsDragActive, setMaterialsDragActive] = useState(false);
  const [uploadingMaterials, setUploadingMaterials] = useState(false);
  const [materialFiles, setMaterialFiles] = useState<Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    uploadProgress?: number;
  }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // TODO: Implement API call to update course
      // await coursesService.updateCourse(formData.id, formData);
      onSave(formData);
      onClose();
      alert('Curs actualitzat correctament');
    } catch {
      console.error('Error updating course:', err);
      alert('Error al actualitzar el curs');
    } finally {
      setSaving(false);
    }
  };

  // Handle file upload
  const uploadImage = async (file: File): Promise<string> => {
    // Simulate upload - in real app, upload to your storage service
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // In real app, upload file to server/cloud storage and return URL
        // For now, return data URL for preview
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Si us plau, selecciona només arxius d\'imatge');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('L\'arxiu és massa gran. Màxim 5MB');
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setFormData({...formData, coverImage: imageUrl});
    } catch {
      console.error('Error uploading image:', err);
      alert('Error al pujar la imatge');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Materials file handling
  const uploadMaterialFile = async (file: File): Promise<{ id: string; url: string }> => {
    // Simulate upload with progress - in real app, upload to your storage service
    return new Promise((resolve) => {
      setTimeout(() => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const url = URL.createObjectURL(file); // For preview, in real app this would be server URL
        resolve({ id, url });
      }, 1000);
    });
  };

  const handleMaterialsFileSelect = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      // Allow various file types for course materials
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/wmv',
        'video/flv',
        'video/webm',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/zip',
        'application/x-rar-compressed'
      ];

      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|md|rtf)$/i)) {
        alert(`Tipus d'arxiu no permès: ${file.name}`);
        return false;
      }

      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        alert(`Arxiu massa gran: ${file.name}. Màxim 100MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingMaterials(true);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const { id, url } = await uploadMaterialFile(file);
        return {
          id,
          name: file.name,
          type: file.type,
          size: file.size,
          url
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setMaterialFiles(prev => [...prev, ...uploadedFiles]);
    } catch {
      console.error('Error uploading materials:', err);
      alert('Error al pujar els arxius');
    } finally {
      setUploadingMaterials(false);
    }
  };

  const handleMaterialsDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setMaterialsDragActive(true);
    } else if (e.type === "dragleave") {
      setMaterialsDragActive(false);
    }
  };

  const handleMaterialsDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMaterialsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMaterialsFileSelect(e.dataTransfer.files);
    }
  };

  const handleMaterialsFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleMaterialsFileSelect(e.target.files);
    }
  };

  const removeMaterialFile = (id: string) => {
    setMaterialFiles(prev => prev.filter(file => file.id !== id));
  };

  const getFileIcon = (type: string, name: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type === 'application/pdf') return '📄';
    if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return '📝';
    if (type.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx')) return '📊';
    if (type.includes('powerpoint') || name.endsWith('.ppt') || name.endsWith('.pptx')) return '📈';
    if (type === 'text/plain' || name.endsWith('.txt')) return '📋';
    if (type.includes('zip') || type.includes('rar')) return '🗜️';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900">Editar Curs</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Títol</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Instructor</label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Institució</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({...formData, institution: e.target.value})}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="Tecnologia">Tecnologia</option>
                  <option value="Disseny">Disseny</option>
                  <option value="Màrqueting Digital">Màrqueting Digital</option>
                  <option value="Gestió i Lideratge">Gestió i Lideratge</option>
                  <option value="Idiomes">Idiomes</option>
                  <option value="Ofimàtica">Ofimàtica</option>
                  <option value="Ciberseguretat">Ciberseguretat</option>
                  <option value="Comunicació">Comunicació</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nivell</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="Principiant">Principiant</option>
                  <option value="Intermedi">Intermedi</option>
                  <option value="Avançat">Avançat</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Modalitat</label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({...formData, mode: e.target.value})}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="online">Online</option>
                  <option value="presencial">Presencial</option>
                  <option value="hibrid">Híbrid</option>
                </select>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Durada (hores)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Preu (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Places totals</label>
                <input
                  type="number"
                  value={formData.totalSlots}
                  onChange={(e) => setFormData({...formData, totalSlots: parseInt(e.target.value)})}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Data d'inici</label>
                <input
                  type="date"
                  value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Data de fi</label>
                <input
                  type="date"
                  value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Estat</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="DRAFT">Esborrany</option>
                  <option value="PUBLISHED">Publicat</option>
                  <option value="ARCHIVED">Arxivat</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Descripció</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            {/* Cover Image */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Imatge de portada</label>

              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <input
                  type="file"
                  onChange={handleFileInput}
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />

                <div className="space-y-2">
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-600">Pujant imatge...</p>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl text-gray-400">📷</div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600">Clica per seleccionar</span> o arrossega una imatge aquí
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF fins a 5MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* URL Input Alternative */}
              <div className="mt-3">
                <label className="block text-xs text-gray-600 mb-1">O introdueix una URL:</label>
                <input
                  type="url"
                  value={formData.coverImage || ''}
                  onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="https://example.com/image.jpg"
                  disabled={uploading}
                />
              </div>

              {/* Image Preview */}
              {formData.coverImage && (
                <div className="mt-3">
                  <label className="block text-xs text-gray-600 mb-1">Previsualització:</label>
                  <div className="relative inline-block">
                    <img
                      src={formData.coverImage}
                      alt="Previsualització"
                      className="w-40 h-28 object-cover rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, coverImage: ''})}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      title="Eliminar imatge"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Materials */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Materials del curs</label>

              {/* Materials Upload Area */}
              <div
                onDragEnter={handleMaterialsDrag}
                onDragLeave={handleMaterialsDrag}
                onDragOver={handleMaterialsDrag}
                onDrop={handleMaterialsDrop}
                className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  materialsDragActive
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${uploadingMaterials ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <input
                  type="file"
                  id="edit-materials-upload"
                  onChange={handleMaterialsFileInput}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp4,.avi,.mov,.wmv,.mp3,.wav,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingMaterials}
                />

                <div className="space-y-2">
                  {uploadingMaterials ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                      <p className="text-sm text-gray-600">Pujant arxius...</p>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl text-gray-400">📚</div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-green-600">Clica per seleccionar</span> o arrossega arxius aquí
                      </p>
                      <p className="text-xs text-gray-500">
                        ⚡ Pots seleccionar <strong>múltiples arxius</strong> a la vegada (Ctrl/Cmd + Click)
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, XLS, PPT, MP4, MP3, ZIP... fins a 100MB cada un
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Add More Files Button */}
              {materialFiles.length > 0 && !uploadingMaterials && (
                <div className="mt-2 flex justify-center">
                  <label
                    htmlFor="edit-materials-upload"
                    className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer transition-colors text-sm"
                  >
                    <span className="mr-2">➕</span>
                    Afegir més arxius
                  </label>
                </div>
              )}

              {/* Materials List */}
              {materialFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Arxius carregats ({materialFiles.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {materialFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <span className="text-lg">{getFileIcon(file.type, file.name)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.url && (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              title="Veure arxiu"
                            >
                              👁️
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMaterialFile(file.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                            title="Eliminar arxiu"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description field for additional info */}
              <div className="mt-4">
                <label className="block text-xs text-gray-600 mb-1">Descripció addicional:</label>
                <textarea
                  value={formData.materials || ''}
                  onChange={(e) => setFormData({...formData, materials: e.target.value})}
                  rows={2}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Informació addicional sobre els materials..."
                />
              </div>
            </div>

            {/* Tags */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Etiquetes (separades per comes)</label>
              <input
                type="text"
                value={formData.tags || ''}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="react, javascript, frontend"
              />
            </div>

            {/* Checkboxes */}
            <div className="md:col-span-2 flex gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isHighlighted}
                  onChange={(e) => setFormData({...formData, isHighlighted: e.target.checked})}
                  className="mr-2"
                />
                Destacat
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                  className="mr-2"
                />
                Principal
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={(e) => setFormData({...formData, isNew: e.target.checked})}
                  className="mr-2"
                />
                Nou
              </label>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={saving}
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Guardant...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EnrolledUsersModal = ({ course, onClose }: { course: Course; onClose: () => void }) => {
  // Mock data - in real app, fetch from API
  const enrolledUsers = [
    { id: '1', name: 'Maria García', email: 'maria.garcia@gencat.cat', enrolledAt: '2024-10-01', status: 'CONFIRMED' },
    { id: '2', name: 'Joan Martí', email: 'joan.marti@gencat.cat', enrolledAt: '2024-10-02', status: 'CONFIRMED' },
    { id: '3', name: 'Anna Puig', email: 'anna.puig@gencat.cat', enrolledAt: '2024-10-03', status: 'PENDING' },
  ];

  const downloadUsersList = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Nom,Email,Data Inscripció,Estat\n"
      + enrolledUsers.map(user =>
          `${user.name},${user.email},${user.enrolledAt},${user.status}`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inscrits_${course.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Usuaris Inscrits</h2>
              <p className="text-gray-600">{course.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              {enrolledUsers.length} usuaris inscrits
            </p>
            <button
              onClick={downloadUsersList}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              📥 Descarregar llista
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Nom</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Email</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Data Inscripció</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Estat</th>
                </tr>
              </thead>
              <tbody>
                {enrolledUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">{user.name}</td>
                    <td className="border border-gray-200 px-4 py-2">{user.email}</td>
                    <td className="border border-gray-200 px-4 py-2">
                      {new Date(user.enrolledAt).toLocaleDateString('ca-ES')}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {user.status === 'CONFIRMED' ? 'Confirmat' : 'Pendent'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Tancar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function ListarCursosPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEnrolledModal, setShowEnrolledModal] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterAndSortCourses();
  }, [courses, searchTerm, filterCategory, filterStatus, filterLevel, sortBy]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesService.getCourses({
        limit: 100
      });
      setCourses(response.data);
      setError('');
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Error al cargar los cursos');
      const sampleCourse = {
        id: '1',
        title: 'Desenvolupament Web amb React',
        description: 'Aprèn a crear aplicacions web modernes',
        shortDescription: 'Curs complet de React',
        slug: 'react-development',
        instructor: 'Marc González',
        institution: 'TechAcademy Barcelona',
        instructorEmail: 'marc@techacademy.cat',
        institutionLogo: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150&h=150&fit=crop',
        category: 'Tecnologia',
        subcategory: 'Desenvolupament Web',
        tags: 'react,javascript,frontend',
        level: 'Intermedi',
        mode: 'online',
        duration: 40,
        language: 'Català',
        price: 299,
        originalPrice: 399,
        discount: 25,
        currency: 'EUR',
        startDate: '2024-11-15',
        endDate: '2024-12-20',
        enrollmentDeadline: '2024-11-10',
        availableSlots: 15,
        totalSlots: 25,
        status: 'PUBLISHED',
        isHighlighted: true,
        isFeatured: true,
        isNew: false,
        coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
        promoVideo: '',
        materials: 'PDFs, videos, exercises',
        viewsCount: 150,
        enrollmentCount: 10,
        completionRate: 85,
        averageRating: 4.8,
        totalRatings: 25,
        creatorId: 'admin-user',
        comunidadSlug: 'tech-community',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCourses([sampleCourse]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCourses = () => {
    let filtered = [...courses];

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.institution.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(course => course.category === filterCategory);
    }
    if (filterStatus) {
      filtered = filtered.filter(course => course.status === filterStatus);
    }
    if (filterLevel) {
      filtered = filtered.filter(course => course.level === filterLevel);
    }

    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'startDate':
        filtered.sort((a, b) => new Date(a.startDate || '').getTime() - new Date(b.startDate || '').getTime());
        break;
      case 'enrolled':
        filtered.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        break;
    }

    setFilteredCourses(filtered);
  };

  const toggleStatus = async (id: string) => {
    try {
      const updatedCourses = courses.map(course => {
        if (course.id === id) {
          return {
            ...course,
            status: course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
          };
        }
        return course;
      });
      setCourses(updatedCourses);
    } catch {
      console.error('Error updating course status:', err);
      alert('Error al actualitzar l\'estat del curs');
    }
  };

  const toggleHighlight = async (id: string) => {
    try {
      const updatedCourses = courses.map(course => {
        if (course.id === id) {
          return {
            ...course,
            isHighlighted: !course.isHighlighted
          };
        }
        return course;
      });
      setCourses(updatedCourses);
    } catch {
      console.error('Error updating course highlight:', err);
      alert('Error al actualitzar el destacat del curs');
    }
  };

  const archiveCourse = async (id: string) => {
    if (confirm('Estàs segur que vols arxivar aquest curs?')) {
      try {
        const updatedCourses = courses.map(course => {
          if (course.id === id) {
            return {
              ...course,
              status: 'ARCHIVED'
            };
          }
          return course;
        });
        setCourses(updatedCourses);
        alert('Curs arxivat correctament');
      } catch {
        console.error('Error archiving course:', err);
        alert('Error al arxivar el curs');
      }
    }
  };

  const deleteCourse = async (id: string) => {
    if (confirm('Estàs segur que vols eliminar aquest curs? Aquesta acció no es pot desfer.')) {
      try {
        const updatedCourses = courses.filter(c => c.id !== id);
        setCourses(updatedCourses);
        alert('Curs eliminat correctament');
      } catch {
        console.error('Error deleting course:', err);
        alert('Error al eliminar el curs');
      }
    }
  };

  const openDetailModal = (course: Course) => {
    setSelectedCourse(course);
    setShowDetailModal(true);
  };

  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  const openEnrolledModal = (course: Course) => {
    setSelectedCourse(course);
    setShowEnrolledModal(true);
  };

  const handleSaveCourse = (updatedCourse: Course) => {
    const updatedCourses = courses.map(course =>
      course.id === updatedCourse.id ? updatedCourse : course
    );
    setCourses(updatedCourses);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Publicat</span>;
      case 'DRAFT':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Esborrany</span>;
      case 'ARCHIVED':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Arxivat</span>;
      default:
        return null;
    }
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      'Principiant': 'bg-green-100 text-green-700',
      'Intermedi': 'bg-yellow-100 text-yellow-700',
      'Avançat': 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[level as keyof typeof colors]}`}>
        {level}
      </span>
    );
  };

  const getModeBadge = (mode: string) => {
    const icons = {
      'online': '💻',
      'presencial': '🏢',
      'hibrid': '🔄'
    };
    return (
      <span className="text-sm">
        {icons[mode as keyof typeof icons]} {mode}
      </span>
    );
  };

  const categories = [...new Set(courses.map(c => c.category))];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestió de Cursos</h1>
          <p className="text-sm text-gray-600 mt-1">
            {loading ? 'Carregant...' : `${filteredCourses.length} cursos trobats`}
          </p>
        </div>
        <Link
          href="/admin/formacio/crear"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Crear Nou Curs
        </Link>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-600 mr-2">⚠️</div>
            <div className="text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cercar</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Títol, instructor..."
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Totes</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estat</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Tots</option>
              <option value="PUBLISHED">Publicat</option>
              <option value="DRAFT">Esborrany</option>
              <option value="ARCHIVED">Arxivat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivell</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Tots</option>
              <option value="Principiant">Principiant</option>
              <option value="Intermedi">Intermedi</option>
              <option value="Avançat">Avançat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar per</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="recent">Més recents</option>
              <option value="title">Títol</option>
              <option value="startDate">Data d'inici</option>
              <option value="enrolled">Inscrits</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('');
              setFilterStatus('');
              setFilterLevel('');
            }}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
          >
            🔄 Netejar filtres
          </button>
        </div>
      </div>

      {/* Lista de cursos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg mb-2">Carregant cursos...</p>
            <p className="text-sm">Això pot trigar uns segons</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">No s'han trobat cursos</p>
            <p className="text-sm">Prova a ajustar els filtres o crea un nou curs</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Curs</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Detalls</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Places</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Estat</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Accions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {(course.institutionLogo || course.coverImage) && (
                          <img
                            src={course.institutionLogo || course.coverImage || ''}
                            alt={course.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {course.title}
                            {course.isHighlighted && (
                              <span className="ml-2 text-yellow-500">⭐</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{course.instructor}</div>
                          <div className="text-xs text-gray-400">{course.institution}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div>{course.category}</div>
                        <div className="flex gap-2 mt-1">
                          {getLevelBadge(course.level)}
                          {getModeBadge(course.mode)}
                        </div>
                        <div className="text-gray-500">{course.duration}h - {course.price}{course.currency === 'EUR' ? '€' : course.currency}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div>Inici: {course.startDate ? new Date(course.startDate).toLocaleDateString('ca') : 'N/A'}</div>
                        <div>Fi: {course.endDate ? new Date(course.endDate).toLocaleDateString('ca') : 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="font-medium">{course.enrollmentCount} / {course.totalSlots}</div>
                        <div className="text-gray-500">{course.availableSlots} disponibles</div>
                        {course.availableSlots === 0 && (
                          <span className="text-xs text-red-600 font-medium">COMPLET</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {getStatusBadge(course.status)}
                        {course.isFeatured && (
                          <span className="block text-xs text-blue-600">⭐ Destacat</span>
                        )}
                        {course.isNew && (
                          <span className="block text-xs text-green-600">🆕 Nou</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* Ver detalle */}
                        <button
                          onClick={() => openDetailModal(course)}
                          className="p-1 text-gray-600 hover:text-blue-600"
                          title="Veure detalls"
                        >
                          👁️
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => openEditModal(course)}
                          className="p-1 text-gray-600 hover:text-blue-600"
                          title="Editar"
                        >
                          ✏️
                        </button>

                        {/* Toggle destacado */}
                        <button
                          onClick={() => toggleHighlight(course.id)}
                          className={`p-1 ${course.isHighlighted ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600`}
                          title="Destacar/No destacar"
                        >
                          ⭐
                        </button>

                        {/* Toggle estado */}
                        <button
                          onClick={() => toggleStatus(course.id)}
                          className="p-1 text-gray-600 hover:text-green-600"
                          title="Publicar/Despublicar"
                        >
                          {course.status === 'PUBLISHED' ? '🟢' : '⏸️'}
                        </button>

                        {/* Archivar */}
                        <button
                          onClick={() => archiveCourse(course.id)}
                          className="p-1 text-gray-600 hover:text-orange-600"
                          title="Arxivar"
                        >
                          📋
                        </button>

                        {/* Ver inscritos */}
                        <button
                          onClick={() => openEnrolledModal(course)}
                          className="p-1 text-gray-600 hover:text-green-600"
                          title="Veure inscrits"
                        >
                          👥
                        </button>

                        {/* Eliminar */}
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="p-1 text-gray-600 hover:text-red-600"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {courses.filter(c => c.status === 'PUBLISHED').length}
          </div>
          <div className="text-sm text-gray-600">Cursos Publicats</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {courses.reduce((sum, c) => sum + c.enrollmentCount, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Inscrits</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {courses.filter(c => c.isHighlighted).length}
          </div>
          <div className="text-sm text-gray-600">Cursos Destacats</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">
            {courses.filter(c => c.availableSlots === 0).length}
          </div>
          <div className="text-sm text-gray-600">Cursos Complets</div>
        </div>
      </div>

      {/* Modals */}
      {showDetailModal && selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showEditModal && selectedCourse && (
        <EditCourseModal
          course={selectedCourse}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveCourse}
        />
      )}

      {showEnrolledModal && selectedCourse && (
        <EnrolledUsersModal
          course={selectedCourse}
          onClose={() => setShowEnrolledModal(false)}
        />
      )}
    </div>
  );
}