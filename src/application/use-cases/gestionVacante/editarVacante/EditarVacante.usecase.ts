import { IVacanteRepository, IAjusteRazonableDisponibleRepository } from '../../../../domain/repositories/gestionVacante/VacanteRepositories'
import { ITipoDiscapacidadRepository } from '../../../../domain/repositories/gestionPerfil/PerfilRepositories'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { AjusteRazonableDisponible } from '../../../../domain/entities/gestionVacante/AjusteRazonableDisponible.entity'
import { ModalidadTrabajo } from '../../../../domain/enums/VacanteEnums.enum'
import { TipoAjusteRazonable } from '../../../../domain/enums/PerfilEnums.enum'
import { EntityNotFoundError, BusinessRuleViolationError } from '../../../../domain/errors/DomainError'

export interface EditarVacanteInputDto {
  idVacante: number
  idEmpresa: number
  idUsuario: number
  titulo?: string
  descripcion?: string
  requisitos?: string
  categoriaLaboral?: string
  sectorEconomico?: string
  modalidad?: ModalidadTrabajo
  remuneracion?: number
  ubicacion?: string
  fechaCierre?: string
  idsTiposDiscapacidad?: number[]
  ajustesDisponibles?: { descripcion: string; tipo: TipoAjusteRazonable }[]
}

export class EditarVacanteUseCase {
  constructor(
    private readonly vacanteRepository: IVacanteRepository,
    private readonly ajusteDisponibleRepository: IAjusteRazonableDisponibleRepository,
    private readonly tipoDiscapacidadRepository: ITipoDiscapacidadRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: EditarVacanteInputDto): Promise<void> {
    const vacante = await this.vacanteRepository.findById(input.idVacante)
    if (!vacante) throw new EntityNotFoundError('Vacante', input.idVacante)

    // Validar que la vacante pertenece a la empresa
    if (vacante.getIdEmpresa() !== input.idEmpresa) {
      throw new BusinessRuleViolationError('vacante', 'No tienes acceso a esta vacante')
    }

    // Editar vacante 
    vacante.editar({
      titulo: input.titulo,
      descripcion: input.descripcion,
      requisitos: input.requisitos,
      categoriaLaboral: input.categoriaLaboral,
      sectorEconomico: input.sectorEconomico,
      modalidad: input.modalidad,
      remuneracion: input.remuneracion,
      ubicacion: input.ubicacion,
      fechaCierre: input.fechaCierre ? new Date(input.fechaCierre) : undefined,
    })

    await this.vacanteRepository.update(vacante)

    // Sincronizar tipos de discapacidad si se proporcionaron
    if (input.idsTiposDiscapacidad && input.idsTiposDiscapacidad.length > 0) {
      await this.vacanteRepository.syncDiscapacidades(input.idVacante, input.idsTiposDiscapacidad)
    }

    // Sincronizar ajustes disponibles si se proporcionaron
    if (input.ajustesDisponibles && input.ajustesDisponibles.length > 0) {
      await this.ajusteDisponibleRepository.deleteByIdVacante(input.idVacante)
      for (const ajuste of input.ajustesDisponibles) {
        await this.ajusteDisponibleRepository.save(
          new AjusteRazonableDisponible({
            id: 0,
            idVacante: input.idVacante,
            descripcion: ajuste.descripcion,
            tipo: ajuste.tipo,
            verificadoPorIntermediador: false,
          }),
        )
      }
    }

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'vacante_editada',
      modulo: 'vacante',
      objetoAfectado: 'Vacante',
      idObjetoAfectado: input.idVacante,
      resultado: 'exitoso',
    })
  }
}
