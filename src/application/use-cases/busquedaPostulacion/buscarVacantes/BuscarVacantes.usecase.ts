import { IVacanteRepository, FiltrosVacante } from '@domain/repositories/gestionVacante/VacanteRepositories'
import { IVacanteGuardadaRepository } from '@domain/repositories/busquedaPostulacion/PostulacionRepositories'
import { IPerfilCandidatoRepository } from '@domain/repositories/gestionPerfil/IPerfilCandidatoRepository'
import { ITipoDiscapacidadRepository } from '@domain/repositories/gestionPerfil/PerfilRepositories'
import { IPostulacionRepository } from '@domain/repositories/busquedaPostulacion/PostulacionRepositories'
import { VacanteGuardada, MAX_FAVORITOS_POR_CANDIDATO } from '@domain/entities/busquedaPostulacion/PostulacionEntities.entity'
import { ModalidadTrabajo } from '@domain/enums/VacanteEnums.enum'
import { BusinessRuleViolationError, EntityNotFoundError, DuplicateEntityError } from '@domain/errors/DomainError'

// ---------- Buscar vacantes ----------

export interface BuscarVacantesInputDto {
  idCandidato: number
  palabrasClave?: string
  sector?: string
  modalidad?: ModalidadTrabajo
  ubicacion?: string
  remuneracionMinima?: number
  page?: number
  limit?: number
}

export interface VacanteResumenOutputDto {
  idVacante: number
  titulo: string
  idEmpresa: number
  sector?: string
  modalidad: string
  ubicacion?: string
  remuneracion?: number
  fechaPublicacion?: Date
  fechaCierre?: Date
  puntuacionCompatibilidad?: number
  yaPostulo: boolean
  esFavorita: boolean
}

export interface BuscarVacantesOutputDto {
  vacantes: VacanteResumenOutputDto[]
  total: number
  page: number
  limit: number
  totalPages: number
  criteriosAmpliados: boolean
}

export class BuscarVacantesUseCase {
  constructor(
    private readonly vacanteRepository: IVacanteRepository,
    private readonly vacanteGuardadaRepository: IVacanteGuardadaRepository,
    private readonly perfilRepository: IPerfilCandidatoRepository,
    private readonly tipoDiscapacidadRepository: ITipoDiscapacidadRepository,
  ) {}

  async execute(input: BuscarVacantesInputDto): Promise<BuscarVacantesOutputDto> {
    const page = input.page ?? 1
    const limit = input.limit ?? 20

    // Obtener tipos de discapacidad del candidato para filtrar compatibles
    const perfil = await this.perfilRepository.findByIdCandidato(input.idCandidato)
    const idsTiposDiscapacidad = perfil
      ? (await this.tipoDiscapacidadRepository.findByIdPerfil(perfil.id)).map(t => t.id)
      : []

    const filtros: FiltrosVacante = {
      estado: undefined,   // Solo APROBADA, manejado en repositorio
      modalidad: input.modalidad,
      sector: input.sector,
      idsTiposDiscapacidad,   // RN-31: solo vacantes compatibles
      palabrasClave: input.palabrasClave,
      ubicacion: input.ubicacion,
      page,
      limit,
    }

    let { vacantes, total } = await this.vacanteRepository.findAll(filtros)
    let criteriosAmpliados = false

    // Si no hay resultados, ampliar búsqueda sin filtro de palabras clave
    if (vacantes.length === 0 && input.palabrasClave) {
      const resultado = await this.vacanteRepository.findAll({
        ...filtros,
        palabrasClave: undefined,
      })
      vacantes = resultado.vacantes
      total = resultado.total
      criteriosAmpliados = true
    }

    // Obtener favoritas del candidato
    const favoritas = await this.vacanteGuardadaRepository.findByIdCandidato(input.idCandidato)
    const idsFavoritas = new Set(favoritas.map(f => f.idVacante))

    const resultado: VacanteResumenOutputDto[] = vacantes.map(v => ({
      idVacante: v.id,
      titulo: v.getTitulo(),
      idEmpresa: v.getIdEmpresa(),
      sector: v.getSectorEconomico(),
      modalidad: v.getModalidad(),
      ubicacion: v.getUbicacion(),
      remuneracion: v.getRemuneracion(),
      fechaPublicacion: v.getFechaPublicacion(),
      fechaCierre: v.getFechaCierre(),
      yaPostulo: false,   
      esFavorita: idsFavoritas.has(v.id),
    }))

    return {
      vacantes: resultado,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      criteriosAmpliados,
    }
  }
}

// ---------- Obtener detalle de vacante ----------

export interface ObtenerDetalleVacanteOutputDto {
  idVacante: number
  titulo: string
  descripcion: string
  requisitos?: string
  categoriaLaboral?: string
  sectorEconomico?: string
  modalidad: string
  remuneracion?: number
  ubicacion?: string
  fechaPublicacion?: Date
  fechaCierre?: Date
  ajustesDisponibles: { tipo: string; descripcion: string; verificado: boolean }[]
  tiposDiscapacidadCompatibles: { id: number; nombre: string; categoria: string }[]
  yaPostulo: boolean
  esFavorita: boolean
}

export class ObtenerDetalleVacanteUseCase {
  constructor(
    private readonly vacanteRepository: IVacanteRepository,
    private readonly vacanteGuardadaRepository: IVacanteGuardadaRepository,
    private readonly postulacionRepository: IPostulacionRepository,
    private readonly tipoDiscapacidadRepository: ITipoDiscapacidadRepository,
  ) {}

  async execute(idVacante: number, idCandidato: number): Promise<ObtenerDetalleVacanteOutputDto> {
    const vacante = await this.vacanteRepository.findById(idVacante)
    if (!vacante) throw new EntityNotFoundError('Vacante', idVacante)

    const yaPostulo = await this.postulacionRepository.existsByIdCandidatoAndIdVacante(
      idCandidato,
      idVacante,
    )

    const esFavorita = await this.vacanteGuardadaRepository.existsByIdCandidatoAndIdVacante(
      idCandidato,
      idVacante,
    )

    return {
      idVacante: vacante.id,
      titulo: vacante.getTitulo(),
      descripcion: vacante.getDescripcion(),
      requisitos: vacante.getRequisitos(),
      categoriaLaboral: vacante.getCategoriaLaboral(),
      sectorEconomico: vacante.getSectorEconomico(),
      modalidad: vacante.getModalidad(),
      remuneracion: vacante.getRemuneracion(),
      ubicacion: vacante.getUbicacion(),
      fechaPublicacion: vacante.getFechaPublicacion(),
      fechaCierre: vacante.getFechaCierre(),
      ajustesDisponibles: [],  
      tiposDiscapacidadCompatibles: [],
      yaPostulo,
      esFavorita,
    }
  }
}
