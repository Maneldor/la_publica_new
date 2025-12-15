import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat, mkdir } from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)
const BACKUP_DIR = path.join(process.cwd(), 'backups')

// Verificación de autenticación (misma que en maintenance)
async function verifyAdminAuth(request: NextRequest) {
  // TODO: Implementar verificación real de rol ADMIN/SUPER_ADMIN
  // Por ahora retornamos true para desarrollo
  return true
}

// GET: Lista backups existentes
export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(request)
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    // Crear directorio si no existe
    await mkdir(BACKUP_DIR, { recursive: true }).catch(() => {})
    
    const files = await readdir(BACKUP_DIR).catch(() => [])
    const backups = []
    
    for (const file of files) {
      if (file.endsWith('.sql') || file.endsWith('.sql.gz')) {
        const filePath = path.join(BACKUP_DIR, file)
        const stats = await stat(filePath)
        backups.push({
          id: file,
          filename: file,
          size: formatBytes(stats.size),
          created: stats.mtime.toLocaleString('ca-ES')
        })
      }
    }
    
    // Ordenar por fecha descendente (más recientes primero)
    backups.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    
    return NextResponse.json({ 
      success: true, 
      backups: backups.slice(0, 10) // Máximo 10 backups
    })
  } catch (error) {
    console.error('Error llistant backups:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error llistant backups' 
    }, { status: 500 })
  }
}

// POST: Crear backup manual
export async function POST(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(request)
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    // Crear directorio si no existe
    await mkdir(BACKUP_DIR, { recursive: true }).catch(() => {})
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const filename = `backup_${timestamp}.sql`
    const filepath = path.join(BACKUP_DIR, filename)
    
    // Leer DATABASE_URL del entorno
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'DATABASE_URL no configurada' 
      }, { status: 500 })
    }
    
    // Parsear DATABASE_URL para extraer credenciales
    // Formato: postgresql://user:password@host:port/database
    const url = new URL(dbUrl)
    const user = url.username
    const password = url.password
    const host = url.hostname
    const port = url.port || '5432'
    const database = url.pathname.slice(1)
    
    if (!user || !password || !host || !database) {
      return NextResponse.json({ 
        success: false, 
        error: 'DATABASE_URL amb format incorrecte' 
      }, { status: 500 })
    }
    
    // Ejecutar pg_dump
    const command = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -F p -f "${filepath}"`
    
    console.log(`Creant backup: ${filename}`)
    await execAsync(command)
    
    // Verificar que el archivo se creó
    const stats = await stat(filepath)
    
    return NextResponse.json({ 
      success: true, 
      message: `Backup creat correctament: ${filename}`,
      filename,
      size: formatBytes(stats.size)
    })
  } catch (error) {
    console.error('Error creant backup:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error creant backup: ' + (error as Error).message 
    }, { status: 500 })
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}