import { Ruc } from '../../value-objects/Ruc.vo'

export interface EmpresaEmpleadoraProps {
  id: number
  idUsuario: number
  razonSocial: string
  ruc: Ruc
  representanteLegal?: string
  telefonoEmpresa?: string
  correoEmpresa?: string
}

export class EmpresaEmpleadora {
  readonly id: number
  readonly idUsuario: number
  private razonSocial: string
  private ruc: Ruc
  private representanteLegal?: string
  private telefonoEmpresa?: string
  private correoEmpresa?: string

  constructor(props: EmpresaEmpleadoraProps) {
    this.id = props.id
    this.idUsuario = props.idUsuario
    this.razonSocial = props.razonSocial
    this.ruc = props.ruc
    this.representanteLegal = props.representanteLegal
    this.telefonoEmpresa = props.telefonoEmpresa
    this.correoEmpresa = props.correoEmpresa
  }

  getRazonSocial(): string { return this.razonSocial }
  getRuc(): string { return this.ruc.getValue() }
  getRepresentanteLegal(): string | undefined { return this.representanteLegal }
  getTelefonoEmpresa(): string | undefined { return this.telefonoEmpresa }
  getCorreoEmpresa(): string | undefined { return this.correoEmpresa }

  actualizarDatos(datos: Partial<Omit<EmpresaEmpleadoraProps, 'id' | 'idUsuario' | 'ruc'>>): void {
    if (datos.razonSocial) this.razonSocial = datos.razonSocial
    if (datos.representanteLegal !== undefined) this.representanteLegal = datos.representanteLegal
    if (datos.telefonoEmpresa !== undefined) this.telefonoEmpresa = datos.telefonoEmpresa
    if (datos.correoEmpresa !== undefined) this.correoEmpresa = datos.correoEmpresa
  }
}
