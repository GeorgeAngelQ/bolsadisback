import { ISancionEmpresaRepository } from '../../../../domain/repositories/gestionVacante/VacanteRepositories'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { SancionEmpresa, EstadoSancion } from '../../../../domain/entities/gestionVacante/SancionEmpresa.entity'
import { EntityNotFoundError } from '../../../../domain/errors/DomainError'

//  Registrar sanción 

export interface RegistrarSancionInputDto {
  idEmpresa: number
  idAdministrador: number
  motivo: string
  normativaInfringida?: string
}

export class RegistrarSancionEmpresaUseCase {
  constructor(
    private readonly sancionRepository: ISancionEmpresaRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: RegistrarSancionInputDto): Promise<void> {
    const sancion = await this.sancionRepository.save(
      new SancionEmpresa({
        id: 0,
        idEmpresa: input.idEmpresa,
        idAdministrador: input.idAdministrador,
        motivo: input.motivo,
        fechaInicio: new Date(),
        estado: EstadoSancion.ACTIVA,
        normativaInfringida: input.normativaInfringida,
      }),
    )

    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: 'sancion_empresa_registrada',
      modulo: 'administracion',
      objetoAfectado: 'SancionEmpresa',
      idObjetoAfectado: sancion.id,
      resultado: 'exitoso',
      detalle: input.motivo,
    })
  }
}

//  Levantar sanción 

export interface LevantarSancionInputDto {
  idSancion: number
  idAdministrador: number
}

export class LevantarSancionEmpresaUseCase {
  constructor(
    private readonly sancionRepository: ISancionEmpresaRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: LevantarSancionInputDto): Promise<void> {
    const sancion = await this.sancionRepository.findById(input.idSancion)
    if (!sancion) throw new EntityNotFoundError('SancionEmpresa', input.idSancion)

    sancion.levantar()
    await this.sancionRepository.update(sancion)

    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: 'sancion_empresa_levantada',
      modulo: 'administracion',
      objetoAfectado: 'SancionEmpresa',
      idObjetoAfectado: input.idSancion,
      resultado: 'exitoso',
    })
  }
}
