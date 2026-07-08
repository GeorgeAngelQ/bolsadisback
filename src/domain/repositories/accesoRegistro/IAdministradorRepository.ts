import { Administrador } from '../../entities/accesoRegistro/Administrador.entity'

export interface IAdministradorRepository {
  findById(id: number): Promise<Administrador | null>
  findByIdUsuario(idUsuario: number): Promise<Administrador | null>
  save(administrador: Administrador): Promise<Administrador>
}
