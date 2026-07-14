export interface AccesibilidadResult {
  esAccesible: boolean
  advertencias: string[]
}

export interface IAccessibilityCheckerService {
  verificarCV(fileBuffer: Buffer, mimeType: string): Promise<AccesibilidadResult>
  verificarContenidoHtml(html: string): Promise<AccesibilidadResult>
}
