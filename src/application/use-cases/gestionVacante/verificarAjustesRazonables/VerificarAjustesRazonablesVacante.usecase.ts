import { IVacanteRepository, IAjusteRazonableDisponibleRepository } from '../../../../domain/repositories/gestionVacante/VacanteRepositories'
import { IPerfilCandidatoRepository } from '../../../../domain/repositories/gestionPerfil/IPerfilCandidatoRepository'
import { IAjusteRazonableRequeridoRepository } from '../../../../domain/repositories/gestionPerfil/PerfilRepositories'
import { INotificationService } from '../../../ports/INotificationService'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { EntityNotFoundError } from '../../../../domain/errors/DomainError'

export interface VerificarAjustesInputDto {
  idVacante: number
  idCandidato: number
  idIntermediador: number
  idUsuarioIntermediador: number
  idsAjustesVerificados: number[]
  idUsuarioEmpresa: number
}

export interface VerificarAjustesOutputDto {
  ajustesVerificados: number
  brechasDetectadas: string[]
  todosVerificados: boolean
}

export class VerificarAjustesRazonablesVacanteUseCase {
  constructor(
    private readonly vacanteRepository: IVacanteRepository,
    private readonly ajusteDisponibleRepository: IAjusteRazonableDisponibleRepository,
    private readonly perfilRepository: IPerfilCandidatoRepository,
    private readonly ajusteRequeridoRepository: IAjusteRazonableRequeridoRepository,
    private readonly notificationService: INotificationService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: VerificarAjustesInputDto): Promise<VerificarAjustesOutputDto> {
    const vacante = await this.vacanteRepository.findById(input.idVacante)
    if (!vacante) throw new EntityNotFoundError('Vacante', input.idVacante)

    const perfil = await this.perfilRepository.findByIdCandidato(input.idCandidato)
    if (!perfil) throw new EntityNotFoundError('PerfilCandidato', input.idCandidato)

    const ajustesDisponibles = await this.ajusteDisponibleRepository.findByIdVacante(input.idVacante)
    const ajustesRequeridos = await this.ajusteRequeridoRepository.findByIdPerfil(perfil.id)

    // Detectar brechas entre ajustes requeridos y disponibles
    const brechasDetectadas: string[] = []
    for (const requerido of ajustesRequeridos) {
      const cubierto = ajustesDisponibles.some(d => d.getTipo() === requerido.getTipo())
      if (!cubierto && requerido.isEsencial()) {
        brechasDetectadas.push(
          `Ajuste esencial "${requerido.getDescripcion()}" no cubierto por la vacante`,
        )
      }
    }

    // Marcar los ajustes verificados por el intermediador
    let verificados = 0
    for (const ajuste of ajustesDisponibles) {
      if (input.idsAjustesVerificados.includes(ajuste.id)) {
        ajuste.marcarVerificado()
        await this.ajusteDisponibleRepository.update(ajuste)
        verificados++
      }
    }

    const todosVerificados = verificados === ajustesDisponibles.length

    // Notificar empresa
    await this.notificationService.notificar(
      input.idUsuarioEmpresa,
      'Ajustes razonables verificados',
      `Un intermediador verificó los ajustes razonables de tu vacante "${vacante.getTitulo()}"`,
    )

    await this.auditLogger.log({
      idUsuario: input.idUsuarioIntermediador,
      accion: 'ajustes_razonables_verificados',
      modulo: 'vacante',
      objetoAfectado: 'Vacante',
      idObjetoAfectado: input.idVacante,
      resultado: 'exitoso',
    })

    return {
      ajustesVerificados: verificados,
      brechasDetectadas,
      todosVerificados,
    }
  }
}
