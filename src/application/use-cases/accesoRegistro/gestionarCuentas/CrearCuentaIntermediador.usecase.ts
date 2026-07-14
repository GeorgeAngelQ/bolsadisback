import { IUsuarioRepository } from '../../../../domain/repositories/accesoRegistro/IUsuarioRepository'
import { IIntermediadorLaboralRepository } from '../../../../domain/repositories/accesoRegistro/IIntermediadorLaboralRepository'
import { ICredencialAccesoRepository } from '../../../../domain/repositories/accesoRegistro/ICredencialAccesoRepository'
import { IPreferenciaAccesibilidadRepository } from '../../../../domain/repositories/accesoRegistro/IPreferenciaAccesibilidadRepository'
import { IRolRepository } from '../../../../domain/repositories/accesoRegistro/IRolRepository'
import { IPasswordHasher } from '../../../../domain/services/IPasswordHasher'
import { ITokenGenerator } from '../../../../domain/services/ITokenGenerator'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { IEmailService } from '../../../ports/IEmailService'
import { Usuario } from '../../../../domain/entities/accesoRegistro/Usuario.entity'
import { IntermediadorLaboral } from '../../../../domain/entities/accesoRegistro/IntermediadorLaboral.entity'
import { CredencialAcceso } from '../../../../domain/entities/accesoRegistro/CredencialAcceso.entity'
import { PreferenciaAccesibilidad } from '../../../../domain/entities/accesoRegistro/PreferenciaAccesibilidad.entity'
import { Email } from '../../../../domain/value-objects/Email.vo'
import { Dni } from '../../../../domain/value-objects/Dni.vo'
import { EstadoUsuario } from '../../../../domain/enums/EstadoUsuario.enum'
import { DuplicateEntityError } from '../../../../domain/errors/DomainError'

export interface CrearCuentaIntermediadorInputDto {
  idAdministrador: number
  correo: string
  nombres: string
  apellidos: string
  dni: string
  entidadOrigen?: string
  telefono?: string
}

export interface CrearCuentaIntermediadorOutputDto {
  idUsuario: number
  idIntermediador: number
  correo: string
  nombreCompleto: string
}

export class CrearCuentaIntermediadorUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly intermediadorRepository: IIntermediadorLaboralRepository,
    private readonly credencialRepository: ICredencialAccesoRepository,
    private readonly preferenciaRepository: IPreferenciaAccesibilidadRepository,
    private readonly rolRepository: IRolRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenGenerator: ITokenGenerator,
    private readonly auditLogger: IAuditLoggerService,
    private readonly emailService: IEmailService,
  ) {}

  async execute(input: CrearCuentaIntermediadorInputDto): Promise<CrearCuentaIntermediadorOutputDto> {
    const email = new Email(input.correo)
    const dni = new Dni(input.dni)

    // RN-07: correo único
    const correoExistente = await this.usuarioRepository.existsByCorreo(email.getValue())
    if (correoExistente) throw new DuplicateEntityError('Usuario', 'correo electrónico')

    const dniExistente = await this.intermediadorRepository.existsByDni(dni.getValue())
    if (dniExistente) throw new DuplicateEntityError('IntermediadorLaboral', 'DNI')

    // Generar contraseña temporal
    const contrasenaTemp = this.tokenGenerator.generateRecoveryToken().slice(0, 10)
    const contrasenaHash = await this.passwordHasher.hash(contrasenaTemp)

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

    const intermediador = await this.intermediadorRepository.save(
      new IntermediadorLaboral({
        id: 0,
        idUsuario: usuario.id,
        nombres: input.nombres,
        apellidos: input.apellidos,
        dni,
        entidadOrigen: input.entidadOrigen,
        telefono: input.telefono,
      }),
    )

    await this.credencialRepository.save(
      new CredencialAcceso({ id: 0, idUsuario: usuario.id }),
    )

    await this.preferenciaRepository.save(
      PreferenciaAccesibilidad.crearPorDefecto(0, usuario.id),
    )

    const rolIntermediador = await this.rolRepository.findByNombre('intermediador')
    if (rolIntermediador) {
      await this.rolRepository.assignRolToUsuario(usuario.id, rolIntermediador.id)
    }

    await this.emailService.sendCredencialesEmail(email.getValue(), contrasenaTemp)

    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: 'intermediador_creado',
      modulo: 'acceso',
      objetoAfectado: 'IntermediadorLaboral',
      idObjetoAfectado: intermediador.id,
      resultado: 'exitoso',
    })

    return {
      idUsuario: usuario.id,
      idIntermediador: intermediador.id,
      correo: email.getValue(),
      nombreCompleto: intermediador.getNombreCompleto(),
    }
  }
}
