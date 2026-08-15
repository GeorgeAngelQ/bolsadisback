import { IVacanteGuardadaRepository } from '@domain/repositories/busquedaPostulacion/PostulacionRepositories'
import { IVacanteRepository } from '@domain/repositories/gestionVacante/VacanteRepositories'
import { VacanteGuardada, MAX_FAVORITOS_POR_CANDIDATO } from '@domain/entities/busquedaPostulacion/PostulacionEntities.entity'
import { BusinessRuleViolationError, EntityNotFoundError, DuplicateEntityError } from '@domain/errors/DomainError'

// ---------- Guardar vacante favorita ----------

export class GuardarVacanteFavoritaUseCase {
  constructor(
    private readonly vacanteGuardadaRepository: IVacanteGuardadaRepository,
    private readonly vacanteRepository: IVacanteRepository,
  ) {}

  async execute(idCandidato: number, idVacante: number): Promise<void> {
    const vacante = await this.vacanteRepository.findById(idVacante)
    if (!vacante) throw new EntityNotFoundError('Vacante', idVacante)

    const yaGuardada = await this.vacanteGuardadaRepository.existsByIdCandidatoAndIdVacante(
      idCandidato,
      idVacante,
    )
    if (yaGuardada) throw new DuplicateEntityError('VacanteGuardada', 'candidato-vacante')

    // RN-36: máximo 20 favoritas
    const total = await this.vacanteGuardadaRepository.countByIdCandidato(idCandidato)
    if (total >= MAX_FAVORITOS_POR_CANDIDATO) {
      throw new BusinessRuleViolationError(
        'RN-36',
        `Has alcanzado el límite de ${MAX_FAVORITOS_POR_CANDIDATO} vacantes guardadas`,
      )
    }

    await this.vacanteGuardadaRepository.save(
      new VacanteGuardada({
        id: 0,
        idCandidato,
        idVacante,
        fechaGuardado: new Date(),
      }),
    )
  }
}

// ---------- Eliminar vacante favorita ----------

export class EliminarVacanteFavoritaUseCase {
  constructor(
    private readonly vacanteGuardadaRepository: IVacanteGuardadaRepository,
  ) {}

  async execute(idCandidato: number, idVacante: number): Promise<void> {
    const existe = await this.vacanteGuardadaRepository.existsByIdCandidatoAndIdVacante(
      idCandidato,
      idVacante,
    )
    if (!existe) throw new EntityNotFoundError('VacanteGuardada', idVacante)

    await this.vacanteGuardadaRepository.deleteByIdCandidatoAndIdVacante(idCandidato, idVacante)
  }
}
