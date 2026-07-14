import { IVacanteRepository } from '../../../../domain/repositories/gestionVacante/VacanteRepositories'
import { INotificationService } from '../../../ports/INotificationService'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { EntityNotFoundError, BusinessRuleViolationError } from '../../../../domain/errors/DomainError'

export interface CerrarVacanteInputDto {
  idVacante: number
  idEmpresa: number
  idUsuario: number
}

export class CerrarVacanteUseCase {
  constructor(
    private readonly vacanteRepository: IVacanteRepository,
    private readonly notificationService: INotificationService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: CerrarVacanteInputDto): Promise<void> {
    const vacante = await this.vacanteRepository.findById(input.idVacante)
    if (!vacante) throw new EntityNotFoundError('Vacante', input.idVacante)

    if (vacante.getIdEmpresa() !== input.idEmpresa) {
      throw new BusinessRuleViolationError('vacante', 'No tienes acceso a esta vacante')
    }

    // RN-26: cierre solo desactiva nuevas postulaciones,
    // las existentes continúan (regla en la entidad)
    vacante.cerrar()
    await this.vacanteRepository.update(vacante)

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'vacante_cerrada',
      modulo: 'vacante',
      objetoAfectado: 'Vacante',
      idObjetoAfectado: input.idVacante,
      resultado: 'exitoso',
    })
  }
}
