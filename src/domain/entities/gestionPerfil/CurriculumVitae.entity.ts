import { BusinessRuleViolationError } from '../../errors/DomainError'

export type FormatoCV = 'pdf' | 'docx'

export interface CurriculumVitaeProps {
  id: number
  idPerfil: number
  urlArchivo?: string
  formatoArchivo?: FormatoCV
  fechaSubida?: Date
  generadoPorPlataforma: boolean
  accesible: boolean
}

export class CurriculumVitae {
  readonly id: number
  readonly idPerfil: number
  private urlArchivo?: string
  private formatoArchivo?: FormatoCV
  private fechaSubida?: Date
  private generadoPorPlataforma: boolean
  private accesible: boolean

  private static readonly FORMATOS_PERMITIDOS: FormatoCV[] = ['pdf', 'docx']

  constructor(props: CurriculumVitaeProps) {
    this.id = props.id
    this.idPerfil = props.idPerfil
    this.urlArchivo = props.urlArchivo
    this.formatoArchivo = props.formatoArchivo
    this.fechaSubida = props.fechaSubida
    this.generadoPorPlataforma = props.generadoPorPlataforma
    this.accesible = props.accesible
  }

  getUrlArchivo(): string | undefined { return this.urlArchivo }
  getFormatoArchivo(): FormatoCV | undefined { return this.formatoArchivo }
  getFechaSubida(): Date | undefined { return this.fechaSubida }
  isGeneradoPorPlataforma(): boolean { return this.generadoPorPlataforma }
  isAccesible(): boolean { return this.accesible }
  tieneArchivo(): boolean { return !!this.urlArchivo }

  static validarFormato(formato: string): void {
    if (!CurriculumVitae.FORMATOS_PERMITIDOS.includes(formato as FormatoCV)) {
      throw new BusinessRuleViolationError(
        'cv',
        `Formato no permitido. Solo se aceptan: ${CurriculumVitae.FORMATOS_PERMITIDOS.join(', ')}`,
      )
    }
  }

  registrarSubida(url: string, formato: FormatoCV, accesible: boolean): void {
    CurriculumVitae.validarFormato(formato)
    this.urlArchivo = url
    this.formatoArchivo = formato
    this.fechaSubida = new Date()
    this.generadoPorPlataforma = false
    this.accesible = accesible
  }

  registrarGeneracion(url: string): void {
    this.urlArchivo = url
    this.formatoArchivo = 'pdf'
    this.fechaSubida = new Date()
    this.generadoPorPlataforma = true
    this.accesible = true   // RN-19: CV generado siempre es accesible
  }
}
