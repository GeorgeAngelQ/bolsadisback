export type TipoContraste = 'normal' | 'alto' | 'oscuro'
export type TamanoTexto = 'pequeno' | 'mediano' | 'grande'

export interface PreferenciaAccesibilidadProps {
  id: number
  idUsuario: number
  tipoContraste: TipoContraste
  tamanoTexto: TamanoTexto
  subtitulosActivos: boolean
  lenguaSenas: boolean
  lectorPantalla: boolean
  lenguajeSencillo: boolean
}

const VALORES_POR_DEFECTO: Omit<PreferenciaAccesibilidadProps, 'id' | 'idUsuario'> = {
  tipoContraste: 'normal',
  tamanoTexto: 'mediano',
  subtitulosActivos: false,
  lenguaSenas: false,
  lectorPantalla: false,
  lenguajeSencillo: false,
}

export class PreferenciaAccesibilidad {
  readonly id: number
  readonly idUsuario: number
  private tipoContraste: TipoContraste
  private tamanoTexto: TamanoTexto
  private subtitulosActivos: boolean
  private lenguaSenas: boolean
  private lectorPantalla: boolean
  private lenguajeSencillo: boolean

  constructor(props: PreferenciaAccesibilidadProps) {
    this.id = props.id
    this.idUsuario = props.idUsuario
    this.tipoContraste = props.tipoContraste
    this.tamanoTexto = props.tamanoTexto
    this.subtitulosActivos = props.subtitulosActivos
    this.lenguaSenas = props.lenguaSenas
    this.lectorPantalla = props.lectorPantalla
    this.lenguajeSencillo = props.lenguajeSencillo
  }

  static crearPorDefecto(id: number, idUsuario: number): PreferenciaAccesibilidad {
    return new PreferenciaAccesibilidad({ id, idUsuario, ...VALORES_POR_DEFECTO })
  }

  getTipoContraste(): TipoContraste { return this.tipoContraste }
  getTamanoTexto(): TamanoTexto { return this.tamanoTexto }
  isSubtitulosActivos(): boolean { return this.subtitulosActivos }
  isLenguaSenas(): boolean { return this.lenguaSenas }
  isLectorPantalla(): boolean { return this.lectorPantalla }
  isLenguajeSencillo(): boolean { return this.lenguajeSencillo }

  actualizar(datos: Partial<Omit<PreferenciaAccesibilidadProps, 'id' | 'idUsuario'>>): void {
    if (datos.tipoContraste) this.tipoContraste = datos.tipoContraste
    if (datos.tamanoTexto) this.tamanoTexto = datos.tamanoTexto
    if (datos.subtitulosActivos !== undefined) this.subtitulosActivos = datos.subtitulosActivos
    if (datos.lenguaSenas !== undefined) this.lenguaSenas = datos.lenguaSenas
    if (datos.lectorPantalla !== undefined) this.lectorPantalla = datos.lectorPantalla
    if (datos.lenguajeSencillo !== undefined) this.lenguajeSencillo = datos.lenguajeSencillo
  }

  restablecerDefecto(): void {
    this.tipoContraste = VALORES_POR_DEFECTO.tipoContraste
    this.tamanoTexto = VALORES_POR_DEFECTO.tamanoTexto
    this.subtitulosActivos = VALORES_POR_DEFECTO.subtitulosActivos
    this.lenguaSenas = VALORES_POR_DEFECTO.lenguaSenas
    this.lectorPantalla = VALORES_POR_DEFECTO.lectorPantalla
    this.lenguajeSencillo = VALORES_POR_DEFECTO.lenguajeSencillo
  }

  toPlainObject(): Omit<PreferenciaAccesibilidadProps, 'id' | 'idUsuario'> {
    return {
      tipoContraste: this.tipoContraste,
      tamanoTexto: this.tamanoTexto,
      subtitulosActivos: this.subtitulosActivos,
      lenguaSenas: this.lenguaSenas,
      lectorPantalla: this.lectorPantalla,
      lenguajeSencillo: this.lenguajeSencillo,
    }
  }
}
