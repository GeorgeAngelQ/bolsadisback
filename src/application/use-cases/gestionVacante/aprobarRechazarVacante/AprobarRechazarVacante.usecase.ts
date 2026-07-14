import { IVacanteRepository } from '../../../../domain/repositories/gestionVacante/VacanteRepositories'
import { INotificationService } from '../../../ports/INotificationService'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { EntityNotFoundError } from '../../../../domain/errors/DomainError'
import { EstadoVacante } from '../../../../domain/enums/VacanteEnums.enum'

//  Aprobar vacante 

export interface AprobarVacanteInputDto {
  idVacante: number
  idAdministrador: number
  idUsuarioEmpresa: number
}

export class AprobarVacanteUseCase {
  constructor(
    private readonly vacanteRepository: IVacanteRepository,
    private readonly notificationService: INotificationService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: AprobarVacanteInputDto): Promise<void> {
    const vacante = await this.vacanteRepository.findById(input.idVacante)
    if (!vacante) throw new EntityNotFoundError('Vacante', input.idVacante)

    // Regla de negocio en la entidad (estado debe ser PENDIENTE)
    vacante.aprobar(input.idAdministrador)
    await this.vacanteRepository.update(vacante)

    // Notificar empresa
    await this.notificationService.notificar(
      input.idUsuarioEmpresa,
      'Vacante aprobada',
      `Tu vacante "${vacante.getTitulo()}" fue aprobada y está disponible en el portal.`,
    )

    // RN-24: notificar candidatos con alertas compatibles
    const candidatosConAlerta = await this.vacanteRepository.findCompatiblesConAlerta(input.idVacante)
    if (candidatosConAlerta.length > 0) {
      await this.notificationService.notificarMasivo(
        candidatosConAlerta,
        'Nueva vacante compatible con tu perfil',
        `Se publicó una nueva vacante que podría interesarte: "${vacante.getTitulo()}"`,
      )
    }

    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: 'vacante_aprobada',
      modulo: 'administracion',
      objetoAfectado: 'Vacante',
      idObjetoAfectado: input.idVacante,
      resultado: 'exitoso',
    })
  }
}

//  Rechazar vacante 

export interface RechazarVacanteInputDto {
  idVacante: number
  idAdministrador: number
  idUsuarioEmpresa: number
  motivoRechazo: string
}

export class RechazarVacanteUseCase {
  constructor(
    private readonly vacanteRepository: IVacanteRepository,
    private readonly notificationService: INotificationService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: RechazarVacanteInputDto): Promise<void> {
    const vacante = await this.vacanteRepository.findById(input.idVacante)
    if (!vacante) throw new EntityNotFoundError('Vacante', input.idVacante)

    // RN-25: motivo obligatorio — validado en la entidad
    vacante.rechazar(input.idAdministrador, input.motivoRechazo)
    await this.vacanteRepository.update(vacante)

    await this.notificationService.notificar(
      input.idUsuarioEmpresa,
      'Vacante rechazada',
      `Tu vacante fue rechazada. Motivo: ${input.motivoRechazo}. Puedes corregirla y volver a publicarla.`,
    )

    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: 'vacante_rechazada',
      modulo: 'administracion',
      objetoAfectado: 'Vacante',
      idObjetoAfectado: input.idVacante,
      resultado: 'exitoso',
      detalle: input.motivoRechazo,
    })
  }
}

//  Listar vacantes pendientes 

export interface VacantePendienteOutputDto {
  idVacante: number
  titulo: string
  idEmpresa: number
  fechaPublicacion?: Date
  horasTranscurridas: number
  superaPlazo: boolean
}

export class ListarVacantesPendientesUseCase {
  // RN-24: plazo máximo de 48 horas para revisar
  private static readonly HORAS_PLAZO_REVISION = 48

  constructor(
    private readonly vacanteRepository: IVacanteRepository,
  ) {}

  async execute(): Promise<VacantePendienteOutputDto[]> {
    const pendientes = await this.vacanteRepository.findPendientes()
    const ahora = new Date()

    return pendientes.map(v => {
      const horasTranscurridas = v.getFechaPublicacion()
        ? Math.floor(
          (ahora.getTime() - v.getFechaPublicacion()!.getTime()) / (1000 * 60 * 60),
        )
        : 0

      return {
        idVacante: v.id,
        titulo: v.getTitulo(),
        idEmpresa: v.getIdEmpresa(),
        fechaPublicacion: v.getFechaPublicacion(),
        horasTranscurridas,
        superaPlazo: horasTranscurridas >= ListarVacantesPendientesUseCase.HORAS_PLAZO_REVISION,
      }
    })
  }
}
