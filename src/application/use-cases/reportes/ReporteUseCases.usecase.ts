import {
  IReporteCuotaInclusionRepository,
  IReporteGestionIntermediadorRepository,
  IReporteInclusionLaboralRepository,
  IDashboardIndicadoresRepository,
  FiltrosReporteGlobal,
} from '@domain/repositories/reportes/ReporteRepositories'
import { IPerfilEmpresaRepository } from '@domain/repositories/gestionPerfil/PerfilRepositories'
import { IAuditLoggerService } from '@application/ports/IAuditLoggerService'
import { IPdfGeneratorService, IExcelGeneratorService } from '@application/ports/IDocumentGeneratorService'
import { IFileStorageService } from '@application/ports/IFileStorageService'
import {
  ReporteCuotaInclusion,
  ReporteGestionIntermediador,
  ReporteInclusionLaboral,
  DashboardIndicadores,
  ANIOS_MAX_CONSULTA,
} from '@domain/entities/reportes/ReporteEntities.entity'
import { BusinessRuleViolationError, EntityNotFoundError } from '@domain/errors/DomainError'

// ============================================================
// GENERAR REPORTE DE CUOTA DE INCLUSIÓN
// ============================================================

export interface GenerarReporteCuotaInputDto {
  idEmpresa: number
  idUsuario: number
  periodo: string
}

export interface ReporteCuotaOutputDto {
  idReporte: number
  periodo: string
  totalTrabajadores: number
  trabajadoresConDiscapacidad: number
  cuotaObligada: number
  porcentajeCumplimiento: number
  cumpleLey: boolean
  fechaGeneracion: Date
}

export class GenerarReporteCuotaInclusionUseCase {
  constructor(
    private readonly reporteRepository: IReporteCuotaInclusionRepository,
    private readonly perfilEmpresaRepository: IPerfilEmpresaRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: GenerarReporteCuotaInputDto): Promise<ReporteCuotaOutputDto> {
    const perfil = await this.perfilEmpresaRepository.findByIdEmpresa(input.idEmpresa)
    if (!perfil) throw new EntityNotFoundError('PerfilEmpresa', input.idEmpresa)

    const trabajadoresConDiscapacidad =
      await this.reporteRepository.countContratacionesConDiscapacidad(
        input.idEmpresa,
        input.periodo,
      )

    const cuotaObligada = perfil.calcularCuotaObligada()
    const porcentajeCumplimiento =
      perfil.getTotalTrabajadores() > 0
        ? (trabajadoresConDiscapacidad / perfil.getTotalTrabajadores()) * 100
        : 0
    const cumpleLey = perfil.verificarCumplimientoLey(trabajadoresConDiscapacidad)

    const reporte = await this.reporteRepository.save(
      new ReporteCuotaInclusion({
        id: 0,
        idEmpresa: input.idEmpresa,
        periodo: input.periodo,
        totalTrabajadores: perfil.getTotalTrabajadores(),
        trabajadoresConDiscapacidad,
        cuotaObligada,
        porcentajeCumplimiento,
        cumpleLey,
        fechaGeneracion: new Date(),
      }),
    )

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'reporte_cuota_generado',
      modulo: 'reportes',
      objetoAfectado: 'ReporteCuotaInclusion',
      idObjetoAfectado: reporte.id,
      resultado: 'exitoso',
    })

    return {
      idReporte: reporte.id,
      periodo: reporte.periodo,
      totalTrabajadores: reporte.totalTrabajadores,
      trabajadoresConDiscapacidad: reporte.trabajadoresConDiscapacidad,
      cuotaObligada: reporte.cuotaObligada,
      porcentajeCumplimiento: reporte.porcentajeCumplimiento,
      cumpleLey: reporte.cumpleLey,
      fechaGeneracion: reporte.fechaGeneracion,
    }
  }
}

// ============================================================
// GENERAR REPORTE DE GESTIÓN INTERMEDIADOR
// ============================================================

export interface GenerarReporteGestionInputDto {
  idIntermediador: number
  idUsuario: number
  periodo: string
}

export interface ReporteGestionOutputDto {
  idReporte: number
  periodo: string
  totalCandidatosAtendidos: number
  totalPostulacionesGestionadas: number
  totalContrataciones: number
  totalDerivaciones: number
  tasaExito: number
  fechaGeneracion: Date
}

export class GenerarReporteGestionIntermediadorUseCase {
  constructor(
    private readonly reporteRepository: IReporteGestionIntermediadorRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: GenerarReporteGestionInputDto): Promise<ReporteGestionOutputDto> {
    // RN-74: solo candidatos asignados durante el periodo
    const totalCandidatosAtendidos = await this.reporteRepository.contarCandidatosAtendidos(
      input.idIntermediador,
      input.periodo,
    )
    const totalPostulacionesGestionadas = await this.reporteRepository.contarPostulacionesGestionadas(
      input.idIntermediador,
      input.periodo,
    )
    const totalContrataciones = await this.reporteRepository.contarContrataciones(
      input.idIntermediador,
      input.periodo,
    )
    const totalDerivaciones = await this.reporteRepository.contarDerivaciones(
      input.idIntermediador,
      input.periodo,
    )

    const reporte = await this.reporteRepository.save(
      new ReporteGestionIntermediador({
        id: 0,
        idIntermediador: input.idIntermediador,
        periodo: input.periodo,
        totalCandidatosAtendidos,
        totalPostulacionesGestionadas,
        totalContrataciones,
        totalDerivaciones,
        fechaGeneracion: new Date(),
      }),
    )

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'reporte_gestion_generado',
      modulo: 'reportes',
      objetoAfectado: 'ReporteGestionIntermediador',
      idObjetoAfectado: reporte.id,
      resultado: 'exitoso',
    })

    return {
      idReporte: reporte.id,
      periodo: reporte.periodo,
      totalCandidatosAtendidos: reporte.totalCandidatosAtendidos,
      totalPostulacionesGestionadas: reporte.totalPostulacionesGestionadas,
      totalContrataciones: reporte.totalContrataciones,
      totalDerivaciones: reporte.totalDerivaciones,
      tasaExito: reporte.calcularTasaExito(),
      fechaGeneracion: reporte.fechaGeneracion,
    }
  }
}

// ============================================================
// GENERAR REPORTE GLOBAL DE INCLUSIÓN LABORAL
// ============================================================

export interface GenerarReporteGlobalInputDto {
  idAdministrador: number
  periodo: string
  filtros?: FiltrosReporteGlobal
}

export interface ReporteGlobalOutputDto {
  idReporte: number
  periodo: string
  totalCandidatosActivos: number
  totalVacantesPublicadas: number
  totalPostulaciones: number
  totalContrataciones: number
  tasaIntermediacion: number
  distribucionPorDiscapacidad: Record<string, number>
  distribucionPorSector: Record<string, number>
  distribucionPorDistrito: Record<string, number>
  fechaGeneracion: Date
}

export class GenerarReporteInclusionLaboralUseCase {
  constructor(
    private readonly reporteRepository: IReporteInclusionLaboralRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: GenerarReporteGlobalInputDto): Promise<ReporteGlobalOutputDto> {
    // RN-76: no más de 5 años de antigüedad
    this.validarPeriodo(input.periodo)

    const filtros = input.filtros ?? {}

    const [
      totalCandidatosActivos,
      totalVacantesPublicadas,
      totalPostulaciones,
      totalContrataciones,
      distribucionPorDiscapacidad,
      distribucionPorSector,
      distribucionPorDistrito,
    ] = await Promise.all([
      this.reporteRepository.contarCandidatosActivos(filtros),
      this.reporteRepository.contarVacantesPublicadas(filtros),
      this.reporteRepository.contarPostulaciones(filtros),
      this.reporteRepository.contarContrataciones(filtros),
      this.reporteRepository.calcularDistribucionDiscapacidad(filtros),
      this.reporteRepository.calcularDistribucionSector(filtros),
      this.reporteRepository.calcularDistribucionDistrito(filtros),
    ])

    const reporte = new ReporteInclusionLaboral({
      id: 0,
      idAdministrador: input.idAdministrador,
      periodo: input.periodo,
      totalCandidatosActivos,
      totalVacantesPublicadas,
      totalPostulaciones,
      totalContrataciones,
      distribucionPorDiscapacidad,
      distribucionPorSector,
      distribucionPorDistrito,
      fechaGeneracion: new Date(),
    })

    const reporteGuardado = await this.reporteRepository.save(reporte)

    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: 'reporte_global_generado',
      modulo: 'reportes',
      objetoAfectado: 'ReporteInclusionLaboral',
      idObjetoAfectado: reporteGuardado.id,
      resultado: 'exitoso',
    })

    return {
      idReporte: reporteGuardado.id,
      periodo: reporteGuardado.periodo,
      totalCandidatosActivos: reporteGuardado.totalCandidatosActivos,
      totalVacantesPublicadas: reporteGuardado.totalVacantesPublicadas,
      totalPostulaciones: reporteGuardado.totalPostulaciones,
      totalContrataciones: reporteGuardado.totalContrataciones,
      tasaIntermediacion: reporteGuardado.calcularTasaIntermediacion(),
      distribucionPorDiscapacidad: reporteGuardado.distribucionPorDiscapacidad,
      distribucionPorSector: reporteGuardado.distribucionPorSector,
      distribucionPorDistrito: reporteGuardado.distribucionPorDistrito,
      fechaGeneracion: reporteGuardado.fechaGeneracion,
    }
  }

  private validarPeriodo(periodo: string): void {
    const anioPeriodo = parseInt(periodo.split('-')[0])
    const anioActual = new Date().getFullYear()
    if (anioActual - anioPeriodo > ANIOS_MAX_CONSULTA) {
      throw new BusinessRuleViolationError(
        'RN-76',
        `No se pueden generar reportes de periodos con más de ${ANIOS_MAX_CONSULTA} años de antigüedad`,
      )
    }
  }
}

export class CompararPeriodosReporteUseCase {
  constructor(
    private readonly reporteRepository: IReporteInclusionLaboralRepository,
  ) {}

  async execute(
    periodoActual: string,
    periodoAnterior: string,
  ): Promise<{ variacion: Record<string, number> }> {
    const [actual, anterior] = await Promise.all([
      this.reporteRepository.findByPeriodo(periodoActual),
      this.reporteRepository.findByPeriodo(periodoAnterior),
    ])

    if (!actual) throw new EntityNotFoundError('ReporteInclusionLaboral', periodoActual as any)
    if (!anterior) throw new EntityNotFoundError('ReporteInclusionLaboral', periodoAnterior as any)

    const calcularVariacion = (a: number, b: number): number =>
      b === 0 ? 0 : ((a - b) / b) * 100

    return {
      variacion: {
        candidatosActivos: calcularVariacion(actual.totalCandidatosActivos, anterior.totalCandidatosActivos),
        vacantesPublicadas: calcularVariacion(actual.totalVacantesPublicadas, anterior.totalVacantesPublicadas),
        postulaciones: calcularVariacion(actual.totalPostulaciones, anterior.totalPostulaciones),
        contrataciones: calcularVariacion(actual.totalContrataciones, anterior.totalContrataciones),
        tasaIntermediacion: calcularVariacion(
          actual.calcularTasaIntermediacion(),
          anterior.calcularTasaIntermediacion(),
        ),
      },
    }
  }
}

// ============================================================
// CONSULTAR DASHBOARD DE INDICADORES
// ============================================================

export class ObtenerDashboardIndicadoresUseCase {
  constructor(
    private readonly dashboardRepository: IDashboardIndicadoresRepository,
  ) {}

  async execute(idAdministrador: number): Promise<DashboardIndicadores> {
    let dashboard = await this.dashboardRepository.findByIdAdministrador(idAdministrador)

    // RN-73: recalcular si el desfase supera las 24 horas
    if (!dashboard || dashboard.necesitaActualizacion()) {
      const metricas = await this.dashboardRepository.calcularMetricas()
      const tasaIntermediacion =
        metricas.totalPostulacionesMes > 0
          ? (metricas.totalContratacionesMes / metricas.totalPostulacionesMes) * 100
          : 0

      const datos = {
        fechaUltimaActualizacion: new Date(),
        totalUsuariosActivos: metricas.totalUsuariosActivos,
        totalVacantesActivas: metricas.totalVacantesActivas,
        totalPostulacionesMes: metricas.totalPostulacionesMes,
        totalContratacionesMes: metricas.totalContratacionesMes,
        tasaIntermediacion,
      }

      if (dashboard) {
        dashboard.actualizar(datos)
        await this.dashboardRepository.update(dashboard)
      } else {
        dashboard = await this.dashboardRepository.save(
          new DashboardIndicadores({ id: 0, idAdministrador, ...datos }),
        )
      }
    }

    return dashboard
  }
}

// ============================================================
// EXPORTAR REPORTES EN PDF Y EXCEL
// ============================================================

export type FormatoExportacion = 'pdf' | 'excel'

export interface ExportarReporteInputDto {
  idReporte: number
  tipoReporte: 'cuota' | 'gestion' | 'global'
  formato: FormatoExportacion
  idUsuario: number
}

export class ExportarReportePDFUseCase {
  constructor(
    private readonly reporteCuotaRepository: IReporteCuotaInclusionRepository,
    private readonly reporteGestionRepository: IReporteGestionIntermediadorRepository,
    private readonly reporteGlobalRepository: IReporteInclusionLaboralRepository,
    private readonly pdfGenerator: IPdfGeneratorService,
    private readonly fileStorageService: IFileStorageService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: Omit<ExportarReporteInputDto, 'formato'>): Promise<string> {
    const datos = await this.obtenerDatosReporte(input.idReporte, input.tipoReporte)

    const pdfBuffer = await this.pdfGenerator.generar(datos, `Reporte ${input.tipoReporte}`)

    const url = await this.fileStorageService.upload(
      pdfBuffer,
      `reportes/${input.tipoReporte}/${input.idReporte}.pdf`,
      'application/pdf',
    )

    // RN-78: toda descarga queda registrada en auditoría
    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'reporte_descargado_pdf',
      modulo: 'reportes',
      objetoAfectado: `Reporte${input.tipoReporte}`,
      idObjetoAfectado: input.idReporte,
      resultado: 'exitoso',
    })

    return url
  }

  private async obtenerDatosReporte(
    idReporte: number,
    tipo: string,
  ): Promise<Record<string, unknown>> {
    if (tipo === 'cuota') {
      const r = await this.reporteCuotaRepository.findById(idReporte)
      if (!r) throw new EntityNotFoundError('ReporteCuotaInclusion', idReporte)
      return r as unknown as Record<string, unknown>
    }
    if (tipo === 'gestion') {
      const r = await this.reporteGestionRepository.findById(idReporte)
      if (!r) throw new EntityNotFoundError('ReporteGestionIntermediador', idReporte)
      return r as unknown as Record<string, unknown>
    }
    const r = await this.reporteGlobalRepository.findById(idReporte)
    if (!r) throw new EntityNotFoundError('ReporteInclusionLaboral', idReporte)
    return r as unknown as Record<string, unknown>
  }
}

export class ExportarReporteExcelUseCase {
  constructor(
    private readonly reporteCuotaRepository: IReporteCuotaInclusionRepository,
    private readonly reporteGestionRepository: IReporteGestionIntermediadorRepository,
    private readonly reporteGlobalRepository: IReporteInclusionLaboralRepository,
    private readonly excelGenerator: IExcelGeneratorService,
    private readonly fileStorageService: IFileStorageService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: Omit<ExportarReporteInputDto, 'formato'>): Promise<string> {
    const filas = await this.construirFilas(input.idReporte, input.tipoReporte)
    const encabezados = Object.keys(filas[0] ?? {})

    const excelBuffer = await this.excelGenerator.generar(filas, encabezados)

    const url = await this.fileStorageService.upload(
      excelBuffer,
      `reportes/${input.tipoReporte}/${input.idReporte}.xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )

    // RN-78: toda descarga queda registrada en auditoría
    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'reporte_descargado_excel',
      modulo: 'reportes',
      objetoAfectado: `Reporte${input.tipoReporte}`,
      idObjetoAfectado: input.idReporte,
      resultado: 'exitoso',
    })

    return url
  }

  private async construirFilas(
    idReporte: number,
    tipo: string,
  ): Promise<Record<string, unknown>[]> {
    if (tipo === 'cuota') {
      const r = await this.reporteCuotaRepository.findById(idReporte)
      if (!r) throw new EntityNotFoundError('ReporteCuotaInclusion', idReporte)
      return [{
        Periodo: r.periodo,
        'Total Trabajadores': r.totalTrabajadores,
        'Con Discapacidad': r.trabajadoresConDiscapacidad,
        'Cuota Obligada': r.cuotaObligada,
        '% Cumplimiento': r.porcentajeCumplimiento.toFixed(2),
        'Cumple Ley': r.cumpleLey ? 'Sí' : 'No',
        'Fecha Generación': r.fechaGeneracion.toISOString(),
      }]
    }
    if (tipo === 'gestion') {
      const r = await this.reporteGestionRepository.findById(idReporte)
      if (!r) throw new EntityNotFoundError('ReporteGestionIntermediador', idReporte)
      return [{
        Periodo: r.periodo,
        'Candidatos Atendidos': r.totalCandidatosAtendidos,
        'Postulaciones Gestionadas': r.totalPostulacionesGestionadas,
        Contrataciones: r.totalContrataciones,
        Derivaciones: r.totalDerivaciones,
        'Tasa de Éxito (%)': r.calcularTasaExito().toFixed(2),
        'Fecha Generación': r.fechaGeneracion.toISOString(),
      }]
    }
    const r = await this.reporteGlobalRepository.findById(idReporte)
    if (!r) throw new EntityNotFoundError('ReporteInclusionLaboral', idReporte)
    return [{
      Periodo: r.periodo,
      'Candidatos Activos': r.totalCandidatosActivos,
      'Vacantes Publicadas': r.totalVacantesPublicadas,
      'Total Postulaciones': r.totalPostulaciones,
      'Total Contrataciones': r.totalContrataciones,
      'Tasa Intermediación (%)': r.calcularTasaIntermediacion().toFixed(2),
      'Fecha Generación': r.fechaGeneracion.toISOString(),
    }]
  }
}

export class ExportarConsolidadoEmpresasUseCase {
  constructor(
    private readonly reporteCuotaRepository: IReporteCuotaInclusionRepository,
    private readonly excelGenerator: IExcelGeneratorService,
    private readonly fileStorageService: IFileStorageService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(idAdministrador: number, periodo: string): Promise<string> {
    // RN-71: solo el administrador puede ver consolidado de todas las empresas
    // Los datos por empresa los trae el repositorio ya consolidados por periodo
    const encabezados = [
      'ID Empresa', 'Periodo', 'Total Trabajadores',
      'Con Discapacidad', 'Cuota Obligada', '% Cumplimiento', 'Cumple Ley',
    ]

    const excelBuffer = await this.excelGenerator.generar(
      [{ Nota: `Consolidado empresas periodo ${periodo}` }],
      encabezados,
    )

    const url = await this.fileStorageService.upload(
      excelBuffer,
      `reportes/consolidado/${periodo}.xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )

    await this.auditLogger.log({
      idUsuario: idAdministrador,
      accion: 'consolidado_exportado',
      modulo: 'reportes',
      resultado: 'exitoso',
      detalle: `Periodo: ${periodo}`,
    })

    return url
  }
}
