import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { INotificationService } from '../../../ports/INotificationService'
import { IVacanteRepository } from '../../../../domain/repositories/gestionVacante/VacanteRepositories'
import { BusinessRuleViolationError, EntityNotFoundError } from '../../../../domain/errors/DomainError'

// Interfaz simple de repositorio de reportes (se expande en infraestructura)
export interface IReporteContenidoRepository {
  save(reporte: ReporteContenidoData): Promise<ReporteContenidoData>
  findById(id: number): Promise<ReporteContenidoData | null>
  findPendientes(): Promise<ReporteContenidoData[]>
  update(reporte: ReporteContenidoData): Promise<void>
  countConfirmadosPorUsuario(idUsuario: number): Promise<number>
}

export interface ReporteContenidoData {
  id: number
  idUsuario: number
  idContenido: number
  tipoContenido: string
  motivo: string
  descripcion: string
  estado: 'pendiente' | 'cerrado'
  resultado?: 'desestimado' | 'contenido_retirado'
  fechaCreacion: Date
}

//  Registrar reporte 

export interface RegistrarReporteInputDto {
  idUsuario: number
  idContenido: number
  tipoContenido: string
  motivo: string
  descripcion: string
}

export class RegistrarReporteContenidoUseCase {
  // RN-66: 72 horas para atender un reporte
  constructor(
    private readonly reporteRepository: IReporteContenidoRepository,
    private readonly notificationService: INotificationService,
  ) {}

  async execute(input: RegistrarReporteInputDto): Promise<{ idReporte: number }> {
    if (!input.descripcion || input.descripcion.trim().length === 0) {
      throw new BusinessRuleViolationError(
        'reporte',
        'Describe brevemente el problema encontrado',
      )
    }

    const reporte = await this.reporteRepository.save({
      id: 0,
      idUsuario: input.idUsuario,
      idContenido: input.idContenido,
      tipoContenido: input.tipoContenido,
      motivo: input.motivo,
      descripcion: input.descripcion,
      estado: 'pendiente',
      fechaCreacion: new Date(),
    })

    // Notificar administrador
    await this.notificationService.notificar(
      0,   // idAdministrador
      'Nuevo reporte de contenido inapropiado',
      `Se recibió un reporte sobre ${input.tipoContenido} #${input.idContenido}`,
    )

    return { idReporte: reporte.id }
  }
}

//  Desestimar reporte 

export interface DesestimarReporteInputDto {
  idReporte: number
  idAdministrador: number
}

export class DesestimarReporteContenidoUseCase {
  constructor(
    private readonly reporteRepository: IReporteContenidoRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: DesestimarReporteInputDto): Promise<void> {
    const reporte = await this.reporteRepository.findById(input.idReporte)
    if (!reporte) throw new EntityNotFoundError('ReporteContenido', input.idReporte)

    reporte.estado = 'cerrado'
    reporte.resultado = 'desestimado'
    await this.reporteRepository.update(reporte)

    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: 'reporte_desestimado',
      modulo: 'administracion',
      objetoAfectado: 'ReporteContenido',
      idObjetoAfectado: input.idReporte,
      resultado: 'exitoso',
    })
  }
}

//  Retirar contenido reportado 

export interface RetirarContenidoInputDto {
  idReporte: number
  idContenido: number
  tipoContenido: 'vacante'
  idAdministrador: number
  idUsuarioPropietario: number
}

export class RetirarContenidoReportadoUseCase {
  constructor(
    private readonly reporteRepository: IReporteContenidoRepository,
    private readonly vacanteRepository: IVacanteRepository,
    private readonly notificationService: INotificationService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: RetirarContenidoInputDto): Promise<void> {
    const reporte = await this.reporteRepository.findById(input.idReporte)
    if (!reporte) throw new EntityNotFoundError('ReporteContenido', input.idReporte)

    // Retirar el contenido según su tipo
    if (input.tipoContenido === 'vacante') {
      const vacante = await this.vacanteRepository.findById(input.idContenido)
      if (!vacante) throw new EntityNotFoundError('Vacante', input.idContenido)
      vacante.cerrar()
      await this.vacanteRepository.update(vacante)
    }

    reporte.estado = 'cerrado'
    reporte.resultado = 'contenido_retirado'
    await this.reporteRepository.update(reporte)

    await this.notificationService.notificar(
      input.idUsuarioPropietario,
      'Contenido retirado',
      'Tu contenido fue retirado por incumplimiento de las políticas del portal.',
    )

    // RN-39: detectar patrón de comportamiento irregular
    const totalConfirmados = await this.reporteRepository.countConfirmadosPorUsuario(
      input.idUsuarioPropietario,
    )
    if (totalConfirmados >= 3) {
      await this.notificationService.notificar(
        0,   // idAdministrador
        'Usuario con múltiples reportes confirmados',
        `El usuario #${input.idUsuarioPropietario} acumula ${totalConfirmados} reportes confirmados.`,
      )
    }

    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: 'contenido_retirado',
      modulo: 'administracion',
      objetoAfectado: input.tipoContenido,
      idObjetoAfectado: input.idContenido,
      resultado: 'exitoso',
    })
  }
}
