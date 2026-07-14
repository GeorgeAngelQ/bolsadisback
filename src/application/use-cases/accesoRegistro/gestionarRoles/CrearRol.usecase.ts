import { IRolRepository } from '../../../../domain/repositories/accesoRegistro/IRolRepository'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { DuplicateEntityError } from '../../../../domain/errors/DomainError'
import { Rol } from '../../../../domain/entities/accesoRegistro/Rol.entity'

export interface CrearRolInputDto {
  idAdministrador: number
  nombre: string
  descripcion?: string
  permisoIds: number[]
}

export interface CrearRolOutputDto {
  idRol: number
  nombre: string
  descripcion?: string
  totalPermisos: number
}

export class CrearRolUseCase {
  constructor(
    private readonly rolRepository: IRolRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: CrearRolInputDto): Promise<CrearRolOutputDto> {
    // Nombre único de rol
    const existe = await this.rolRepository.existsByNombre(input.nombre)
    if (existe) throw new DuplicateEntityError('Rol', 'nombre')

    const rol = await this.rolRepository.save(
      new Rol({
        id: 0,
        nombre: input.nombre,
        descripcion: input.descripcion,
        fechaCreacion: new Date(),
      }),
    )

    if (input.permisoIds.length > 0) {
      await this.rolRepository.syncPermisos(rol.id, input.permisoIds)
    }

    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: 'rol_creado',
      modulo: 'administracion',
      objetoAfectado: 'Rol',
      idObjetoAfectado: rol.id,
      resultado: 'exitoso',
    })

    return {
      idRol: rol.id,
      nombre: rol.getNombre(),
      descripcion: rol.getDescripcion(),
      totalPermisos: input.permisoIds.length,
    }
  }
}
