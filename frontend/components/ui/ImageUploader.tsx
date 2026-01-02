'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploaderProps {
  value?: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  accept?: string
  folder?: string
  aspectRatio?: 'square' | 'cover' | 'auto'
  recommendedSize?: string
  showUrlInput?: boolean
}

export function ImageUploader({
  value = '',
  onChange,
  className = '',
  placeholder = 'Arrossega una imatge o fes clic',
  accept = 'image/*',
  folder = 'general',
  aspectRatio = 'auto',
  recommendedSize,
  showUrlInput = false
}: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const aspectClasses: Record<string, string> = {
    square: 'aspect-square w-32',
    cover: 'aspect-[3/1] w-full min-h-[120px]',
    auto: 'min-h-[120px] w-full'
  }

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', folder)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Error pujant imatge')
    }

    return data.url
  }

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Només es permeten imatges')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imatge no pot superar els 5MB')
      return
    }

    setIsUploading(true)

    try {
      const url = await uploadToCloudinary(file)
      onChange(url)
      toast.success('Imatge pujada correctament')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Error pujant la imatge')
    } finally {
      setIsUploading(false)
    }
  }, [onChange, folder])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }, [onChange])

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onChange])

  const baseClasses = 'relative border-2 border-dashed rounded-lg transition-all cursor-pointer overflow-hidden'
  const stateClasses = isDragOver
    ? 'border-indigo-500 bg-indigo-50'
    : value
      ? 'border-gray-200 hover:border-gray-300 bg-white'
      : 'border-gray-300 hover:border-indigo-400 bg-gray-50 hover:bg-gray-100'

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`${baseClasses} ${aspectClasses[aspectRatio]} ${stateClasses} ${isUploading ? 'pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <span className="mt-2 text-sm text-gray-600">Pujant...</span>
          </div>
        ) : value ? (
          <>
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => onChange('')}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="p-2 bg-gray-100 rounded-full mb-2">
              {isDragOver ? (
                <Upload className="w-5 h-5 text-indigo-600" />
              ) : (
                <ImageIcon className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-700 text-center font-medium">{placeholder}</p>
            {recommendedSize && (
              <p className="text-xs text-gray-600 mt-1 font-medium">{recommendedSize}</p>
            )}
          </div>
        )}
      </div>

      {showUrlInput && (
        <input
          type="url"
          value={value}
          onChange={handleUrlChange}
          className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-gray-400"
          placeholder="O enganxa una URL"
        />
      )}
    </div>
  )
}

export default ImageUploader
