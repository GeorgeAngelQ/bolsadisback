import { IUsuarioRepository } from '@domain/repositories/accesoRegistro/IUsuarioRepository'

import { EstadoUsuario } from '@domain/enums/EstadoUsuario.enum'

import { EntityNotFoundError, BusinessRuleViolationError } from '@domain/errors/DomainError'

import { IAuditLoggerService } from '@application/ports/IAuditLoggerService'
import { INotificationService } from '@application/ports/INotificationService'

import { IUnitOfWork } from '@application/ports/IUnitOfWork'

export interface ReactivarCuentaInputDto {
  idAdministrador: number
  idUsuario: number
}

export class ReactivarCuentaUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly auditLogger: IAuditLoggerService,
    private readonly notificationService: INotificationService,
  ) {}

  async execute(input: ReactivarCuentaInputDto): Promise<void> {
    const usuario = await this.usuarioRepository.findById(input.idUsuario)
    if (!usuario) throw new EntityNotFoundError('Usuario', input.idUsuario)

    if (usuario.getEstado() === EstadoUsuario.ELIMINADO) {
      throw new BusinessRuleViolationError('estado', 'No se puede reactivar una cuenta eliminada')
    }

    if (usuario.estaActivo()) {
      throw new BusinessRuleViolationError('estado', 'La cuenta ya está activa')
    }

    await this.unitOfWork.execute(async () => {
      
      usuario.reactivar()
      await this.usuarioRepository.update(usuario)

      await this.notificationService.notificar(
        input.idUsuario,
        'Cuenta reactivada',
        'Tu cuenta ha sido reactivada. Ya puedes acceder al portal.',
      )
    })

    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: 'cuenta_reactivada',
      modulo: 'administracion',
      objetoAfectado: 'Usuario',
      idObjetoAfectado: input.idUsuario,
      resultado: 'exitoso',
    })
  }
}
