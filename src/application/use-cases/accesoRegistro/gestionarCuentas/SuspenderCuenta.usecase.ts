import { IUsuarioRepository } from '../../../../domain/repositories/accesoRegistro/IUsuarioRepository'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { INotificationService } from '../../../ports/INotificationService'
import {
  EntityNotFoundError,
  BusinessRuleViolationError,
} from '../../../../domain/errors/DomainError'
import { EstadoUsuario } from '../../../../domain/enums/EstadoUsuario.enum'

export interface SuspenderCuentaInputDto {
  idAdministrador: number
  idUsuario: number
  motivo?: string
}

export class SuspenderCuentaUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly auditLogger: IAuditLoggerService,
    private readonly notificationService: INotificationService,
  ) {}

  async execute(input: SuspenderCuentaInputDto): Promise<void> {
    // RN-59: debe existir al menos un administrador activo
    if (input.idAdministrador === input.idUsuario) {
      const totalAdmins = await this.usuarioRepository.countAdministradoresActivos()
      if (totalAdmins <= 1) {
        throw new BusinessRuleViolationError(
          'RN-59',
          'No se puede suspender al único administrador activo del sistema',
        )
      }
    }

    const usuario = await this.usuarioRepository.findById(input.idUsuario)
    if (!usuario) throw new EntityNotFoundError('Usuario', input.idUsuario)

    if (usuario.getEstado() === EstadoUsuario.ELIMINADO) {
      throw new BusinessRuleViolationError('estado', 'No se puede suspender una cuenta eliminada')
    }

    usuario.suspender()
    await this.usuarioRepository.update(usuario)

    await this.notificationService.notificar(
      input.idUsuario,
      'Cuenta suspendida',
      'Tu cuenta ha sido suspendida. Contacta al administrador para más información.',
    )

    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: 'cuenta_suspendida',
      modulo: 'administracion',
      objetoAfectado: 'Usuario',
      idObjetoAfectado: input.idUsuario,
      resultado: 'exitoso',
      detalle: input.motivo,
    })
  }
}
