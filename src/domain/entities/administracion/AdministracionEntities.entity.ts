import { BusinessRuleViolationError, InvalidEntityStateError } from '../../errors/DomainError'

// ---------- ContenidoInformativo ----------

export type TipoContenido = 'guia' | 'noticia' | 'recurso' | 'normativa'

export interface ContenidoInformativoProps {
  id: number
  idAdministrador: number
  titulo: string
  cuerpo: string
  tipo: TipoContenido
  formatoAccesible: boolean
  fechaPublicacion?: Date
  fechaActualizacion?: Date
  visible: boolean
}

export class ContenidoInformativo {
  readonly id: number
  readonly idAdministrador: number
  private titulo: string
  private cuerpo: string
  private tipo: TipoContenido
  private formatoAccesible: boolean
  private fechaPublicacion?: Date
  private fechaActualizacion?: Date
  private visible: boolean

  constructor(props: ContenidoInformativoProps) {
    if (!props.titulo || props.titulo.trim().length === 0) {
      throw new BusinessRuleViolationError('contenido', 'El título es obligatorio')
    }
    if (!props.cuerpo || props.cuerpo.trim().length === 0) {
      throw new BusinessRuleViolationError('contenido', 'El cuerpo es obligatorio')
    }
    this.id = props.id
    this.idAdministrador = props.idAdministrador
    this.titulo = props.titulo
    this.cuerpo = props.cuerpo
    this.tipo = props.tipo
    this.formatoAccesible = props.formatoAccesible
    this.fechaPublicacion = props.fechaPublicacion
    this.fechaActualizacion = props.fechaActualizacion
    this.visible = props.visible
  }

  getTitulo(): string { return this.titulo }
  getCuerpo(): string { return this.cuerpo }
  getTipo(): TipoContenido { return this.tipo }
  isFormatoAccesible(): boolean { return this.formatoAccesible }
  isVisible(): boolean { return this.visible }
  getFechaPublicacion(): Date | undefined { return this.fechaPublicacion }

  publicar(): void {
    this.visible = true
    this.fechaPublicacion = this.fechaPublicacion ?? new Date()
    this.fechaActualizacion = new Date()
  }

  retirar(): void { this.visible = false }

  actualizar(datos: Partial<Pick<ContenidoInformativoProps, 'titulo' | 'cuerpo' | 'tipo' | 'formatoAccesible'>>): void {
    if (datos.titulo) this.titulo = datos.titulo
    if (datos.cuerpo) this.cuerpo = datos.cuerpo
    if (datos.tipo) this.tipo = datos.tipo
    if (datos.formatoAccesible !== undefined) this.formatoAccesible = datos.formatoAccesible
    this.fechaActualizacion = new Date()
  }
}

// ---------- ConfiguracionAccesibilidadGlobal ----------

export type NivelWCAG = 'A' | 'AA' | 'AAA'

export interface ConfiguracionAccesibilidadGlobalProps {
  id: number
  idAdministrador: number
  nivelWCAG: NivelWCAG
  contrastesDisponibles: string
  tamanosTextoDisponibles: string
  soporteLSP: boolean
  subtitulosAutomaticos: boolean
  fechaActualizacion: Date
}

export class ConfiguracionAccesibilidadGlobal {
  readonly id: number
  readonly idAdministrador: number
  private nivelWCAG: NivelWCAG
  private contrastesDisponibles: string
  private tamanosTextoDisponibles: string
  private soporteLSP: boolean
  private subtitulosAutomaticos: boolean
  private fechaActualizacion: Date

  // RN-65: nivel mínimo WCAG AA
  private static readonly NIVEL_MINIMO: NivelWCAG = 'AA'
  private static readonly ORDEN_NIVELES: NivelWCAG[] = ['A', 'AA', 'AAA']

  constructor(props: ConfiguracionAccesibilidadGlobalProps) {
    this.validarNivelWCAG(props.nivelWCAG)
    this.id = props.id
    this.idAdministrador = props.idAdministrador
    this.nivelWCAG = props.nivelWCAG
    this.contrastesDisponibles = props.contrastesDisponibles
    this.tamanosTextoDisponibles = props.tamanosTextoDisponibles
    this.soporteLSP = props.soporteLSP
    this.subtitulosAutomaticos = props.subtitulosAutomaticos
    this.fechaActualizacion = props.fechaActualizacion
  }

  private validarNivelWCAG(nivel: NivelWCAG): void {
    const indexMinimo = ConfiguracionAccesibilidadGlobal.ORDEN_NIVELES.indexOf(
      ConfiguracionAccesibilidadGlobal.NIVEL_MINIMO,
    )
    const indexActual = ConfiguracionAccesibilidadGlobal.ORDEN_NIVELES.indexOf(nivel)
    if (indexActual < indexMinimo) {
      throw new BusinessRuleViolationError(
        'RN-65',
        `El nivel WCAG mínimo permitido es ${ConfiguracionAccesibilidadGlobal.NIVEL_MINIMO}`,
      )
    }
  }

  getNivelWCAG(): NivelWCAG { return this.nivelWCAG }
  getContrastesDisponibles(): string { return this.contrastesDisponibles }
  getTamanosTextoDisponibles(): string { return this.tamanosTextoDisponibles }
  isSoporteLSP(): boolean { return this.soporteLSP }
  isSubtitulosAutomaticos(): boolean { return this.subtitulosAutomaticos }
  getFechaActualizacion(): Date { return this.fechaActualizacion }

  actualizar(datos: Partial<Omit<ConfiguracionAccesibilidadGlobalProps, 'id' | 'idAdministrador'>>): void {
    if (datos.nivelWCAG) this.validarNivelWCAG(datos.nivelWCAG)
    if (datos.nivelWCAG) this.nivelWCAG = datos.nivelWCAG
    if (datos.contrastesDisponibles) this.contrastesDisponibles = datos.contrastesDisponibles
    if (datos.tamanosTextoDisponibles) this.tamanosTextoDisponibles = datos.tamanosTextoDisponibles
    if (datos.soporteLSP !== undefined) this.soporteLSP = datos.soporteLSP
    if (datos.subtitulosAutomaticos !== undefined) this.subtitulosAutomaticos = datos.subtitulosAutomaticos
    this.fechaActualizacion = new Date()
  }
}

// ---------- EventoAuditoria ----------

export interface EventoAuditoriaProps {
  id: number
  idUsuario: number
  accion: string
  modulo: string
  objetoAfectado?: string
  idObjetoAfectado?: number
  fechaHora: Date
  ipOrigen?: string
  resultado: 'exitoso' | 'fallido'
  detalle?: string
}

export class EventoAuditoria {
  readonly id: number
  readonly idUsuario: number
  readonly accion: string
  readonly modulo: string
  readonly objetoAfectado?: string
  readonly idObjetoAfectado?: number
  readonly fechaHora: Date
  readonly ipOrigen?: string
  readonly resultado: 'exitoso' | 'fallido'
  readonly detalle?: string

  constructor(props: EventoAuditoriaProps) {
    this.id = props.id
    this.idUsuario = props.idUsuario
    this.accion = props.accion
    this.modulo = props.modulo
    this.objetoAfectado = props.objetoAfectado
    this.idObjetoAfectado = props.idObjetoAfectado
    this.fechaHora = props.fechaHora
    this.ipOrigen = props.ipOrigen
    this.resultado = props.resultado
    this.detalle = props.detalle
  }
}
