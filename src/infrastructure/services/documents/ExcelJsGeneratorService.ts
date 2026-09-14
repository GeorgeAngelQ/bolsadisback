import { IExcelGeneratorService } from '../../../application/ports/IDocumentGeneratorService'

export class ExcelJsGeneratorService implements IExcelGeneratorService {
  async generar(datos: Record<string, unknown>[], encabezados: string[]): Promise<Buffer> {
    //integrar excel js
    const filas = [
      encabezados.join(','),
      ...datos.map(fila =>
        encabezados.map(enc => String(fila[enc] ?? '')).join(','),
      ),
    ]
    return Buffer.from(filas.join('\n'), 'utf8')
  }
}
