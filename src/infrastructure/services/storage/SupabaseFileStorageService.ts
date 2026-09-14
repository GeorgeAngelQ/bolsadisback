import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { IFileStorageService } from '../../../application/ports/IFileStorageService'
import { ValidationError } from '@shared/errors/ValidationError'

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
])

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export class SupabaseFileStorageService implements IFileStorageService {
  private readonly client: SupabaseClient
  private readonly bucket: string

  constructor() {
    const url = process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    this.bucket = process.env.SUPABASE_BUCKET ?? 'uploads'

    if (!url || !serviceKey) {
      throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos')
    }

    this.client = createClient(url, serviceKey)
  }

  async upload(file: Buffer, filename: string, mimeType: string): Promise<string> {
    this.validarMimeType(mimeType)
    this.validarTamano(file)

    const key = this.generarKeyUnica(filename)

    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(key, file, { contentType: mimeType, upsert: false })

    if (error) {
      throw new Error(`Error al subir archivo a Supabase: ${error.message}`)
    }

    return key 
  }

  async delete(key: string): Promise<void> {
    await this.client.storage.from(this.bucket).remove([key])
  }

  async getSignedUrl(key: string): Promise<string> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(key, 60 * 60) 

    if (error || !data) {
      throw new Error(`No se pudo generar URL firmada: ${error?.message}`)
    }

    return data.signedUrl
  }

  private validarMimeType(mimeType: string): void {
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new ValidationError(`Tipo de archivo no permitido: ${mimeType}`)
    }
  }

  private validarTamano(file: Buffer): void {
    if (file.byteLength > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError('El archivo excede el tamaño máximo permitido (10MB)')
    }
  }

  private generarKeyUnica(filenameOriginal: string): string {
    const ext = filenameOriginal.split('.').pop()
    const base = filenameOriginal
      .replace(/\.[^/.]+$/, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 50)

    return `${base}_${Date.now()}_${crypto.randomUUID()}.${ext}`
  }
}