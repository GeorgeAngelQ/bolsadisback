import { IPerfilEmpresaRepository } from '../../../../domain/repositories/gestionPerfil/PerfilRepositories'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { PerfilEmpresa, TipoEntidad } from '../../../../domain/entities/gestionPerfil/PerfilEmpresa.entity'
import { TamanoEmpresa } from '../../../../domain/enums/PerfilEnums.enum'
import { EntityNotFoundError, BusinessRuleViolationError } from '../../../../domain/errors/DomainError'

//  Crear perfil empresa 

export interface CrearPerfilEmpresaInputDto {
  idEmpresa: number
  idUsuario: number
  descripcion?: string
  sector?: string
  tamano?: TamanoEmpresa
  tipoEntidad: TipoEntidad
  urlLogo?: string
  sitioWeb?: string
  politicaInclusion?: string
  totalTrabajadores: number
}

export interface CrearPerfilEmpresaOutputDto {
  idPerfilEmpresa: number
  cuotaObligada: number
  cumpleLey: boolean
}

export class CrearPerfilEmpresaUseCase {
  constructor(
    private readonly perfilEmpresaRepository: IPerfilEmpresaRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: CrearPerfilEmpresaInputDto): Promise<CrearPerfilEmpresaOutputDto> {
    if (input.totalTrabajadores <= 0) {
      throw new BusinessRuleViolationError(
        'perfil_empresa',
        'El número de trabajadores debe ser mayor a cero',
      )
    }

    const existe = await this.perfilEmpresaRepository.existsByIdEmpresa(input.idEmpresa)
    if (existe) {
      throw new BusinessRuleViolationError(
        'RN-17',
        'La empresa ya tiene un perfil creado',
      )
    }

    const perfil = await this.perfilEmpresaRepository.save(
      new PerfilEmpresa({
        id: 0,
        idEmpresa: input.idEmpresa,
        descripcion: input.descripcion,
        sector: input.sector,
        tamano: input.tamano,
        tipoEntidad: input.tipoEntidad,
        urlLogo: input.urlLogo,
        sitioWeb: input.sitioWeb,
        politicaInclusion: input.politicaInclusion,
        totalTrabajadores: input.totalTrabajadores,
        fechaActualizacion: new Date(),
      }),
    )

    const cuotaObligada = perfil.calcularCuotaObligada()

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'perfil_empresa_creado',
      modulo: 'perfil',
      objetoAfectado: 'PerfilEmpresa',
      idObjetoAfectado: perfil.id,
      resultado: 'exitoso',
    })

    return {
      idPerfilEmpresa: perfil.id,
      cuotaObligada,
      cumpleLey: false,   
    }
  }
}

//  Editar perfil empresa 

export interface EditarPerfilEmpresaInputDto {
  idEmpresa: number
  idUsuario: number
  descripcion?: string
  sector?: string
  tamano?: TamanoEmpresa
  tipoEntidad?: TipoEntidad
  urlLogo?: string
  sitioWeb?: string
  politicaInclusion?: string
  totalTrabajadores?: number
}

export class EditarPerfilEmpresaUseCase {
  constructor(
    private readonly perfilEmpresaRepository: IPerfilEmpresaRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: EditarPerfilEmpresaInputDto): Promise<{ cuotaObligada: number }> {
    const perfil = await this.perfilEmpresaRepository.findByIdEmpresa(input.idEmpresa)
    if (!perfil) throw new EntityNotFoundError('PerfilEmpresa', input.idEmpresa)

    if (input.totalTrabajadores !== undefined && input.totalTrabajadores <= 0) {
      throw new BusinessRuleViolationError(
        'perfil_empresa',
        'El número de trabajadores debe ser mayor a cero',
      )
    }

    perfil.actualizarDatos({
      descripcion: input.descripcion,
      sector: input.sector,
      tamano: input.tamano,
      tipoEntidad: input.tipoEntidad,
      urlLogo: input.urlLogo,
      sitioWeb: input.sitioWeb,
      politicaInclusion: input.politicaInclusion,
      totalTrabajadores: input.totalTrabajadores,
    })

    await this.perfilEmpresaRepository.update(perfil)

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'perfil_empresa_actualizado',
      modulo: 'perfil',
      objetoAfectado: 'PerfilEmpresa',
      idObjetoAfectado: perfil.id,
      resultado: 'exitoso',
    })

    return { cuotaObligada: perfil.calcularCuotaObligada() }
  }
}

//  Gestionar usuarios reclutadores 

export interface GestionarReclutadorInputDto {
  idEmpresa: number
  idAdministrador: number
  accion: 'agregar' | 'desactivar'
  idUsuarioReclutador: number
}

export class GestionarUsuariosReclutadoresUseCase {
  constructor(
    private readonly perfilEmpresaRepository: IPerfilEmpresaRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: GestionarReclutadorInputDto): Promise<void> {
    const perfil = await this.perfilEmpresaRepository.findByIdEmpresa(input.idEmpresa)
    if (!perfil) throw new EntityNotFoundError('PerfilEmpresa', input.idEmpresa)

    // La lógica de reclutadores se gestiona en la capa de infraestructura
    // a través de la tabla usuario_rol con el rol 'reclutador'
    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: `reclutador_${input.accion}`,
      modulo: 'perfil',
      objetoAfectado: 'Usuario',
      idObjetoAfectado: input.idUsuarioReclutador,
      resultado: 'exitoso',
    })
  }
}
