import { IVacanteRepository, IAjusteRazonableDisponibleRepository } from '../../../../domain/repositories/gestionVacante/VacanteRepositories'
import { ISancionEmpresaRepository } from '../../../../domain/repositories/gestionVacante/VacanteRepositories'
import { IPerfilEmpresaRepository } from '../../../../domain/repositories/gestionPerfil/PerfilRepositories'
import { ITipoDiscapacidadRepository } from '../../../../domain/repositories/gestionPerfil/PerfilRepositories'
import { INotificationService } from '../../../ports/INotificationService'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { Vacante, MAX_VACANTES_ACTIVAS_POR_EMPRESA } from '../../../../domain/entities/gestionVacante/Vacante.entity'
import { AjusteRazonableDisponible } from '../../../../domain/entities/gestionVacante/AjusteRazonableDisponible.entity'
import { EstadoVacante, ModalidadTrabajo } from '../../../../domain/enums/VacanteEnums.enum'
import { TipoAjusteRazonable } from '../../../../domain/enums/PerfilEnums.enum'
import { BusinessRuleViolationError, EntityNotFoundError } from '../../../../domain/errors/DomainError'

export interface AjusteDisponibleInputDto {
  descripcion: string
  tipo: TipoAjusteRazonable
}

export interface PublicarVacanteInputDto {
  idEmpresa: number
  idUsuario: number
  titulo: string
  descripcion: string
  requisitos?: string
  categoriaLaboral?: string
  sectorEconomico?: string
  modalidad: ModalidadTrabajo
  remuneracion?: number
  ubicacion?: string
  fechaCierre?: string
  idsTiposDiscapacidad: number[]
  ajustesDisponibles: AjusteDisponibleInputDto[]
}

export interface PublicarVacanteOutputDto {
  idVacante: number
  titulo: string
  estado: EstadoVacante
  mensaje: string
}

export class PublicarVacanteUseCase {
  constructor(
    private readonly vacanteRepository: IVacanteRepository,
    private readonly ajusteDisponibleRepository: IAjusteRazonableDisponibleRepository,
    private readonly sancionRepository: ISancionEmpresaRepository,
    private readonly perfilEmpresaRepository: IPerfilEmpresaRepository,
    private readonly tipoDiscapacidadRepository: ITipoDiscapacidadRepository,
    private readonly notificationService: INotificationService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: PublicarVacanteInputDto): Promise<PublicarVacanteOutputDto> {
    // RN-21: empresa con perfil activo
    const perfilEmpresa = await this.perfilEmpresaRepository.findByIdEmpresa(input.idEmpresa)
    if (!perfilEmpresa) {
      throw new BusinessRuleViolationError(
        'RN-21',
        'Completa el perfil de tu empresa antes de publicar vacantes',
      )
    }

    // RN-23: empresa sin sanciones activas
    const tieneSancion = await this.sancionRepository.tieneActivaSancion(input.idEmpresa)
    if (tieneSancion) {
      throw new BusinessRuleViolationError(
        'RN-23',
        'Tu empresa tiene una sanción activa que impide publicar vacantes',
      )
    }

    // RN-27: límite de vacantes activas
    const totalActivas = await this.vacanteRepository.countActivas(input.idEmpresa)
    if (totalActivas >= MAX_VACANTES_ACTIVAS_POR_EMPRESA) {
      throw new BusinessRuleViolationError(
        'RN-27',
        `Has alcanzado el límite de ${MAX_VACANTES_ACTIVAS_POR_EMPRESA} vacantes activas`,
      )
    }

    // RN-22: al menos un tipo de discapacidad compatible
    if (!input.idsTiposDiscapacidad || input.idsTiposDiscapacidad.length === 0) {
      throw new BusinessRuleViolationError(
        'RN-22',
        'Debe indicar al menos un tipo de discapacidad compatible',
      )
    }

    // RN-22: al menos un ajuste razonable disponible
    if (!input.ajustesDisponibles || input.ajustesDisponibles.length === 0) {
      throw new BusinessRuleViolationError(
        'RN-22',
        'Debe especificar al menos un ajuste razonable disponible',
      )
    }

    // Validar tipos de discapacidad
    const tiposValidos = await this.tipoDiscapacidadRepository.findByIds(input.idsTiposDiscapacidad)
    if (tiposValidos.length !== input.idsTiposDiscapacidad.length) {
      throw new EntityNotFoundError('TipoDiscapacidad', 'uno o más tipos no válidos')
    }

    // Crear y publicar vacante
    const vacante = new Vacante({
      id: 0,
      idEmpresa: input.idEmpresa,
      titulo: input.titulo,
      descripcion: input.descripcion,
      requisitos: input.requisitos,
      categoriaLaboral: input.categoriaLaboral,
      sectorEconomico: input.sectorEconomico,
      modalidad: input.modalidad,
      remuneracion: input.remuneracion,
      ubicacion: input.ubicacion,
      fechaCierre: input.fechaCierre ? new Date(input.fechaCierre) : undefined,
      estado: EstadoVacante.BORRADOR,
    })

    vacante.publicar()
    const vacanteGuardada = await this.vacanteRepository.save(vacante)

    // Asociar tipos de discapacidad
    await this.vacanteRepository.syncDiscapacidades(
      vacanteGuardada.id,
      input.idsTiposDiscapacidad,
    )

    // Guardar ajustes disponibles
    for (const ajuste of input.ajustesDisponibles) {
      await this.ajusteDisponibleRepository.save(
        new AjusteRazonableDisponible({
          id: 0,
          idVacante: vacanteGuardada.id,
          descripcion: ajuste.descripcion,
          tipo: ajuste.tipo,
          verificadoPorIntermediador: false,
        }),
      )
    }

    // Notificar administrador para revisión (RN-24: 48 horas)
    await this.notificationService.notificar(
      0,   // idAdministrador — en producción se obtiene del repositorio
      'Nueva vacante pendiente de aprobación',
      `La empresa ha publicado una nueva vacante: "${vacanteGuardada.getTitulo()}"`,
    )

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'vacante_publicada',
      modulo: 'vacante',
      objetoAfectado: 'Vacante',
      idObjetoAfectado: vacanteGuardada.id,
      resultado: 'exitoso',
    })

    return {
      idVacante: vacanteGuardada.id,
      titulo: vacanteGuardada.getTitulo(),
      estado: vacanteGuardada.getEstado(),
      mensaje: 'Vacante enviada para revisión. Será publicada una vez aprobada por el administrador.',
    }
  }
}
