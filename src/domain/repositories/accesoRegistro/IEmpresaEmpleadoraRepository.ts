import { EmpresaEmpleadora } from '../../entities/accesoRegistro/EmpresaEmpleadora.entity'

export interface IEmpresaEmpleadoraRepository {
  findById(id: number): Promise<EmpresaEmpleadora | null>
  findByIdUsuario(idUsuario: number): Promise<EmpresaEmpleadora | null>
  existsByRuc(ruc: string): Promise<boolean>
  save(empresa: EmpresaEmpleadora): Promise<EmpresaEmpleadora>
  update(empresa: EmpresaEmpleadora): Promise<void>
}
