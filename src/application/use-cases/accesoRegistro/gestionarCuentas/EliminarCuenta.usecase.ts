import { IUsuarioRepository } from '../../../../domain/repositories/accesoRegistro/IUsuarioRepository'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import {
  EntityNotFoundError,
  BusinessRuleViolationError,
} from '../../../../domain/errors/DomainError'
import { EstadoUsuario } from '../../../../domain/enums/EstadoUsuario.enum'

export interface EliminarCuentaInputDto {
  idAdministrador: number
  idUsuario: number
  motivo?: string
}

export class EliminarCuentaUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: EliminarCuentaInputDto): Promise<void> {
    // RN-59: no eliminar si es el único administrador activo
    if (input.idAdministrador === input.idUsuario) {
      const totalAdmins = await this.usuarioRepository.countAdministradoresActivos()
      if (totalAdmins <= 1) {
        throw new BusinessRuleViolationError(
          'RN-59',
          'No se puede eliminar al único administrador activo del sistema',
        )
      }
    }

    const usuario = await this.usuarioRepository.findById(input.idUsuario)
    if (!usuario) throw new EntityNotFoundError('Usuario', input.idUsuario)

    if (usuario.getEstado() === EstadoUsuario.ELIMINADO) {
      throw new BusinessRuleViolationError('estado', 'La cuenta ya fue eliminada')
    }

    usuario.eliminar()
    await this.usuarioRepository.update(usuario)

    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: 'cuenta_eliminada',
      modulo: 'administracion',
      objetoAfectado: 'Usuario',
      idObjetoAfectado: input.idUsuario,
      resultado: 'exitoso',
      detalle: input.motivo,
    })
  }
}
