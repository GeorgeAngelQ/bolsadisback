import { EstadoUsuario } from '../../enums/EstadoUsuario.enum'
import { BusinessRuleViolationError } from '../../errors/DomainError'
import { Email } from '../../value-objects/Email.vo'

export interface UsuarioProps {
  id: number
  correo: Email
  contrasenaHash: string
  estado: EstadoUsuario
  intentosFallidos: number
  fechaRegistro: Date
  ultimoAcceso?: Date
}

export class Usuario {
  readonly id: number
  private correo: Email
  private contrasenaHash: string
  private estado: EstadoUsuario
  private intentosFallidos: number
  readonly fechaRegistro: Date
  private ultimoAcceso?: Date

  // RN-05: máximo de intentos fallidos antes del bloqueo
  private static readonly MAX_INTENTOS_FALLIDOS = 3

  constructor(props: UsuarioProps) {
    this.id = props.id
    this.correo = props.correo
    this.contrasenaHash = props.contrasenaHash
    this.estado = props.estado
    this.intentosFallidos = props.intentosFallidos
    this.fechaRegistro = props.fechaRegistro
    this.ultimoAcceso = props.ultimoAcceso
  }

  getCorreo(): string {
    return this.correo.getValue()
  }

  getContrasenaHash(): string {
    return this.contrasenaHash
  }

  getEstado(): EstadoUsuario {
    return this.estado
  }

  getIntentosFallidos(): number {
    return this.intentosFallidos
  }

  getUltimoAcceso(): Date | undefined {
    return this.ultimoAcceso
  }

  estaActivo(): boolean {
    return this.estado === EstadoUsuario.ACTIVO
  }

  estaSuspendido(): boolean {
    return this.estado === EstadoUsuario.SUSPENDIDO
  }

  registrarIntentoFallido(): void {
    this.intentosFallidos += 1
    // RN-05: bloqueo automático tras 3 intentos fallidos
    if (this.intentosFallidos >= Usuario.MAX_INTENTOS_FALLIDOS) {
      this.estado = EstadoUsuario.SUSPENDIDO
    }
  }

  resetearIntentosFallidos(): void {
    this.intentosFallidos = 0
  }

  registrarAcceso(): void {
    if (!this.estaActivo()) {
      throw new BusinessRuleViolationError('RN-05', 'No se puede registrar acceso a una cuenta no activa')
    }
    this.ultimoAcceso = new Date()
  }

  suspender(): void {
    if (this.estado === EstadoUsuario.ELIMINADO) {
      throw new BusinessRuleViolationError('RN-09', 'No se puede suspender una cuenta eliminada')
    }
    this.estado = EstadoUsuario.SUSPENDIDO
  }

  reactivar(): void {
    this.estado = EstadoUsuario.ACTIVO
    this.intentosFallidos = 0
  }

  eliminar(): void {
    this.estado = EstadoUsuario.ELIMINADO
  }

  actualizarContrasena(nuevoHash: string): void {
    this.contrasenaHash = nuevoHash
    this.intentosFallidos = 0
  }
}
