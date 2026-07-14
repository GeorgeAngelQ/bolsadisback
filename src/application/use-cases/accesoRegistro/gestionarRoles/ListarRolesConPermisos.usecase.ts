import { IRolRepository } from '../../../../domain/repositories/accesoRegistro/IRolRepository'

export interface RolConPermisosOutputDto {
  idRol: number
  nombre: string
  descripcion?: string
  permisos: {
    id: number
    nombre: string
    modulo: string
    accion: string
  }[]
}

export class ListarRolesConPermisosUseCase {
  constructor(
    private readonly rolRepository: IRolRepository,
  ) {}

  async execute(): Promise<RolConPermisosOutputDto[]> {
    const roles = await this.rolRepository.findAll()

    const resultado: RolConPermisosOutputDto[] = []

    for (const rol of roles) {
      const permisos = await this.rolRepository.findPermisosByRolId(rol.id)
      resultado.push({
        idRol: rol.id,
        nombre: rol.getNombre(),
        descripcion: rol.getDescripcion(),
        permisos: permisos.map(p => ({
          id: p.id,
          nombre: p.nombre,
          modulo: p.modulo,
          accion: p.accion,
        })),
      })
    }

    return resultado
  }
}
