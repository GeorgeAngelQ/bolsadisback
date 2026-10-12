import { IRolRepository } from '../../../../domain/repositories/accesoRegistro/IRolRepository'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { EntityNotFoundError } from '../../../../domain/errors/DomainError'
import { Permiso } from '../../../../domain/entities/accesoRegistro/Rol.entity'
import { IUnitOfWork } from '@application/ports/IUnitOfWork'

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
    private readonly unitOfWork: IUnitOfWork,
    private readonly rolRepository: IRolRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: AsignarPermisosRolInputDto): Promise<AsignarPermisosRolOutputDto> {

    const rol = await this.rolRepository.findById(input.idRol)
    if (!rol) throw new EntityNotFoundError('Rol', input.idRol)

    const todosPermisos = await this.rolRepository.findAllPermisos()
    const permisosSeleccionados: Permiso[] = todosPermisos.filter(p =>
      input.permisoIds.includes(p.id),
    )

    const totalAfectados = await this.rolRepository.countUsuariosByRol(input.idRol)
    
    await this.unitOfWork.execute(async () => {

      rol.sincronizarPermisos(permisosSeleccionados)
      await this.rolRepository.syncPermisos(
        input.idRol, 
        permisosSeleccionados.map(p=>p.id))
    })

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
