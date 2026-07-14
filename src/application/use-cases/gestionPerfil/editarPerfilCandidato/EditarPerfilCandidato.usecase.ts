import { IPerfilCandidatoRepository } from '../../../../domain/repositories/gestionPerfil/IPerfilCandidatoRepository'
import {
  IHabilidadRepository,
  IExperienciaLaboralRepository,
  IFormacionAcademicaRepository,
  ITipoDiscapacidadRepository,
  IAjusteRazonableRequeridoRepository,
} from '../../../../domain/repositories/gestionPerfil/PerfilRepositories'
import { INotificationService } from '../../../ports/INotificationService'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { Habilidad } from '../../../../domain/entities/gestionPerfil/Habilidad.entity'
import { ExperienciaLaboral } from '../../../../domain/entities/gestionPerfil/ExperienciaLaboral.entity'
import { FormacionAcademica } from '../../../../domain/entities/gestionPerfil/FormacionAcademica.entity'
import { AjusteRazonableRequerido } from '../../../../domain/entities/gestionPerfil/AjusteRazonableRequerido.entity'
import { NivelEducativo, NivelHabilidad, TipoHabilidad, TipoAjusteRazonable, PrioridadAjuste } from '../../../../domain/enums/PerfilEnums.enum'
import { EntityNotFoundError, BusinessRuleViolationError } from '../../../../domain/errors/DomainError'

// Editar perfil base

export interface EditarPerfilBaseInputDto {
  idCandidato: number
  idUsuario: number
  resumenProfesional?: string
  nivelEducativo?: NivelEducativo
}

export class EditarPerfilCandidatoUseCase {
  constructor(
    private readonly perfilRepository: IPerfilCandidatoRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: EditarPerfilBaseInputDto): Promise<void> {
    const perfil = await this.perfilRepository.findByIdCandidato(input.idCandidato)
    if (!perfil) throw new EntityNotFoundError('PerfilCandidato', input.idCandidato)

    perfil.actualizarDatos({
      resumenProfesional: input.resumenProfesional,
      nivelEducativo: input.nivelEducativo,
    })

    await this.perfilRepository.update(perfil)

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'perfil_candidato_editado',
      modulo: 'perfil',
      objetoAfectado: 'PerfilCandidato',
      idObjetoAfectado: perfil.id,
      resultado: 'exitoso',
    })
  }
}

//  Actualizar habilidades 

export interface HabilidadInputDto {
  nombre: string
  nivel: NivelHabilidad
  tipo: TipoHabilidad
}

export interface ActualizarHabilidadesInputDto {
  idCandidato: number
  idUsuario: number
  habilidades: HabilidadInputDto[]
}

export class ActualizarHabilidadesUseCase {
  constructor(
    private readonly perfilRepository: IPerfilCandidatoRepository,
    private readonly habilidadRepository: IHabilidadRepository,
  ) {}

  async execute(input: ActualizarHabilidadesInputDto): Promise<void> {
    const perfil = await this.perfilRepository.findByIdCandidato(input.idCandidato)
    if (!perfil) throw new EntityNotFoundError('PerfilCandidato', input.idCandidato)

    // Eliminar las anteriores y reemplazar con las nuevas (sync completo)
    await this.habilidadRepository.deleteByIdPerfil(perfil.id)

    for (const h of input.habilidades) {
      await this.habilidadRepository.save(
        new Habilidad({
          id: 0,
          idPerfil: perfil.id,
          nombre: h.nombre,
          nivel: h.nivel,
          tipo: h.tipo,
        }),
      )
    }
  }
}

//  Actualizar experiencias laborales 

export interface ExperienciaInputDto {
  id?: number
  cargo: string
  empresa: string
  fechaInicio: string
  fechaFin?: string
  trabajoActual: boolean
  descripcion?: string
}

export interface ActualizarExperienciasInputDto {
  idCandidato: number
  experiencias: ExperienciaInputDto[]
}

export class ActualizarExperienciasLaboralesUseCase {
  constructor(
    private readonly perfilRepository: IPerfilCandidatoRepository,
    private readonly experienciaRepository: IExperienciaLaboralRepository,
  ) {}

  async execute(input: ActualizarExperienciasInputDto): Promise<void> {
    const perfil = await this.perfilRepository.findByIdCandidato(input.idCandidato)
    if (!perfil) throw new EntityNotFoundError('PerfilCandidato', input.idCandidato)

    const experienciasActuales = await this.experienciaRepository.findByIdPerfil(perfil.id)

    for (const exp of input.experiencias) {
      if (exp.id) {
        const existente = experienciasActuales.find(e => e.id === exp.id)
        if (existente) {
          existente.actualizar({
            cargo: exp.cargo,
            empresa: exp.empresa,
            fechaInicio: new Date(exp.fechaInicio),
            fechaFin: exp.fechaFin ? new Date(exp.fechaFin) : undefined,
            trabajoActual: exp.trabajoActual,
            descripcion: exp.descripcion,
          })
          await this.experienciaRepository.update(existente)
        }
      } else {
        await this.experienciaRepository.save(
          new ExperienciaLaboral({
            id: 0,
            idPerfil: perfil.id,
            cargo: exp.cargo,
            empresa: exp.empresa,
            fechaInicio: new Date(exp.fechaInicio),
            fechaFin: exp.fechaFin ? new Date(exp.fechaFin) : undefined,
            trabajoActual: exp.trabajoActual,
            descripcion: exp.descripcion,
          }),
        )
      }
    }
  }
}

//  Actualizar formación académica 

export interface FormacionInputDto {
  id?: number
  institucion: string
  titulo: string
  nivel: NivelEducativo
  fechaInicio?: string
  fechaFin?: string
  enCurso: boolean
}

export interface ActualizarFormacionInputDto {
  idCandidato: number
  formaciones: FormacionInputDto[]
}

export class ActualizarFormacionAcademicaUseCase {
  constructor(
    private readonly perfilRepository: IPerfilCandidatoRepository,
    private readonly formacionRepository: IFormacionAcademicaRepository,
  ) {}

  async execute(input: ActualizarFormacionInputDto): Promise<void> {
    const perfil = await this.perfilRepository.findByIdCandidato(input.idCandidato)
    if (!perfil) throw new EntityNotFoundError('PerfilCandidato', input.idCandidato)

    const formacionesActuales = await this.formacionRepository.findByIdPerfil(perfil.id)

    for (const f of input.formaciones) {
      if (f.id) {
        const existente = formacionesActuales.find(x => x.id === f.id)
        if (existente) {
          existente.actualizar({
            institucion: f.institucion,
            titulo: f.titulo,
            nivel: f.nivel,
            fechaInicio: f.fechaInicio ? new Date(f.fechaInicio) : undefined,
            fechaFin: f.fechaFin ? new Date(f.fechaFin) : undefined,
            enCurso: f.enCurso,
          })
          await this.formacionRepository.update(existente)
        }
      } else {
        await this.formacionRepository.save(
          new FormacionAcademica({
            id: 0,
            idPerfil: perfil.id,
            institucion: f.institucion,
            titulo: f.titulo,
            nivel: f.nivel,
            fechaInicio: f.fechaInicio ? new Date(f.fechaInicio) : undefined,
            fechaFin: f.fechaFin ? new Date(f.fechaFin) : undefined,
            enCurso: f.enCurso,
          }),
        )
      }
    }
  }
}
