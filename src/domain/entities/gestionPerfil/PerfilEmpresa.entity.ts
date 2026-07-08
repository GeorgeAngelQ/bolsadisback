import { TamanoEmpresa } from '../../enums/PerfilEnums.enum'

// RN-69: porcentajes de cuota Ley 29973
const CUOTA_EMPRESA_PRIVADA = 0.03
const CUOTA_ENTIDAD_PUBLICA = 0.05

export type TipoEntidad = 'privada' | 'publica'

export interface PerfilEmpresaProps {
  id: number
  idEmpresa: number
  descripcion?: string
  sector?: string
  tamano?: TamanoEmpresa
  tipoEntidad: TipoEntidad
  urlLogo?: string
  sitioWeb?: string
  politicaInclusion?: string
  totalTrabajadores: number
  fechaActualizacion?: Date
}

export class PerfilEmpresa {
  readonly id: number
  readonly idEmpresa: number
  private descripcion?: string
  private sector?: string
  private tamano?: TamanoEmpresa
  private tipoEntidad: TipoEntidad
  private urlLogo?: string
  private sitioWeb?: string
  private politicaInclusion?: string
  private totalTrabajadores: number
  private fechaActualizacion?: Date

  constructor(props: PerfilEmpresaProps) {
    this.id = props.id
    this.idEmpresa = props.idEmpresa
    this.descripcion = props.descripcion
    this.sector = props.sector
    this.tamano = props.tamano
    this.tipoEntidad = props.tipoEntidad
    this.urlLogo = props.urlLogo
    this.sitioWeb = props.sitioWeb
    this.politicaInclusion = props.politicaInclusion
    this.totalTrabajadores = props.totalTrabajadores
    this.fechaActualizacion = props.fechaActualizacion
  }

  getDescripcion(): string | undefined { return this.descripcion }
  getSector(): string | undefined { return this.sector }
  getTamano(): TamanoEmpresa | undefined { return this.tamano }
  getTipoEntidad(): TipoEntidad { return this.tipoEntidad }
  getUrlLogo(): string | undefined { return this.urlLogo }
  getSitioWeb(): string | undefined { return this.sitioWeb }
  getPoliticaInclusion(): string | undefined { return this.politicaInclusion }
  getTotalTrabajadores(): number { return this.totalTrabajadores }
  getFechaActualizacion(): Date | undefined { return this.fechaActualizacion }

  // RN-69: calcula la cuota obligada según tipo de entidad y Ley 29973
  calcularCuotaObligada(): number {
    const porcentaje =
      this.tipoEntidad === 'publica' ? CUOTA_ENTIDAD_PUBLICA : CUOTA_EMPRESA_PRIVADA
    return Math.ceil(this.totalTrabajadores * porcentaje)
  }

  verificarCumplimientoLey(trabajadoresConDiscapacidad: number): boolean {
    return trabajadoresConDiscapacidad >= this.calcularCuotaObligada()
  }

  actualizarDatos(datos: Partial<Omit<PerfilEmpresaProps, 'id' | 'idEmpresa'>>): void {
    if (datos.descripcion !== undefined) this.descripcion = datos.descripcion
    if (datos.sector !== undefined) this.sector = datos.sector
    if (datos.tamano !== undefined) this.tamano = datos.tamano
    if (datos.tipoEntidad !== undefined) this.tipoEntidad = datos.tipoEntidad
    if (datos.urlLogo !== undefined) this.urlLogo = datos.urlLogo
    if (datos.sitioWeb !== undefined) this.sitioWeb = datos.sitioWeb
    if (datos.politicaInclusion !== undefined) this.politicaInclusion = datos.politicaInclusion
    if (datos.totalTrabajadores !== undefined) this.totalTrabajadores = datos.totalTrabajadores
    this.fechaActualizacion = new Date()
  }
}
