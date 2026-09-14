import { IFileStorageService } from '../../../application/ports/IFileStorageService'
import { LocalFileStorageService } from './LocalFileStorageService'
import { SupabaseFileStorageService } from './SupabaseFileStorageService'

export function createFileStorageService(): IFileStorageService {
  const provider = process.env.STORAGE_PROVIDER

  switch (provider) {
    case 'supabase':
      return new SupabaseFileStorageService()
    case 'local':
      return new LocalFileStorageService()
    default:
      throw new Error(`STORAGE_PROVIDER desconocido: ${provider}`)
  }
}