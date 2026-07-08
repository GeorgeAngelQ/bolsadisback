import { BusinessRuleViolationError } from '../../errors/DomainError'

// RN-75: retención mínima de datos 3 años
export const ANIOS_RETENCION_MINIMA = 3

// RN-76: no se puede consultar más de 5 años de antigüedad
export const ANIOS_MAX_CONSULTA = 5

// ---------- ReporteCuotaInclusion ----------

export interface ReporteCuotaInclusionProps {
  id: number
  idEmpresa: number
  periodo: string
  totalTrabajadores: number
  trabajadoresConDiscapacidad: number
  cuotaObligada: number
  porcentajeCumplimiento: number
  cumpleLey: boolean
  fechaGeneracion: Date
}

export class ReporteCuotaInclusion {
  readonly id: number
  readonly idEmpresa: number
  readonly periodo: string
  readonly totalTrabajadores: number
  readonly trabajadoresConDiscapacidad: number
  readonly cuotaObligada: number
  readonly porcentajeCumplimiento: number
  readonly cumpleLey: boolean
  readonly fechaGeneracion: Date

  constructor(props: ReporteCuotaInclusionProps) {
    this.id = props.id
    this.idEmpresa = props.idEmpresa
    this.periodo = props.periodo
    this.totalTrabajadores = props.totalTrabajadores
    this.trabajadoresConDiscapacidad = props.trabajadoresConDiscapacidad
    this.cuotaObligada = props.cuotaObligada
    this.porcentajeCumplimiento = props.porcentajeCumplimiento
    this.cumpleLey = props.cumpleLey
    this.fechaGeneracion = props.fechaGeneracion
  }
}

// ---------- ReporteGestionIntermediador ----------

export interface ReporteGestionIntermediadorProps {
  id: number
  idIntermediador: number
  periodo: string
  totalCandidatosAtendidos: number
  totalPostulacionesGestionadas: number
  totalContrataciones: number
  totalDerivaciones: number
  fechaGeneracion: Date
}

export class ReporteGestionIntermediador {
  readonly id: number
  readonly idIntermediador: number
  readonly periodo: string
  readonly totalCandidatosAtendidos: number
  readonly totalPostulacionesGestionadas: number
  readonly totalContrataciones: number
  readonly totalDerivaciones: number
  readonly fechaGeneracion: Date

  constructor(props: ReporteGestionIntermediadorProps) {
    this.id = props.id
    this.idIntermediador = props.idIntermediador
    this.periodo = props.periodo
    this.totalCandidatosAtendidos = props.totalCandidatosAtendidos
    this.totalPostulacionesGestionadas = props.totalPostulacionesGestionadas
    this.totalContrataciones = props.totalContrataciones
    this.totalDerivaciones = props.totalDerivaciones
    this.fechaGeneracion = props.fechaGeneracion
  }

  calcularTasaExito(): number {
    if (this.totalPostulacionesGestionadas === 0) return 0
    return (this.totalContrataciones / this.totalPostulacionesGestionadas) * 100
  }
}

// ---------- ReporteInclusionLaboral ----------

export interface ReporteInclusionLaboralProps {
  id: number
  idAdministrador: number
  periodo: string
  totalCandidatosActivos: number
  totalVacantesPublicadas: number
  totalPostulaciones: number
  totalContrataciones: number
  distribucionPorDiscapacidad: Record<string, number>
  distribucionPorSector: Record<string, number>
  distribucionPorDistrito: Record<string, number>
  fechaGeneracion: Date
}

export class ReporteInclusionLaboral {
  readonly id: number
  readonly idAdministrador: number
  readonly periodo: string
  readonly totalCandidatosActivos: number
  readonly totalVacantesPublicadas: number
  readonly totalPostulaciones: number
  readonly totalContrataciones: number
  readonly distribucionPorDiscapacidad: Record<string, number>
  readonly distribucionPorSector: Record<string, number>
  readonly distribucionPorDistrito: Record<string, number>
  readonly fechaGeneracion: Date

  constructor(props: ReporteInclusionLaboralProps) {
    this.id = props.id
    this.idAdministrador = props.idAdministrador
    this.periodo = props.periodo
    this.totalCandidatosActivos = props.totalCandidatosActivos
    this.totalVacantesPublicadas = props.totalVacantesPublicadas
    this.totalPostulaciones = props.totalPostulaciones
    this.totalContrataciones = props.totalContrataciones
    this.distribucionPorDiscapacidad = props.distribucionPorDiscapacidad
    this.distribucionPorSector = props.distribucionPorSector
    this.distribucionPorDistrito = props.distribucionPorDistrito
    this.fechaGeneracion = props.fechaGeneracion
  }

  calcularTasaIntermediacion(): number {
    if (this.totalPostulaciones === 0) return 0
    return (this.totalContrataciones / this.totalPostulaciones) * 100
  }
}

// ---------- DashboardIndicadores ----------

export interface DashboardIndicadoresProps {
  id: number
  idAdministrador: number
  fechaUltimaActualizacion: Date
  totalUsuariosActivos: number
  totalVacantesActivas: number
  totalPostulacionesMes: number
  totalContratacionesMes: number
  tasaIntermediacion: number
}

export class DashboardIndicadores {
  readonly id: number
  readonly idAdministrador: number
  private fechaUltimaActualizacion: Date
  private totalUsuariosActivos: number
  private totalVacantesActivas: number
  private totalPostulacionesMes: number
  private totalContratacionesMes: number
  private tasaIntermediacion: number

  // RN-73: desfase máximo permitido de 24 horas
  private static readonly HORAS_MAX_DESFASE = 24

  constructor(props: DashboardIndicadoresProps) {
    this.id = props.id
    this.idAdministrador = props.idAdministrador
    this.fechaUltimaActualizacion = props.fechaUltimaActualizacion
    this.totalUsuariosActivos = props.totalUsuariosActivos
    this.totalVacantesActivas = props.totalVacantesActivas
    this.totalPostulacionesMes = props.totalPostulacionesMes
    this.totalContratacionesMes = props.totalContratacionesMes
    this.tasaIntermediacion = props.tasaIntermediacion
  }

  getFechaUltimaActualizacion(): Date { return this.fechaUltimaActualizacion }
  getTotalUsuariosActivos(): number { return this.totalUsuariosActivos }
  getTotalVacantesActivas(): number { return this.totalVacantesActivas }
  getTotalPostulacionesMes(): number { return this.totalPostulacionesMes }
  getTotalContratacionesMes(): number { return this.totalContratacionesMes }
  getTasaIntermediacion(): number { return this.tasaIntermediacion }

  necesitaActualizacion(): boolean {
    const horasTranscurridas =
      (new Date().getTime() - this.fechaUltimaActualizacion.getTime()) / (1000 * 60 * 60)
    return horasTranscurridas >= DashboardIndicadores.HORAS_MAX_DESFASE
  }

  actualizar(datos: Omit<DashboardIndicadoresProps, 'id' | 'idAdministrador'>): void {
    this.fechaUltimaActualizacion = datos.fechaUltimaActualizacion
    this.totalUsuariosActivos = datos.totalUsuariosActivos
    this.totalVacantesActivas = datos.totalVacantesActivas
    this.totalPostulacionesMes = datos.totalPostulacionesMes
    this.totalContratacionesMes = datos.totalContratacionesMes
    this.tasaIntermediacion = datos.tasaIntermediacion
  }
}
