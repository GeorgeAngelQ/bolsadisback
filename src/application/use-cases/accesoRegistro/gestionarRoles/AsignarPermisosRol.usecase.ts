import { IRolRepository } from '../../../../domain/repositories/accesoRegistro/IRolRepository'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { EntityNotFoundError } from '../../../../domain/errors/DomainError'
import { Permiso } from '../../../../domain/entities/accesoRegistro/Rol.entity'

export interface AsignarPermisosRolInputDto {
  idAdministrador: number
  idRol: number
  permisoIds: number[]
}

export interface AsignarPermisosRolOutputDto {
  idRol: number
  nombreRol: string
  permisos: { id: number; nombre: string; modulo: string; accion: string }[]
  usuariosAfectados: number
}

export class AsignarPermisosRolUseCase {
  constructor(
    private readonly rolRepository: IRolRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: AsignarPermisosRolInputDto): Promise<AsignarPermisosRolOutputDto> {
    const rol = await this.rolRepository.findById(input.idRol)
    if (!rol) throw new EntityNotFoundError('Rol', input.idRol)

    // Obtener permisos del catálogo
    const todosPermisos = await this.rolRepository.findAllPermisos()
    const permisosSeleccionados: Permiso[] = todosPermisos.filter(p =>
      input.permisoIds.includes(p.id),
    )

    // Sincronizar permisos en la entidad y persistir
    rol.sincronizarPermisos(permisosSeleccionados)
    await this.rolRepository.syncPermisos(input.idRol, input.permisoIds)

    // Identificar usuarios afectados
    const usuariosConRol = await this.rolRepository.findRolesByUsuarioId(input.idRol)
    const totalAfectados = usuariosConRol.length

    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: 'permisos_actualizados',
      modulo: 'administracion',
      objetoAfectado: 'Rol',
      idObjetoAfectado: input.idRol,
      resultado: 'exitoso',
      detalle: `Permisos actualizados. Usuarios afectados: ${totalAfectados}`,
    })

    return {
      idRol: rol.id,
      nombreRol: rol.getNombre(),
      permisos: permisosSeleccionados.map(p => ({
        id: p.id,
        nombre: p.nombre,
        modulo: p.modulo,
        accion: p.accion,
      })),
      usuariosAfectados: totalAfectados,
    }
  }
}
