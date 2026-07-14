import { IPerfilCandidatoRepository } from '../../../../domain/repositories/gestionPerfil/IPerfilCandidatoRepository'
import { ICertificadoDiscapacidadRepository } from '../../../../domain/repositories/gestionPerfil/PerfilRepositories'
import { IFileStorageService } from '../../../ports/IFileStorageService'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { CertificadoDiscapacidad } from '../../../../domain/entities/gestionPerfil/CertificadoDiscapacidad.entity'
import { DuplicateEntityError, EntityNotFoundError } from '../../../../domain/errors/DomainError'

//  Registrar certificado 

export interface RegistrarCertificadoInputDto {
  idCandidato: number
  idUsuario: number
  numeroCarne: string
  fechaEmision: string
  fechaVencimiento?: string
  fileBuffer?: Buffer
  nombreArchivo?: string
  mimeType?: string
}

export interface RegistrarCertificadoOutputDto {
  idCertificado: number
  numeroCarne: string
  verificado: boolean
  estaVigente: boolean
  urlDocumento?: string
}

export class RegistrarCertificadoDiscapacidadUseCase {
  constructor(
    private readonly perfilRepository: IPerfilCandidatoRepository,
    private readonly certificadoRepository: ICertificadoDiscapacidadRepository,
    private readonly fileStorageService: IFileStorageService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: RegistrarCertificadoInputDto): Promise<RegistrarCertificadoOutputDto> {
    const perfil = await this.perfilRepository.findByIdCandidato(input.idCandidato)
    if (!perfil) throw new EntityNotFoundError('PerfilCandidato', input.idCandidato)

    // Número de carné único en el sistema
    const carneExistente = await this.certificadoRepository.existsByNumeroCarne(
      input.numeroCarne,
      perfil.id,
    )
    if (carneExistente) throw new DuplicateEntityError('CertificadoDiscapacidad', 'número de carné')

    let urlDocumento: string | undefined

    if (input.fileBuffer && input.nombreArchivo && input.mimeType) {
      urlDocumento = await this.fileStorageService.upload(
        input.fileBuffer,
        `certificados/${input.idCandidato}/${input.nombreArchivo}`,
        input.mimeType,
      )
    }

    let certificado = await this.certificadoRepository.findByIdPerfil(perfil.id)
    if (certificado) {
      certificado.actualizar({
        numeroCarne: input.numeroCarne,
        fechaEmision: new Date(input.fechaEmision),
        fechaVencimiento: input.fechaVencimiento ? new Date(input.fechaVencimiento) : undefined,
        urlDocumento,
      })
      await this.certificadoRepository.update(certificado)
    } else {
      certificado = await this.certificadoRepository.save(
        new CertificadoDiscapacidad({
          id: 0,
          idPerfil: perfil.id,
          numeroCarne: input.numeroCarne,
          fechaEmision: new Date(input.fechaEmision),
          fechaVencimiento: input.fechaVencimiento ? new Date(input.fechaVencimiento) : undefined,
          entidadEmisora: 'CONADIS',
          urlDocumento,
          verificado: false,
        }),
      )
    }

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'certificado_discapacidad_registrado',
      modulo: 'perfil',
      objetoAfectado: 'CertificadoDiscapacidad',
      idObjetoAfectado: certificado.id,
      resultado: 'exitoso',
    })

    return {
      idCertificado: certificado.id,
      numeroCarne: certificado.getNumeroCarne(),
      verificado: certificado.isVerificado(),
      estaVigente: certificado.estaVigente(),
      urlDocumento: certificado.getUrlDocumento(),
    }
  }
}

//  Verificar certificado (administrador) 

export class VerificarCertificadoDiscapacidadUseCase {
  constructor(
    private readonly certificadoRepository: ICertificadoDiscapacidadRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(idPerfil: number, idAdministrador: number): Promise<void> {
    const certificado = await this.certificadoRepository.findByIdPerfil(idPerfil)
    if (!certificado) throw new EntityNotFoundError('CertificadoDiscapacidad', idPerfil)

    certificado.verificar()
    await this.certificadoRepository.update(certificado)

    await this.auditLogger.log({
      idUsuario: idAdministrador,
      accion: 'certificado_verificado',
      modulo: 'administracion',
      objetoAfectado: 'CertificadoDiscapacidad',
      idObjetoAfectado: certificado.id,
      resultado: 'exitoso',
    })
  }
}
