import { IAccessibilityCheckerService, AccesibilidadResult } from '../../../application/ports/IAccessibilityCheckerService'

export class WcagAccessibilityChecker implements IAccessibilityCheckerService {
  async verificarCV(fileBuffer: Buffer, mimeType: string): Promise<AccesibilidadResult> {
    const advertencias: string[] = []

    // RN-19: verificación básica de accesibilidad de CV
    if (mimeType === 'application/pdf') {
      // Se podrìa integrar pdf-lib o pdfjs-dist para analizar estructura
      // Por ahora se aplica una verificación básica por tamaño
      if (fileBuffer.length === 0) {
        advertencias.push('El archivo PDF está vacío')
      }
      // Un PDF accesible requiere texto seleccionable (no solo imágenes)
      const contenidoTexto = fileBuffer.toString('utf8', 0, Math.min(1000, fileBuffer.length))
      const tieneTexto = contenidoTexto.includes('/Type /Page') || contenidoTexto.includes('BT')
      if (!tieneTexto) {
        advertencias.push('El PDF podría no ser accesible para lectores de pantalla (sin texto seleccionable)')
      }
    }

    return {
      esAccesible: advertencias.length === 0,
      advertencias,
    }
  }

  async verificarContenidoHtml(html: string): Promise<AccesibilidadResult> {
    const advertencias: string[] = []

    // RN-64: verificaciones básicas WCAG 2.1 AA
    if (!html.includes('lang=')) {
      advertencias.push('Falta atributo lang en el documento')
    }

    const imagenesSinAlt = (html.match(/<img(?![^>]*alt=)[^>]*>/g) ?? []).length
    if (imagenesSinAlt > 0) {
      advertencias.push(`${imagenesSinAlt} imagen(s) sin atributo alt`)
    }

    const enlacesSinTexto = (html.match(/<a[^>]*>\s*<\/a>/g) ?? []).length
    if (enlacesSinTexto > 0) {
      advertencias.push(`${enlacesSinTexto} enlace(s) sin texto descriptivo`)
    }

    return {
      esAccesible: advertencias.length === 0,
      advertencias,
    }
  }
}
