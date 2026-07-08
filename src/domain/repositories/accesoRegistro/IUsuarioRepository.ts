import { Usuario } from '../../entities/accesoRegistro/Usuario.entity'

export interface IUsuarioRepository {
  findById(id: number): Promise<Usuario | null>
  findByCorreo(correo: string): Promise<Usuario | null>
  existsByCorreo(correo: string): Promise<boolean>
  save(usuario: Usuario): Promise<Usuario>
  update(usuario: Usuario): Promise<void>
  countAdministradoresActivos(): Promise<number>
}
