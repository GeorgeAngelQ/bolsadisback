import { IPdfGeneratorService } from '../../../application/ports/IDocumentGeneratorService'

export class PdfKitGeneratorService implements IPdfGeneratorService {
  async generar(datos: Record<string, unknown>, titulo: string): Promise<Buffer> {
    //integrar pdfkit
    const contenido = `${titulo}\n\n${JSON.stringify(datos, null, 2)}`
    return Buffer.from(contenido, 'utf8')
  }
}
