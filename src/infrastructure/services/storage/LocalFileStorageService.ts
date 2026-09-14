import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { IFileStorageService } from '@application/ports/IFileStorageService'
import { InvalidFileTypeError, FileTooLargeError } from '@shared/errors/ValidationError'

const STORAGE_BASE = process.env.STORAGE_PATH ?? './uploads'
const STORAGE_URL_BASE = process.env.STORAGE_URL ?? 'http://localhost:3000/uploads'

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
])

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 

export class LocalFileStorageService implements IFileStorageService {
  async upload(file: Buffer, filename: string, mimeType: string): Promise<string> {
    this.validarMimeType(mimeType)
    this.validarTamano(file)

    const key = this.generarNombreUnico(filename)
    const filePath = path.join(STORAGE_BASE, key)

    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, file)

    return key
  }

  async getSignedUrl(key: string): Promise<string> {
    const urlBase = process.env.STORAGE_URL ?? 'http://localhost:3000/uploads'
    return `${urlBase}/${key}`
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(STORAGE_BASE, key)
    try {
      await fs.unlink(filePath)
    } catch {}
  }

  private validarMimeType(mimeType: string): void {
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new InvalidFileTypeError(mimeType, Array.from(ALLOWED_MIME_TYPES))
    }
  }

  private validarTamano(file: Buffer): void {
    if (file.byteLength > MAX_FILE_SIZE_BYTES) {
      throw new FileTooLargeError(MAX_FILE_SIZE_BYTES / (1024 * 1024))
    }
  }

  private generarNombreUnico(filenameOriginal: string): string {
    const ext = path.extname(filenameOriginal)
    const base = path
      .basename(filenameOriginal, ext)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') 
      .replace(/[^a-zA-Z0-9-_]/g, '_') 
      .slice(0, 50)

    const sufijo = crypto.randomBytes(6).toString('hex')
    const timestamp = Date.now()

    return `${base}_${timestamp}_${sufijo}${ext}`
  }
}