import { IPerfilCandidatoRepository } from '../../../../domain/repositories/gestionPerfil/IPerfilCandidatoRepository'
import { ICurriculumVitaeRepository } from '../../../../domain/repositories/gestionPerfil/PerfilRepositories'
import { IFileStorageService } from '../../../ports/IFileStorageService'
import { IAccessibilityCheckerService } from '../../../ports/IAccessibilityCheckerService'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { CurriculumVitae } from '../../../../domain/entities/gestionPerfil/CurriculumVitae.entity'
import { EntityNotFoundError, BusinessRuleViolationError } from '../../../../domain/errors/DomainError'

//  Subir CV 

export interface SubirCVInputDto {
  idCandidato: number
  idUsuario: number
  fileBuffer: Buffer
  nombreArchivo: string
  mimeType: string
  formato: 'pdf' | 'docx'
  tamanoBytes: number
}

export interface SubirCVOutputDto {
  urlCV: string
  accesible: boolean
  advertenciasAccesibilidad: string[]
  porcentajeCompletitud: number
}

const MAX_TAMANO_BYTES = 5 * 1024 * 1024  

export class SubirCVUseCase {
  constructor(
    private readonly perfilRepository: IPerfilCandidatoRepository,
    private readonly cvRepository: ICurriculumVitaeRepository,
    private readonly fileStorageService: IFileStorageService,
    private readonly accessibilityChecker: IAccessibilityCheckerService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: SubirCVInputDto): Promise<SubirCVOutputDto> {
    if (input.tamanoBytes > MAX_TAMANO_BYTES) {
      throw new BusinessRuleViolationError('cv', 'El archivo no puede superar 5MB')
    }

    CurriculumVitae.validarFormato(input.formato)

    const perfil = await this.perfilRepository.findByIdCandidato(input.idCandidato)
    if (!perfil) throw new EntityNotFoundError('PerfilCandidato', input.idCandidato)

    // Verificar accesibilidad — RN-19
    const resultadoAccesibilidad = await this.accessibilityChecker.verificarCV(
      input.fileBuffer,
      input.mimeType,
    )

    // Subir archivo al storage
    const url = await this.fileStorageService.upload(
      input.fileBuffer,
      `cv/${input.idCandidato}/${input.nombreArchivo}`,
      input.mimeType,
    )

    // Guardar o actualizar el CV
    let cv = await this.cvRepository.findByIdPerfil(perfil.id)
    if (cv) {
      cv.registrarSubida(url, input.formato, resultadoAccesibilidad.esAccesible)
      await this.cvRepository.update(cv)
    } else {
      cv = await this.cvRepository.save(
        new CurriculumVitae({
          id: 0,
          idPerfil: perfil.id,
          urlArchivo: url,
          formatoArchivo: input.formato,
          fechaSubida: new Date(),
          generadoPorPlataforma: false,
          accesible: resultadoAccesibilidad.esAccesible,
        }),
      )
    }

    // Recalcular completitud
    const nuevoPorcentaje = Math.min(perfil.getPorcentajeCompletitud() + 20, 100)
    perfil.actualizarPorcentaje(nuevoPorcentaje)
    await this.perfilRepository.update(perfil)

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'cv_subido',
      modulo: 'perfil',
      objetoAfectado: 'CurriculumVitae',
      idObjetoAfectado: cv.id,
      resultado: 'exitoso',
    })

    return {
      urlCV: url,
      accesible: resultadoAccesibilidad.esAccesible,
      advertenciasAccesibilidad: resultadoAccesibilidad.advertencias,
      porcentajeCompletitud: nuevoPorcentaje,
    }
  }
}

//  Generar CV automático 

export interface GenerarCVOutputDto {
  urlCV: string
  porcentajeCompletitud: number
}

export class GenerarCVAutomaticoUseCase {
  constructor(
    private readonly perfilRepository: IPerfilCandidatoRepository,
    private readonly cvRepository: ICurriculumVitaeRepository,
    private readonly fileStorageService: IFileStorageService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(idCandidato: number, idUsuario: number): Promise<GenerarCVOutputDto> {
    const perfil = await this.perfilRepository.findByIdCandidato(idCandidato)
    if (!perfil) throw new EntityNotFoundError('PerfilCandidato', idCandidato)

    // RN-12: necesita al menos datos básicos para generar
    if (perfil.getPorcentajeCompletitud() < 40) {
      throw new BusinessRuleViolationError(
        'RN-12',
        'Completa tu perfil antes de generar el CV automático',
      )
    }

    // En producción aquí se integraría un generador de PDF real
    const cvBuffer = Buffer.from(`CV generado para candidato ${idCandidato}`)
    const url = await this.fileStorageService.upload(
      cvBuffer,
      `cv/${idCandidato}/cv-generado.pdf`,
      'application/pdf',
    )

    let cv = await this.cvRepository.findByIdPerfil(perfil.id)
    if (cv) {
      cv.registrarGeneracion(url)
      await this.cvRepository.update(cv)
    } else {
      cv = await this.cvRepository.save(
        new CurriculumVitae({
          id: 0,
          idPerfil: perfil.id,
          urlArchivo: url,
          formatoArchivo: 'pdf',
          fechaSubida: new Date(),
          generadoPorPlataforma: true,
          accesible: true,
        }),
      )
    }

    const nuevoPorcentaje = Math.min(perfil.getPorcentajeCompletitud() + 20, 100)
    perfil.actualizarPorcentaje(nuevoPorcentaje)
    await this.perfilRepository.update(perfil)

    await this.auditLogger.log({
      idUsuario,
      accion: 'cv_generado',
      modulo: 'perfil',
      objetoAfectado: 'CurriculumVitae',
      idObjetoAfectado: cv.id,
      resultado: 'exitoso',
    })

    return { urlCV: url, porcentajeCompletitud: nuevoPorcentaje }
  }
}

// ---------- Descargar CV ----------

export class DescargarCVUseCase {
  constructor(
    private readonly perfilRepository: IPerfilCandidatoRepository,
    private readonly cvRepository: ICurriculumVitaeRepository,
    private readonly fileStorageService: IFileStorageService,
  ) {}

  async execute(idCandidato: number): Promise<string> {
    const perfil = await this.perfilRepository.findByIdCandidato(idCandidato)
    if (!perfil) throw new EntityNotFoundError('PerfilCandidato', idCandidato)

    const cv = await this.cvRepository.findByIdPerfil(perfil.id)
    if (!cv || !cv.tieneArchivo()) {
      throw new EntityNotFoundError('CurriculumVitae', idCandidato)
    }

    return this.fileStorageService.getSignedUrl(cv.getUrlArchivo()!)
  }
}
