'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Upload, X, ImageIcon } from 'lucide-react'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  error?: string
  maxImages?: number
}

export function ImageUploader({ images, onChange, error, maxImages = 5 }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // In production, you would upload to a storage service
    // For now, we'll create object URLs for preview
    const newImages = Array.from(files).map((file) => URL.createObjectURL(file))

    // Limit total images
    const updatedImages = [...images, ...newImages].slice(0, maxImages)
    onChange(updatedImages)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const canAddMore = images.length < maxImages

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-pink-500" />
        Imatges
        <span className="text-sm font-normal text-gray-500">
          ({images.length}/{maxImages})
        </span>
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Existing images */}
        {images.map((img, index) => (
          <div
            key={index}
            className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden group"
          >
            <Image
              src={img}
              alt={`Image ${index + 1}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
              {index + 1}
            </div>
          </div>
        ))}

        {/* Upload button */}
        {canAddMore && (
          <label className="aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500 font-medium">Afegir imatge</span>
            <span className="text-xs text-gray-400 mt-1">JPG, PNG fins 5MB</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {images.length > 0 && (
        <p className="text-xs text-gray-400 mt-3">
          Arrossega per reordenar. La primera imatge serà la principal.
        </p>
      )}
    </div>
  )
}
