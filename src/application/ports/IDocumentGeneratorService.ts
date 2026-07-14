export interface IPdfGeneratorService {
  generar(datos: Record<string, unknown>, titulo: string): Promise<Buffer>
}

export interface IExcelGeneratorService {
  generar(datos: Record<string, unknown>[], encabezados: string[]): Promise<Buffer>
}
