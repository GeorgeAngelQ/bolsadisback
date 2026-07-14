export interface IFileStorageService {
  upload(file: Buffer, filename: string, mimeType: string): Promise<string>
  delete(url: string): Promise<void>
  getSignedUrl(url: string): Promise<string>
}
