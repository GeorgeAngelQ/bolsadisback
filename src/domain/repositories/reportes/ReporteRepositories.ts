import { 
  ReporteCuotaInclusion, 
  ReporteGestionIntermediador, 
  ReporteInclusionLaboral, 
  DashboardIndicadores 
} from '../../entities/reportes/ReporteEntities.entity';


export interface FiltrosReporteGlobal {
  idsTiposDiscapacidad?: number[]
  sector?: string
  distrito?: string
  fechaDesde?: Date
  fechaHasta?: Date
}

export interface MetricasDashboard {
  totalUsuariosActivos: number
  totalVacantesActivas: number
  totalPostulacionesMes: number
  totalContratacionesMes: number
}

export interface IReporteCuotaInclusionRepository {
  findById(id: number): Promise<ReporteCuotaInclusion | null>
  findByIdEmpresa(idEmpresa: number): Promise<ReporteCuotaInclusion[]>
  countContratacionesConDiscapacidad(idEmpresa: number, periodo: string): Promise<number>
  save(reporte: ReporteCuotaInclusion): Promise<ReporteCuotaInclusion>
}

export interface IReporteGestionIntermediadorRepository {
  findById(id: number): Promise<ReporteGestionIntermediador | null>
  findByIdIntermediador(idIntermediador: number): Promise<ReporteGestionIntermediador[]>
  contarCandidatosAtendidos(idIntermediador: number, periodo: string): Promise<number>
  contarPostulacionesGestionadas(idIntermediador: number, periodo: string): Promise<number>
  contarContrataciones(idIntermediador: number, periodo: string): Promise<number>
  contarDerivaciones(idIntermediador: number, periodo: string): Promise<number>
  save(reporte: ReporteGestionIntermediador): Promise<ReporteGestionIntermediador>
}

export interface IReporteInclusionLaboralRepository {
  findById(id: number): Promise<ReporteInclusionLaboral | null>
  findByPeriodo(periodo: string): Promise<ReporteInclusionLaboral | null>
  contarCandidatosActivos(filtros: FiltrosReporteGlobal): Promise<number>
  contarVacantesPublicadas(filtros: FiltrosReporteGlobal): Promise<number>
  contarPostulaciones(filtros: FiltrosReporteGlobal): Promise<number>
  contarContrataciones(filtros: FiltrosReporteGlobal): Promise<number>
  calcularDistribucionDiscapacidad(filtros: FiltrosReporteGlobal): Promise<Record<string, number>>
  calcularDistribucionSector(filtros: FiltrosReporteGlobal): Promise<Record<string, number>>
  calcularDistribucionDistrito(filtros: FiltrosReporteGlobal): Promise<Record<string, number>>
  save(reporte: ReporteInclusionLaboral): Promise<ReporteInclusionLaboral>
}

export interface IDashboardIndicadoresRepository {
  findByIdAdministrador(idAdministrador: number): Promise<DashboardIndicadores | null>
  calcularMetricas(): Promise<MetricasDashboard>
  calcularMetricasPorPeriodo(fechaDesde: Date, fechaHasta: Date): Promise<MetricasDashboard>
  save(dashboard: DashboardIndicadores): Promise<DashboardIndicadores>
  update(dashboard: DashboardIndicadores): Promise<void>
}
