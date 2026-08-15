import { IAlertaEmpleoRepository } from '@domain/repositories/busquedaPostulacion/PostulacionRepositories'
import { IAuditLoggerService } from '@application/ports/IAuditLoggerService'
import { AlertaEmpleo } from '@domain/entities/busquedaPostulacion/PostulacionEntities.entity'
import { FrecuenciaAlerta } from '@domain/enums/PostulacionEnums.enum'
import { ModalidadTrabajo } from '@domain/enums/VacanteEnums.enum'
import { EntityNotFoundError, BusinessRuleViolationError } from '@domain/errors/DomainError'

// ---------- Crear alerta ----------

export interface CrearAlertaEmpleoInputDto {
  idCandidato: number
  idUsuario: number
  palabrasClave?: string
  sectorEconomico?: string
  modalidad?: ModalidadTrabajo | 'todas'
  frecuencia: FrecuenciaAlerta
}

export class CrearAlertaEmpleoUseCase {
  constructor(
    private readonly alertaRepository: IAlertaEmpleoRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: CrearAlertaEmpleoInputDto): Promise<{ idAlerta: number }> {
    const alerta = await this.alertaRepository.save(
      new AlertaEmpleo({
        id: 0,
        idCandidato: input.idCandidato,
        palabrasClave: input.palabrasClave,
        sectorEconomico: input.sectorEconomico,
        modalidad: input.modalidad,
        frecuencia: input.frecuencia,
        activa: true,
        fechaCreacion: new Date(),
      }),
    )

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'alerta_empleo_creada',
      modulo: 'postulacion',
      objetoAfectado: 'AlertaEmpleo',
      idObjetoAfectado: alerta.id,
      resultado: 'exitoso',
    })

    return { idAlerta: alerta.id }
  }
}

// ---------- Editar alerta ----------

export interface EditarAlertaEmpleoInputDto {
  idAlerta: number
  idCandidato: number
  palabrasClave?: string
  sectorEconomico?: string
  modalidad?: ModalidadTrabajo | 'todas'
  frecuencia?: FrecuenciaAlerta
}

export class EditarAlertaEmpleoUseCase {
  constructor(
    private readonly alertaRepository: IAlertaEmpleoRepository,
  ) {}

  async execute(input: EditarAlertaEmpleoInputDto): Promise<void> {
    const alerta = await this.alertaRepository.findById(input.idAlerta)
    if (!alerta) throw new EntityNotFoundError('AlertaEmpleo', input.idAlerta)

    if (alerta.idCandidato !== input.idCandidato) {
      throw new BusinessRuleViolationError('alerta', 'No tienes acceso a esta alerta')
    }

    alerta.editarCriterios({
      palabrasClave: input.palabrasClave,
      sectorEconomico: input.sectorEconomico,
      modalidad: input.modalidad,
      frecuencia: input.frecuencia,
    })

    await this.alertaRepository.update(alerta)
  }
}

// ---------- Desactivar alerta ----------

export class DesactivarAlertaEmpleoUseCase {
  constructor(
    private readonly alertaRepository: IAlertaEmpleoRepository,
  ) {}

  async execute(idAlerta: number, idCandidato: number): Promise<void> {
    const alerta = await this.alertaRepository.findById(idAlerta)
    if (!alerta) throw new EntityNotFoundError('AlertaEmpleo', idAlerta)

    if (alerta.idCandidato !== idCandidato) {
      throw new BusinessRuleViolationError('alerta', 'No tienes acceso a esta alerta')
    }

    alerta.desactivar()
    await this.alertaRepository.update(alerta)
  }
}
