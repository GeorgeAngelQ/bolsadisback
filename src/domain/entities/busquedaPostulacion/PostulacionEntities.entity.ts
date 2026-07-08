import { OrigenRecomendacion, FrecuenciaAlerta } from '../../enums/PostulacionEnums.enum'
import { ModalidadTrabajo } from '../../enums/VacanteEnums.enum'
import { BusinessRuleViolationError } from '../../errors/DomainError'

// ---------- RecomendacionVacante ----------

export interface RecomendacionVacanteProps {
  id: number
  idCandidato: number
  idVacante: number
  idIntermediador?: number
  origen: OrigenRecomendacion
  puntuacionCompatibilidad: number
  fechaGeneracion: Date
  leida: boolean
}

export class RecomendacionVacante {
  readonly id: number
  readonly idCandidato: number
  readonly idVacante: number
  readonly idIntermediador?: number
  readonly origen: OrigenRecomendacion
  private puntuacionCompatibilidad: number
  readonly fechaGeneracion: Date
  private leida: boolean

  constructor(props: RecomendacionVacanteProps) {
    this.id = props.id
    this.idCandidato = props.idCandidato
    this.idVacante = props.idVacante
    this.idIntermediador = props.idIntermediador
    this.origen = props.origen
    this.puntuacionCompatibilidad = props.puntuacionCompatibilidad
    this.fechaGeneracion = props.fechaGeneracion
    this.leida = props.leida
  }

  getPuntuacion(): number { return this.puntuacionCompatibilidad }
  isLeida(): boolean { return this.leida }

  marcarLeida(): void { this.leida = true }

  actualizarPuntuacion(puntuacion: number): void {
    this.puntuacionCompatibilidad = puntuacion
  }
}

// ---------- AlertaEmpleo ----------

export interface AlertaEmpleoProps {
  id: number
  idCandidato: number
  palabrasClave?: string
  sectorEconomico?: string
  modalidad?: ModalidadTrabajo | 'todas'
  frecuencia: FrecuenciaAlerta
  activa: boolean
  fechaCreacion: Date
}

export class AlertaEmpleo {
  readonly id: number
  readonly idCandidato: number
  private palabrasClave?: string
  private sectorEconomico?: string
  private modalidad?: ModalidadTrabajo | 'todas'
  private frecuencia: FrecuenciaAlerta
  private activa: boolean
  readonly fechaCreacion: Date

  constructor(props: AlertaEmpleoProps) {
    this.validarCriterios(props.palabrasClave, props.sectorEconomico)
    this.id = props.id
    this.idCandidato = props.idCandidato
    this.palabrasClave = props.palabrasClave
    this.sectorEconomico = props.sectorEconomico
    this.modalidad = props.modalidad
    this.frecuencia = props.frecuencia
    this.activa = props.activa
    this.fechaCreacion = props.fechaCreacion
  }

  private validarCriterios(palabrasClave?: string, sector?: string): void {
    if (!palabrasClave && !sector) {
      throw new BusinessRuleViolationError(
        'alerta',
        'Ingresa al menos una palabra clave o selecciona un sector',
      )
    }
  }

  getPalabrasClave(): string | undefined { return this.palabrasClave }
  getSectorEconomico(): string | undefined { return this.sectorEconomico }
  getModalidad(): ModalidadTrabajo | 'todas' | undefined { return this.modalidad }
  getFrecuencia(): FrecuenciaAlerta { return this.frecuencia }
  isActiva(): boolean { return this.activa }

  activar(): void { this.activa = true }
  desactivar(): void { this.activa = false }

  editarCriterios(datos: Partial<Pick<AlertaEmpleoProps, 'palabrasClave' | 'sectorEconomico' | 'modalidad' | 'frecuencia'>>): void {
    this.validarCriterios(
      datos.palabrasClave ?? this.palabrasClave,
      datos.sectorEconomico ?? this.sectorEconomico,
    )
    if (datos.palabrasClave !== undefined) this.palabrasClave = datos.palabrasClave
    if (datos.sectorEconomico !== undefined) this.sectorEconomico = datos.sectorEconomico
    if (datos.modalidad !== undefined) this.modalidad = datos.modalidad
    if (datos.frecuencia !== undefined) this.frecuencia = datos.frecuencia
  }
}

// ---------- VacanteGuardada ----------

export const MAX_FAVORITOS_POR_CANDIDATO = 20

export interface VacanteGuardadaProps {
  id: number
  idCandidato: number
  idVacante: number
  fechaGuardado: Date
}

export class VacanteGuardada {
  readonly id: number
  readonly idCandidato: number
  readonly idVacante: number
  readonly fechaGuardado: Date

  constructor(props: VacanteGuardadaProps) {
    this.id = props.id
    this.idCandidato = props.idCandidato
    this.idVacante = props.idVacante
    this.fechaGuardado = props.fechaGuardado
  }
}
