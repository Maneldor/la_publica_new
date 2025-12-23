import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

// Directorio para guardar uploads
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

// Tipos de imagen permitidos
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * POST /api/upload
 * Sube una imagen y devuelve la URL
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📤 [Upload] POST called')

    const session = await getServerSession(authOptions)
    console.log('📤 [Upload] Session:', session?.user?.id ? 'OK' : 'NO SESSION')

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null // 'profile' | 'cover'

    console.log('📤 [Upload] File:', file?.name, file?.size, file?.type)
    console.log('📤 [Upload] Type:', type)

    if (!file) {
      return NextResponse.json({ error: 'No s\'ha proporcionat cap fitxer' }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: 'Tipus de fitxer no permès. Només PNG, JPG, GIF, WEBP'
      }, { status: 400 })
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: 'El fitxer és massa gran. Màxim 10MB'
      }, { status: 400 })
    }

    // Crear directorio si no existe
    const userUploadDir = path.join(UPLOAD_DIR, session.user.id)
    if (!existsSync(userUploadDir)) {
      await mkdir(userUploadDir, { recursive: true })
    }

    // Generar nombre único
    const ext = file.name.split('.').pop() || 'jpg'
    const prefix = type === 'cover' ? 'cover' : type === 'profile' ? 'profile' : type === 'anunci' ? 'anunci' : 'img'
    const filename = `${prefix}-${randomUUID()}.${ext}`
    const filepath = path.join(userUploadDir, filename)

    // Guardar archivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // URL pública
    const url = `/uploads/${session.user.id}/${filename}`

    console.log('📤 [Upload] Success! URL:', url)

    return NextResponse.json({
      success: true,
      url,
      filename,
      size: file.size,
      type: file.type,
    })

  } catch (error: any) {
    console.error('📤 [Upload] Error:', error?.message || error)
    return NextResponse.json({ error: 'Error del servidor', details: error?.message }, { status: 500 })
  }
}

/**
 * DELETE /api/upload
 * Elimina una imagen subida
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json({ error: 'Nom de fitxer requerit' }, { status: 400 })
    }

    // Solo permitir eliminar archivos del propio usuario
    const filepath = path.join(UPLOAD_DIR, session.user.id, filename)

    // Verificar que el archivo está en el directorio del usuario (seguridad)
    if (!filepath.startsWith(path.join(UPLOAD_DIR, session.user.id))) {
      return NextResponse.json({ error: 'Accés denegat' }, { status: 403 })
    }

    const { unlink } = await import('fs/promises')
    await unlink(filepath)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error eliminant fitxer:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
