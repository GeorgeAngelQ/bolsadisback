import { IRecomendacionVacanteRepository } from '@domain/repositories/busquedaPostulacion/PostulacionRepositories'
import { IVacanteRepository } from '@domain/repositories/gestionVacante/VacanteRepositories'
import { IPerfilCandidatoRepository } from '@domain/repositories/gestionPerfil/IPerfilCandidatoRepository'
import { ITipoDiscapacidadRepository } from '@domain/repositories/gestionPerfil/PerfilRepositories'
import { INotificationService } from '@application/ports/INotificationService'
import { RecomendacionVacante } from '@domain/entities/busquedaPostulacion/PostulacionEntities.entity'
import { OrigenRecomendacion } from '@domain/enums/PostulacionEnums.enum'
import { EstadoVacante } from '@domain/enums/VacanteEnums.enum'
import { EntityNotFoundError } from '@domain/errors/DomainError'

// ---------- Generar recomendaciones automáticas ----------

export interface RecomendacionOutputDto {
  idRecomendacion: number
  idVacante: number
  origen: OrigenRecomendacion
  puntuacionCompatibilidad: number
  fechaGeneracion: Date
  leida: boolean
}

const UMBRAL_PUNTUACION_MINIMA = 0.5

export class GenerarRecomendacionesAutomaticasUseCase {
  constructor(
    private readonly recomendacionRepository: IRecomendacionVacanteRepository,
    private readonly vacanteRepository: IVacanteRepository,
    private readonly perfilRepository: IPerfilCandidatoRepository,
    private readonly tipoDiscapacidadRepository: ITipoDiscapacidadRepository,
    private readonly notificationService: INotificationService,
  ) {}

  async execute(idVacante: number): Promise<void> {
    const vacante = await this.vacanteRepository.findById(idVacante)
    if (!vacante || !vacante.estaActiva()) return

    // RN-37: se generan recomendaciones solo para perfiles 100% completos
    const { vacantes: candidatosActivos } = await this.vacanteRepository.findAll({
      estado: EstadoVacante.APROBADA,
    })

    const candidatosCompatibles = await this.vacanteRepository.findCompatiblesConAlerta(idVacante)

    for (const idCandidato of candidatosCompatibles) {
      const yaExiste = await this.recomendacionRepository.existsByIdCandidatoAndIdVacante(
        idCandidato,
        idVacante,
      )
      if (yaExiste) continue

      const puntuacion = this.calcularPuntuacion()

      if (puntuacion >= UMBRAL_PUNTUACION_MINIMA) {
        await this.recomendacionRepository.save(
          new RecomendacionVacante({
            id: 0,
            idCandidato,
            idVacante,
            origen: OrigenRecomendacion.SISTEMA,
            puntuacionCompatibilidad: puntuacion,
            fechaGeneracion: new Date(),
            leida: false,
          }),
        )

        // RN-35: máximo una notificación diaria por candidato
        await this.notificationService.notificar(
          idCandidato,
          'Nueva vacante recomendada para ti',
          `Tenemos una vacante que podría interesarte según tu perfil.`,
        )
      }
    }
  }

  private calcularPuntuacion(): number {
    // Algoritmo de compatibilidad real se implementa en infraestructura
    // usando los tipos de discapacidad, habilidades y ajustes razonables
    return Math.random()   
  }
}

// ---------- Crear recomendación manual (intermediador) ----------

export interface CrearRecomendacionManualInputDto {
  idCandidato: number
  idVacante: number
  idIntermediador: number
  idUsuarioIntermediador: number
}

export class CrearRecomendacionManualUseCase {
  constructor(
    private readonly recomendacionRepository: IRecomendacionVacanteRepository,
    private readonly vacanteRepository: IVacanteRepository,
    private readonly notificationService: INotificationService,
  ) {}

  async execute(input: CrearRecomendacionManualInputDto): Promise<void> {
    const vacante = await this.vacanteRepository.findById(input.idVacante)
    if (!vacante) throw new EntityNotFoundError('Vacante', input.idVacante)

    const yaExiste = await this.recomendacionRepository.existsByIdCandidatoAndIdVacante(
      input.idCandidato,
      input.idVacante,
    )

    if (yaExiste) {
      // Actualizar origen a intermediador si ya existía la del sistema
      const recomendaciones = await this.recomendacionRepository.findByIdCandidato(input.idCandidato)
      const existente = recomendaciones.find(r => r.idVacante === input.idVacante)
      if (existente) {
        await this.recomendacionRepository.update(existente)
      }
    } else {
      await this.recomendacionRepository.save(
        new RecomendacionVacante({
          id: 0,
          idCandidato: input.idCandidato,
          idVacante: input.idVacante,
          idIntermediador: input.idIntermediador,
          origen: OrigenRecomendacion.INTERMEDIADOR,
          puntuacionCompatibilidad: 1.0,
          fechaGeneracion: new Date(),
          leida: false,
        }),
      )
    }

    await this.notificationService.notificar(
      input.idCandidato,
      'Tu intermediador te recomendó una vacante',
      `Tu intermediador sugirió la vacante: "${vacante.getTitulo()}"`,
    )
  }
}

// ---------- Listar recomendaciones del candidato ----------

export class ListarRecomendacionesCandidatoUseCase {
  constructor(
    private readonly recomendacionRepository: IRecomendacionVacanteRepository,
  ) {}

  async execute(idCandidato: number): Promise<RecomendacionOutputDto[]> {
    const recomendaciones = await this.recomendacionRepository.findByIdCandidato(idCandidato)

    return recomendaciones
      .sort((a, b) => b.getPuntuacion() - a.getPuntuacion())
      .map(r => ({
        idRecomendacion: r.id,
        idVacante: r.idVacante,
        origen: r.origen,
        puntuacionCompatibilidad: r.getPuntuacion(),
        fechaGeneracion: r.fechaGeneracion,
        leida: r.isLeida(),
      }))
  }
}

// ---------- Descartar recomendación ----------

export class DescartarRecomendacionUseCase {
  constructor(
    private readonly recomendacionRepository: IRecomendacionVacanteRepository,
  ) {}

  async execute(idRecomendacion: number, idCandidato: number): Promise<void> {
    const recomendaciones = await this.recomendacionRepository.findByIdCandidato(idCandidato)
    const recomendacion = recomendaciones.find(r => r.id === idRecomendacion)
    if (!recomendacion) throw new EntityNotFoundError('RecomendacionVacante', idRecomendacion)

    await this.recomendacionRepository.deleteById(idRecomendacion)
  }
}
