import { IUsuarioRepository } from '../../../../domain/repositories/accesoRegistro/IUsuarioRepository'
import { ICredencialAccesoRepository } from '../../../../domain/repositories/accesoRegistro/ICredencialAccesoRepository'
import { IPasswordHasher } from '../../../../domain/services/IPasswordHasher'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { BusinessRuleViolationError, EntityNotFoundError } from '../../../../domain/errors/DomainError'

export interface ActualizarContrasenaInputDto {
  idUsuario: number
  token: string
  nuevaContrasena: string
  confirmacionContrasena: string
}

export class ActualizarContrasenaUseCase {
  private static readonly MIN_LONGITUD_CONTRASENA = 8

  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly credencialRepository: ICredencialAccesoRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: ActualizarContrasenaInputDto): Promise<void> {
    if (input.nuevaContrasena !== input.confirmacionContrasena) {
      throw new BusinessRuleViolationError('contrasena', 'Las contraseñas no coinciden')
    }

    if (input.nuevaContrasena.length < ActualizarContrasenaUseCase.MIN_LONGITUD_CONTRASENA) {
      throw new BusinessRuleViolationError(
        'contrasena',
        `La contraseña debe tener al menos ${ActualizarContrasenaUseCase.MIN_LONGITUD_CONTRASENA} caracteres`,
      )
    }

    const usuario = await this.usuarioRepository.findById(input.idUsuario)
    if (!usuario) throw new EntityNotFoundError('Usuario', input.idUsuario)

    const credencial = await this.credencialRepository.findByIdUsuario(input.idUsuario)
    if (!credencial) throw new EntityNotFoundError('CredencialAcceso', input.idUsuario)

    // RN-06: validar token y expiración (lógica en entidad)
    credencial.validarToken(input.token)

    const nuevoHash = await this.passwordHasher.hash(input.nuevaContrasena)
    usuario.actualizarContrasena(nuevoHash)
    credencial.registrarCambioContrasena()

    await this.usuarioRepository.update(usuario)
    await this.credencialRepository.update(credencial)

    await this.auditLogger.log({
      idUsuario: usuario.id,
      accion: 'contrasena_cambiada',
      modulo: 'acceso',
      resultado: 'exitoso',
    })
  }
}
