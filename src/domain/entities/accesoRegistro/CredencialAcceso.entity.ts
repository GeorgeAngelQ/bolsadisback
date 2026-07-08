import { BusinessRuleViolationError } from '../../errors/DomainError'

// RN-06: token de recuperación expira en 24 horas
const HORAS_EXPIRACION_TOKEN = 24

export interface CredencialAccesoProps {
  id: number
  idUsuario: number
  tokenRecuperacion?: string
  fechaExpiracionToken?: Date
  fechaUltimoCambio?: Date
}

export class CredencialAcceso {
  readonly id: number
  readonly idUsuario: number
  private tokenRecuperacion?: string
  private fechaExpiracionToken?: Date
  private fechaUltimoCambio?: Date

  constructor(props: CredencialAccesoProps) {
    this.id = props.id
    this.idUsuario = props.idUsuario
    this.tokenRecuperacion = props.tokenRecuperacion
    this.fechaExpiracionToken = props.fechaExpiracionToken
    this.fechaUltimoCambio = props.fechaUltimoCambio
  }

  getTokenRecuperacion(): string | undefined { return this.tokenRecuperacion }
  getFechaExpiracionToken(): Date | undefined { return this.fechaExpiracionToken }
  getFechaUltimoCambio(): Date | undefined { return this.fechaUltimoCambio }

  guardarToken(token: string): void {
    this.tokenRecuperacion = token
    const expiracion = new Date()
    expiracion.setHours(expiracion.getHours() + HORAS_EXPIRACION_TOKEN)
    this.fechaExpiracionToken = expiracion
  }

  validarToken(token: string): void {
    if (this.tokenRecuperacion !== token) {
      throw new BusinessRuleViolationError('RN-06', 'El token de recuperación no es válido')
    }
    if (!this.fechaExpiracionToken || new Date() > this.fechaExpiracionToken) {
      throw new BusinessRuleViolationError('RN-06', 'El enlace de recuperación ha expirado')
    }
  }

  invalidarToken(): void {
    this.tokenRecuperacion = undefined
    this.fechaExpiracionToken = undefined
  }

  registrarCambioContrasena(): void {
    this.fechaUltimoCambio = new Date()
    this.invalidarToken()
  }
}
