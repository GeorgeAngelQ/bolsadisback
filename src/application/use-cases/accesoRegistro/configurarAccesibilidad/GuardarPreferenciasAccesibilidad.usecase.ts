import { IPreferenciaAccesibilidadRepository } from '../../../../domain/repositories/accesoRegistro/IPreferenciaAccesibilidadRepository'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { EntityNotFoundError } from '../../../../domain/errors/DomainError'
import { TipoContraste, TamanoTexto } from '../../../../domain/entities/accesoRegistro/PreferenciaAccesibilidad.entity'

export interface GuardarPreferenciasInputDto {
  idUsuario: number
  tipoContraste?: TipoContraste
  tamanoTexto?: TamanoTexto
  subtitulosActivos?: boolean
  lenguaSenas?: boolean
  lectorPantalla?: boolean
  lenguajeSencillo?: boolean
}

export class GuardarPreferenciasAccesibilidadUseCase {
  constructor(
    private readonly preferenciaRepository: IPreferenciaAccesibilidadRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: GuardarPreferenciasInputDto): Promise<void> {
    const preferencia = await this.preferenciaRepository.findByIdUsuario(input.idUsuario)
    if (!preferencia) throw new EntityNotFoundError('PreferenciaAccesibilidad', input.idUsuario)

    preferencia.actualizar({
      tipoContraste: input.tipoContraste,
      tamanoTexto: input.tamanoTexto,
      subtitulosActivos: input.subtitulosActivos,
      lenguaSenas: input.lenguaSenas,
      lectorPantalla: input.lectorPantalla,
      lenguajeSencillo: input.lenguajeSencillo,
    })

    await this.preferenciaRepository.update(preferencia)

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'preferencias_accesibilidad_actualizadas',
      modulo: 'acceso',
      resultado: 'exitoso',
    })
  }
}
