import { Usuario } from '@domain/entities/accesoRegistro/Usuario.entity'
import { Candidato } from '@domain/entities/accesoRegistro/Candidato.entity'
import { CredencialAcceso } from '@domain/entities/accesoRegistro/CredencialAcceso.entity'
import { PreferenciaAccesibilidad } from '@domain/entities/accesoRegistro/PreferenciaAccesibilidad.entity'

import { Email } from '@domain/value-objects/Email.vo'
import { Dni } from '@domain/value-objects/Dni.vo'

import { EstadoUsuario } from '@domain/enums/EstadoUsuario.enum'

import { IUsuarioRepository } from '@domain/repositories/accesoRegistro/IUsuarioRepository'
import { ICandidatoRepository } from '@domain/repositories/accesoRegistro/ICandidatoRepository'
import { ICredencialAccesoRepository } from '@domain/repositories/accesoRegistro/ICredencialAccesoRepository'
import { IPreferenciaAccesibilidadRepository } from '@domain/repositories/accesoRegistro/IPreferenciaAccesibilidadRepository'
import { IRolRepository } from '@domain/repositories/accesoRegistro/IRolRepository'

import { IPasswordHasher } from '@domain/services/IPasswordHasher'

import { DuplicateEntityError, EntityNotFoundError } from '@domain/errors/DomainError'

import { IAuditLoggerService } from '@application/ports/IAuditLoggerService'
import { IEmailService } from '@application/ports/IEmailService'
import { IUnitWork } from '@application/ports/IUnitOfWork'
import { ILogger } from '@application/ports/ILogger'

import { RegistrarCandidatoInputDto } from '@application/use-cases/accesoRegistro/registrarCandidato/RegistrarCandidatoInput.dto'
import { RegistrarCandidatoOutputDto } from '@application/use-cases/accesoRegistro/registrarCandidato/RegistrarCandidatoOutput.dto'

export class RegistrarCandidatoUseCase {
  constructor(
    private readonly unitOfWork: IUnitWork,
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly candidatoRepository: ICandidatoRepository,
    private readonly credencialRepository: ICredencialAccesoRepository,
    private readonly preferenciaRepository: IPreferenciaAccesibilidadRepository,
    private readonly rolRepository: IRolRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly auditLogger: IAuditLoggerService,
    private readonly emailService: IEmailService,
    private readonly logger: ILogger
  ) {}

  async execute(input: RegistrarCandidatoInputDto): Promise<RegistrarCandidatoOutputDto> {
    const email = new Email(input.correo)

    const correoExistente = await this.usuarioRepository.existsByCorreo(email.getValue())
    if (correoExistente) {
      throw new DuplicateEntityError('Usuario', 'correo electrónico')
    }

    const dni = new Dni(input.dni)
    const dniExistente = await this.candidatoRepository.existsByDni(dni.getValue())
    if (dniExistente) {
      throw new DuplicateEntityError('Candidato', 'DNI')
    }

    const contrasenaHash = await this.passwordHasher.hash(input.contrasena)

    const { usuario, candidato } = await this.unitOfWork.execute(async () => {
      
      const usuario = await this.usuarioRepository.save(
        new Usuario({
          id: 0,
          correo: email,
          contrasenaHash,
          estado: EstadoUsuario.ACTIVO,
          intentosFallidos: 0,
          fechaRegistro: new Date(),
        }),
      )

      const candidato = await this.candidatoRepository.save(
        new Candidato({
          id: 0,
          idUsuario: usuario.id,
          nombres: input.nombres,
          apellidos: input.apellidos,
          dni,
          fechaNacimiento: new Date(input.fechaNacimiento),
          telefono: input.telefono,
          distrito: input.distrito,
        }),
      )

      await this.credencialRepository.save(
        new CredencialAcceso({
          id: 0,
          idUsuario: usuario.id,
        }),
      )

      const preferencia = PreferenciaAccesibilidad.crearPorDefecto(0, usuario.id)
      if (input.preferenciasAccesibilidad) {
        preferencia.actualizar(input.preferenciasAccesibilidad)
      }
      await this.preferenciaRepository.save(preferencia)

      const rolCandidato = await this.rolRepository.findByNombre('candidato')
      if (!rolCandidato) throw new EntityNotFoundError('Rol', 'candidato')
      await this.rolRepository.assignRolToUsuario(usuario.id, rolCandidato.id)
    
      return { usuario, candidato }
    })

    await this.auditLogger.log({
      idUsuario: usuario.id,
      accion: 'registro_candidato',
      modulo: 'acceso',
      objetoAfectado: 'Candidato',
      idObjetoAfectado: candidato.id,
      resultado: 'exitoso',
    })
    try {
      await this.emailService.sendWelcomeEmail(email.getValue(), candidato.getNombres())
    }
    catch (error) {
      this.logger.error('No se pudo enviar el correo de bienvenida: ', {  
        err: error
      })
    }

    return {
      idUsuario: usuario.id,
      idCandidato: candidato.id,
      correo: email.getValue(),
      nombreCompleto: candidato.getNombreCompleto(),
      distrito: candidato.getDistrito(),
      fechaRegistro: usuario.fechaRegistro,
    }
  }
}
