import { NivelEducativo } from '../../enums/PerfilEnums.enum'

export interface FormacionAcademicaProps {
  id: number
  idPerfil: number
  institucion: string
  titulo: string
  nivel: NivelEducativo
  fechaInicio?: Date
  fechaFin?: Date
  enCurso: boolean
}

export class FormacionAcademica {
  readonly id: number
  readonly idPerfil: number
  private institucion: string
  private titulo: string
  private nivel: NivelEducativo
  private fechaInicio?: Date
  private fechaFin?: Date
  private enCurso: boolean

  constructor(props: FormacionAcademicaProps) {
    this.id = props.id
    this.idPerfil = props.idPerfil
    this.institucion = props.institucion
    this.titulo = props.titulo
    this.nivel = props.nivel
    this.fechaInicio = props.fechaInicio
    this.fechaFin = props.fechaFin
    this.enCurso = props.enCurso
  }

  getInstitucion(): string { return this.institucion }
  getTitulo(): string { return this.titulo }
  getNivel(): NivelEducativo { return this.nivel }
  getFechaInicio(): Date | undefined { return this.fechaInicio }
  getFechaFin(): Date | undefined { return this.fechaFin }
  isEnCurso(): boolean { return this.enCurso }

  actualizar(datos: Partial<Omit<FormacionAcademicaProps, 'id' | 'idPerfil'>>): void {
    if (datos.institucion) this.institucion = datos.institucion
    if (datos.titulo) this.titulo = datos.titulo
    if (datos.nivel) this.nivel = datos.nivel
    if (datos.fechaInicio !== undefined) this.fechaInicio = datos.fechaInicio
    if (datos.fechaFin !== undefined) this.fechaFin = datos.fechaFin
    if (datos.enCurso !== undefined) this.enCurso = datos.enCurso
  }
}
