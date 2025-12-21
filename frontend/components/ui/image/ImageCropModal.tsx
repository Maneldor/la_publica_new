'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'

interface Point {
  x: number
  y: number
}

interface Area {
  x: number
  y: number
  width: number
  height: number
}

interface ImageCropModalProps {
  imageUrl: string
  onClose: () => void
  onCropComplete: (croppedFile: File) => void
  aspectRatio?: number
  title?: string
  cropShape?: 'rect' | 'round'
}

// Función para crear imagen recortada
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.crossOrigin = 'anonymous'
    image.src = url
  })

// Función para obtener imagen recortada
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  outputType = 'image/jpeg'
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  const maxSize = Math.max(image.width, image.height)
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  // Configurar canvas con el área segura para rotación
  canvas.width = safeArea
  canvas.height = safeArea

  // Trasladar canvas al centro para rotación
  ctx.translate(safeArea / 2, safeArea / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-safeArea / 2, -safeArea / 2)

  // Dibujar imagen rotada
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  )

  // Extraer área recortada
  const data = ctx.getImageData(0, 0, safeArea, safeArea)

  // Configurar canvas al tamaño final
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // Pegar imagen recortada
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  )

  // Devolver como blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Canvas is empty'))
      }
    }, outputType, 0.9)
  })
}

export function ImageCropModal({
  imageUrl,
  onClose,
  onCropComplete,
  aspectRatio = 4 / 1,
  title = 'Retallar imatge',
  cropShape = 'rect'
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropCompleteCallback = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleSave = async () => {
    if (!croppedAreaPixels) return

    setIsProcessing(true)
    try {
      const croppedBlob = await getCroppedImg(
        imageUrl,
        croppedAreaPixels,
        rotation
      )

      // Crear File desde Blob
      const croppedFile = new File([croppedBlob], 'cropped-image.jpg', {
        type: 'image/jpeg'
      })

      onCropComplete(croppedFile)
    } catch (error) {
      console.error('Error retallant imatge:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Crop area */}
        <div className="relative h-[400px] bg-gray-900">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            cropShape={cropShape}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        {/* Controls */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center gap-6 mb-4">
            {/* Zoom control */}
            <div className="flex items-center gap-3 flex-1">
              <ZoomOut className="w-4 h-4 text-gray-500" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <ZoomIn className="w-4 h-4 text-gray-500" />
            </div>

            {/* Rotation control */}
            <button
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Girar 90°"
            >
              <RotateCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel·lar
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processant...
                </>
              ) : (
                'Aplicar retall'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageCropModal
