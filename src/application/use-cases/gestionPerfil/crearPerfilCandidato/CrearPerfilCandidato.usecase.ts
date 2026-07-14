import { IPerfilCandidatoRepository } from '../../../../domain/repositories/gestionPerfil/IPerfilCandidatoRepository'
import {
  ITipoDiscapacidadRepository,
  IAjusteRazonableRequeridoRepository,
  IHabilidadRepository,
} from '../../../../domain/repositories/gestionPerfil/PerfilRepositories'
import { INotificationService } from '../../../ports/INotificationService'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { PerfilCandidato } from '../../../../domain/entities/gestionPerfil/PerfilCandidato.entity'
import { AjusteRazonableRequerido } from '../../../../domain/entities/gestionPerfil/AjusteRazonableRequerido.entity'
import { NivelEducativo, TipoAjusteRazonable, PrioridadAjuste } from '../../../../domain/enums/PerfilEnums.enum'
import {
  BusinessRuleViolationError,
  DuplicateEntityError,
  EntityNotFoundError,
} from '../../../../domain/errors/DomainError'

export interface CrearPerfilCandidatoInputDto {
  idCandidato: number
  idUsuario: number
  resumenProfesional?: string
  nivelEducativo?: NivelEducativo
  idsTiposDiscapacidad: number[]
  ajustesRequeridos?: {
    descripcion: string
    tipo: TipoAjusteRazonable
    prioridad: PrioridadAjuste
  }[]
}

export interface CrearPerfilCandidatoOutputDto {
  idPerfil: number
  porcentajeCompletitud: number
  mensajeSiguientePaso: string
}

export class CrearPerfilCandidatoUseCase {
  constructor(
    private readonly perfilRepository: IPerfilCandidatoRepository,
    private readonly tipoDiscapacidadRepository: ITipoDiscapacidadRepository,
    private readonly ajusteRequeridoRepository: IAjusteRazonableRequeridoRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: CrearPerfilCandidatoInputDto): Promise<CrearPerfilCandidatoOutputDto> {
    
    // Verificar que no exista ya un perfil
    const existe = await this.perfilRepository.existsByIdCandidato(input.idCandidato)
    if (existe) throw new DuplicateEntityError('PerfilCandidato', 'candidato')

    // RN-11: al menos un tipo de discapacidad obligatorio
    if (!input.idsTiposDiscapacidad || input.idsTiposDiscapacidad.length === 0) {
      throw new BusinessRuleViolationError(
        'RN-11',
        'Debe indicar al menos un tipo de discapacidad',
      )
    }

    // RN-13: validar que los tipos existan (categorías CONADIS)
    const tiposValidos = await this.tipoDiscapacidadRepository.findByIds(input.idsTiposDiscapacidad)
    if (tiposValidos.length !== input.idsTiposDiscapacidad.length) {
      throw new EntityNotFoundError('TipoDiscapacidad', 'uno o más tipos no encontrados')
    }

    // Crear perfil
    const perfil = await this.perfilRepository.save(
      new PerfilCandidato({
        id: 0,
        idCandidato: input.idCandidato,
        resumenProfesional: input.resumenProfesional,
        nivelEducativo: input.nivelEducativo,
        visible: true,
        porcentajeCompletitud: 0,
        fechaActualizacion: new Date(),
      }),
    )

    // Asociar tipos de discapacidad
    await this.tipoDiscapacidadRepository.syncPerfilDiscapacidades(
      perfil.id,
      input.idsTiposDiscapacidad,
    )

    // Ajustes razonables requeridos (opcionales)
    if (input.ajustesRequeridos && input.ajustesRequeridos.length > 0) {
      for (const ajuste of input.ajustesRequeridos) {
        await this.ajusteRequeridoRepository.save(
          new AjusteRazonableRequerido({
            id: 0,
            idPerfil: perfil.id,
            descripcion: ajuste.descripcion,
            tipo: ajuste.tipo,
            prioridad: ajuste.prioridad,
          }),
        )
      }
    }

    // Calcular completitud inicial
    const porcentaje = this.calcularCompletitud(input)
    perfil.actualizarPorcentaje(porcentaje)
    await this.perfilRepository.update(perfil)

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'perfil_candidato_creado',
      modulo: 'perfil',
      objetoAfectado: 'PerfilCandidato',
      idObjetoAfectado: perfil.id,
      resultado: 'exitoso',
    })

    return {
      idPerfil: perfil.id,
      porcentajeCompletitud: porcentaje,
      mensajeSiguientePaso: 'Perfil creado. Ahora sube tu CV para completarlo.',
    }
  }

  // RN-11: perfil completo requiere discapacidad, nivel educativo y CV (este UC cubre los primeros)
  private calcularCompletitud(input: CrearPerfilCandidatoInputDto): number {
    let puntos = 0
    if (input.idsTiposDiscapacidad.length > 0) puntos += 40
    if (input.nivelEducativo) puntos += 20
    if (input.resumenProfesional) puntos += 10
    if (input.ajustesRequeridos && input.ajustesRequeridos.length > 0) puntos += 10
    // El 20% restante lo aporta el CV (módulo posterior)
    return Math.min(puntos, 80)
  }
}
