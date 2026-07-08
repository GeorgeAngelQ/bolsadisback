import { AccionPermiso } from '../../enums/AccionPermiso.enum'

export interface PermisoProps {
  id: number
  nombre: string
  modulo: string
  accion: AccionPermiso
}

export class Permiso {
  readonly id: number
  readonly nombre: string
  readonly modulo: string
  readonly accion: AccionPermiso

  constructor(props: PermisoProps) {
    this.id = props.id
    this.nombre = props.nombre
    this.modulo = props.modulo
    this.accion = props.accion
  }
}

export interface RolProps {
  id: number
  nombre: string
  descripcion?: string
  fechaCreacion: Date
  permisos?: Permiso[]
}

export class Rol {
  readonly id: number
  private nombre: string
  private descripcion?: string
  readonly fechaCreacion: Date
  private permisos: Permiso[]

  constructor(props: RolProps) {
    this.id = props.id
    this.nombre = props.nombre
    this.descripcion = props.descripcion
    this.fechaCreacion = props.fechaCreacion
    this.permisos = props.permisos ?? []
  }

  getNombre(): string { return this.nombre }
  getDescripcion(): string | undefined { return this.descripcion }
  getPermisos(): Permiso[] { return [...this.permisos] }

  tienePermiso(modulo: string, accion: AccionPermiso): boolean {
    return this.permisos.some(p => p.modulo === modulo && p.accion === accion)
  }

  sincronizarPermisos(nuevosPermisos: Permiso[]): void {
    this.permisos = [...nuevosPermisos]
  }

  actualizarDescripcion(descripcion: string): void {
    this.descripcion = descripcion
  }
}
