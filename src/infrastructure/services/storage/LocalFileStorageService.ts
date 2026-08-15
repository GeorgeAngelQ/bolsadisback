import fs from 'fs/promises'
import path from 'path'
import { IFileStorageService } from '../../../application/ports/IFileStorageService'

const STORAGE_BASE = process.env.STORAGE_PATH ?? './uploads'

export class LocalFileStorageService implements IFileStorageService {
  async upload(file: Buffer, filename: string, _mimeType: string): Promise<string> {
    const filePath = path.join(STORAGE_BASE, filename)
    const dir = path.dirname(filePath)

    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(filePath, file)

    const urlBase = process.env.STORAGE_URL ?? 'http://localhost:3000/uploads'
    return `${urlBase}/${filename}`
  }

  async delete(url: string): Promise<void> {
    const urlBase = process.env.STORAGE_URL ?? 'http://localhost:3000/uploads'
    const relativePath = url.replace(urlBase + '/', '')
    const filePath = path.join(STORAGE_BASE, relativePath)

    try {
      await fs.unlink(filePath)
    } catch {
      // Si el archivo no existe, no es un error crítico
    }
  }

  async getSignedUrl(url: string): Promise<string> {
    // En desarrollo devuelve la misma URL
    // En producción se generaría un token firmado con expiración
    return url
  }
}
