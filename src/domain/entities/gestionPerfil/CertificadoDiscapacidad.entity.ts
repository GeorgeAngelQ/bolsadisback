import { BusinessRuleViolationError } from '../../errors/DomainError'

export interface CertificadoDiscapacidadProps {
  id: number
  idPerfil: number
  numeroCarne: string
  fechaEmision: Date
  fechaVencimiento?: Date
  entidadEmisora: string
  urlDocumento?: string
  verificado: boolean
}

export class CertificadoDiscapacidad {
  readonly id: number
  readonly idPerfil: number
  private numeroCarne: string
  private fechaEmision: Date
  private fechaVencimiento?: Date
  private entidadEmisora: string
  private urlDocumento?: string
  private verificado: boolean

  constructor(props: CertificadoDiscapacidadProps) {
    this.id = props.id
    this.idPerfil = props.idPerfil
    this.numeroCarne = props.numeroCarne
    this.fechaEmision = props.fechaEmision
    this.fechaVencimiento = props.fechaVencimiento
    this.entidadEmisora = props.entidadEmisora
    this.urlDocumento = props.urlDocumento
    this.verificado = props.verificado
  }

  getNumeroCarne(): string { return this.numeroCarne }
  getFechaEmision(): Date { return this.fechaEmision }
  getFechaVencimiento(): Date | undefined { return this.fechaVencimiento }
  getEntidadEmisora(): string { return this.entidadEmisora }
  getUrlDocumento(): string | undefined { return this.urlDocumento }
  isVerificado(): boolean { return this.verificado }

  estaVigente(): boolean {
    if (!this.fechaVencimiento) return true
    return new Date() <= this.fechaVencimiento
  }

  verificar(): void {
    if (!this.estaVigente()) {
      throw new BusinessRuleViolationError(
        'certificado',
        'No se puede verificar un certificado vencido',
      )
    }
    this.verificado = true
  }

  actualizar(datos: Partial<Omit<CertificadoDiscapacidadProps, 'id' | 'idPerfil' | 'verificado'>>): void {
    if (datos.numeroCarne) this.numeroCarne = datos.numeroCarne
    if (datos.fechaEmision) this.fechaEmision = datos.fechaEmision
    if (datos.fechaVencimiento !== undefined) this.fechaVencimiento = datos.fechaVencimiento
    if (datos.entidadEmisora) this.entidadEmisora = datos.entidadEmisora
    if (datos.urlDocumento !== undefined) this.urlDocumento = datos.urlDocumento
    this.verificado = false   // Requiere nueva verificación al actualizar
  }
}
