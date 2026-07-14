import { IUsuarioRepository } from '../../../../domain/repositories/accesoRegistro/IUsuarioRepository'
import { ICandidatoRepository } from '../../../../domain/repositories/accesoRegistro/ICandidatoRepository'
import { ICredencialAccesoRepository } from '../../../../domain/repositories/accesoRegistro/ICredencialAccesoRepository'
import { IPreferenciaAccesibilidadRepository } from '../../../../domain/repositories/accesoRegistro/IPreferenciaAccesibilidadRepository'
import { IRolRepository } from '../../../../domain/repositories/accesoRegistro/IRolRepository'
import { IPasswordHasher } from '../../../../domain/services/IPasswordHasher'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { IEmailService } from '../../../ports/IEmailService'
import { Usuario } from '../../../../domain/entities/accesoRegistro/Usuario.entity'
import { Candidato } from '../../../../domain/entities/accesoRegistro/Candidato.entity'
import { CredencialAcceso } from '../../../../domain/entities/accesoRegistro/CredencialAcceso.entity'
import { PreferenciaAccesibilidad } from '../../../../domain/entities/accesoRegistro/PreferenciaAccesibilidad.entity'
import { Email } from '../../../../domain/value-objects/Email.vo'
import { Dni } from '../../../../domain/value-objects/Dni.vo'
import { EstadoUsuario } from '../../../../domain/enums/EstadoUsuario.enum'
import { DuplicateEntityError } from '../../../../domain/errors/DomainError'
import { RegistrarCandidatoInputDto } from './RegistrarCandidatoInput.dto'
import { RegistrarCandidatoOutputDto } from './RegistrarCandidatoOutput.dto'

export class RegistrarCandidatoUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly candidatoRepository: ICandidatoRepository,
    private readonly credencialRepository: ICredencialAccesoRepository,
    private readonly preferenciaRepository: IPreferenciaAccesibilidadRepository,
    private readonly rolRepository: IRolRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly auditLogger: IAuditLoggerService,
    private readonly emailService: IEmailService,
  ) {}

  async execute(input: RegistrarCandidatoInputDto): Promise<RegistrarCandidatoOutputDto> {
    const email = new Email(input.correo)

    // RN-07: correo único en el sistema
    const correoExistente = await this.usuarioRepository.existsByCorreo(email.getValue())
    if (correoExistente) {
      throw new DuplicateEntityError('Usuario', 'correo electrónico')
    }

    // RN-02: el DNI debe ser único (validado en el repositorio)
    const dni = new Dni(input.dni)
    const dniExistente = await this.candidatoRepository.existsByDni(dni.getValue())
    if (dniExistente) {
      throw new DuplicateEntityError('Candidato', 'DNI')
    }

    // Hash de contraseña
    const contrasenaHash = await this.passwordHasher.hash(input.contrasena)

    // Crear usuario base — RN-01 se valida en la entidad Candidato
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

    // Crear candidato
    const candidato = await this.candidatoRepository.save(
      new Candidato({
        id: 0,
        idUsuario: usuario.id,
        nombres: input.nombres,
        apellidos: input.apellidos,
        dni,
        fechaNacimiento: new Date(input.fechaNacimiento),
        telefono: input.telefono,
        distrito: input.distrito,   // RN-01: validado en la entidad
      }),
    )

    // Crear credencial de acceso
    await this.credencialRepository.save(
      new CredencialAcceso({
        id: 0,
        idUsuario: usuario.id,
      }),
    )

    // Crear preferencias de accesibilidad (por defecto o personalizadas)
    const preferencia = PreferenciaAccesibilidad.crearPorDefecto(0, usuario.id)
    if (input.preferenciasAccesibilidad) {
      preferencia.actualizar(input.preferenciasAccesibilidad)
    }
    await this.preferenciaRepository.save(preferencia)

    // Asignar rol candidato
    const rolCandidato = await this.rolRepository.findByNombre('candidato')
    if (rolCandidato) {
      await this.rolRepository.assignRolToUsuario(usuario.id, rolCandidato.id)
    }

    // Auditoría y bienvenida
    await this.auditLogger.log({
      idUsuario: usuario.id,
      accion: 'registro_candidato',
      modulo: 'acceso',
      objetoAfectado: 'Candidato',
      idObjetoAfectado: candidato.id,
      resultado: 'exitoso',
    })

    await this.emailService.sendWelcomeEmail(email.getValue(), candidato.getNombres())

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
