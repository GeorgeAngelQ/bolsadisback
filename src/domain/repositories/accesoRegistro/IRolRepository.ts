import { 
  Rol,
  Permiso
} from '../../entities/accesoRegistro/Rol.entity'

export interface IRolRepository {
  findById(id: number): Promise<Rol | null>
  findByNombre(nombre: string): Promise<Rol | null>
  findAll(): Promise<Rol[]>
  existsByNombre(nombre: string): Promise<boolean>
  save(rol: Rol): Promise<Rol>
  update(rol: Rol): Promise<void>
  findPermisosByRolId(idRol: number): Promise<Permiso[]>
  findAllPermisos(): Promise<Permiso[]>
  syncPermisos(idRol: number, permisoIds: number[]): Promise<void>
  assignRolToUsuario(idUsuario: number, idRol: number): Promise<void>
  findRolesByUsuarioId(idUsuario: number): Promise<Rol[]>
}
