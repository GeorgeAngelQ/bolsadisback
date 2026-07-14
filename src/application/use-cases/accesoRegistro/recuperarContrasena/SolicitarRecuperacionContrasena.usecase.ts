import { IUsuarioRepository } from '../../../../domain/repositories/accesoRegistro/IUsuarioRepository'
import { ICredencialAccesoRepository } from '../../../../domain/repositories/accesoRegistro/ICredencialAccesoRepository'
import { ITokenGenerator } from '../../../../domain/services/ITokenGenerator'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { IEmailService } from '../../../ports/IEmailService'
import { EstadoUsuario } from '../../../../domain/enums/EstadoUsuario.enum'

export interface SolicitarRecuperacionInputDto {
  correo: string
  ipOrigen?: string
}

export class SolicitarRecuperacionContrasenaUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly credencialRepository: ICredencialAccesoRepository,
    private readonly tokenGenerator: ITokenGenerator,
    private readonly auditLogger: IAuditLoggerService,
    private readonly emailService: IEmailService,
  ) {}

  async execute(input: SolicitarRecuperacionInputDto): Promise<void> {
    // Respuesta neutral por seguridad (no revelar si el correo existe)
    const usuario = await this.usuarioRepository.findByCorreo(input.correo)

    if (!usuario || usuario.getEstado() !== EstadoUsuario.ACTIVO) {
      // Respuesta silenciosa — RN seguridad
      return
    }

    const credencial = await this.credencialRepository.findByIdUsuario(usuario.id)
    if (!credencial) return

    const token = this.tokenGenerator.generateRecoveryToken()

    // RN-06: el token se guarda con expiración de 24 horas (lógica en la entidad)
    credencial.guardarToken(token)
    await this.credencialRepository.update(credencial)

    await this.emailService.sendRecoveryEmail(usuario.getCorreo(), token)

    await this.auditLogger.log({
      idUsuario: usuario.id,
      accion: 'recuperacion_solicitada',
      modulo: 'acceso',
      ipOrigen: input.ipOrigen,
      resultado: 'exitoso',
    })
  }
}
