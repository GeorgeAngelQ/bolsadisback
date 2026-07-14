import { IUsuarioRepository } from '../../../../domain/repositories/accesoRegistro/IUsuarioRepository'
import { IPreferenciaAccesibilidadRepository } from '../../../../domain/repositories/accesoRegistro/IPreferenciaAccesibilidadRepository'
import { IRolRepository } from '../../../../domain/repositories/accesoRegistro/IRolRepository'
import { IPasswordHasher } from '../../../../domain/services/IPasswordHasher'
import { ITokenGenerator } from '../../../../domain/services/ITokenGenerator'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { INotificationService } from '../../../ports/INotificationService'
import { EstadoUsuario } from '../../../../domain/enums/EstadoUsuario.enum'
import {
  BusinessRuleViolationError,
  EntityNotFoundError,
  InvalidEntityStateError,
} from '../../../../domain/errors/DomainError'
import { IniciarSesionInputDto } from './IniciarSesionInput.dto'
import { IniciarSesionOutputDto } from './IniciarSesionOutput.dto'

export class IniciarSesionUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly preferenciaRepository: IPreferenciaAccesibilidadRepository,
    private readonly rolRepository: IRolRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenGenerator: ITokenGenerator,
    private readonly auditLogger: IAuditLoggerService,
    private readonly notificationService: INotificationService,
  ) {}

  async execute(input: IniciarSesionInputDto): Promise<IniciarSesionOutputDto> {
    // Buscar usuario por correo
    const usuario = await this.usuarioRepository.findByCorreo(input.correo)
    if (!usuario) {
      // No revelamos si el correo existe o no
      throw new BusinessRuleViolationError('autenticacion', 'Credenciales incorrectas')
    }

    // RN-05: verificar estado de la cuenta
    if (usuario.getEstado() === EstadoUsuario.ELIMINADO) {
      throw new InvalidEntityStateError('Usuario', 'iniciar sesión')
    }

    if (usuario.estaSuspendido()) {
      await this.auditLogger.log({
        idUsuario: usuario.id,
        accion: 'login_fallido_cuenta_suspendida',
        modulo: 'acceso',
        ipOrigen: input.ipOrigen,
        resultado: 'fallido',
        detalle: 'Intento de acceso a cuenta suspendida',
      })
      throw new InvalidEntityStateError('Usuario', 'Tu cuenta está suspendida. Contacta al administrador')
    }

    // Verificar contraseña
    const contrasenaValida = await this.passwordHasher.compare(
      input.contrasena,
      usuario.getContrasenaHash(),
    )

    if (!contrasenaValida) {
      // RN-05: incrementar intentos fallidos
      usuario.registrarIntentoFallido()
      await this.usuarioRepository.update(usuario)

      // Si la cuenta quedó suspendida tras este intento
      if (usuario.estaSuspendido()) {
        await this.notificationService.notificar(
          usuario.id,
          'Cuenta bloqueada',
          'Tu cuenta fue bloqueada por múltiples intentos fallidos. Usa "Recuperar contraseña" para desbloquearla.',
        )
        await this.auditLogger.log({
          idUsuario: usuario.id,
          accion: 'cuenta_bloqueada_por_intentos',
          modulo: 'acceso',
          ipOrigen: input.ipOrigen,
          resultado: 'fallido',
        })
        throw new BusinessRuleViolationError(
          'RN-05',
          'Cuenta bloqueada por múltiples intentos fallidos. Revisa tu correo para desbloquearla',
        )
      }

      throw new BusinessRuleViolationError('autenticacion', 'Credenciales incorrectas')
    }

    // Login exitoso
    usuario.resetearIntentosFallidos()
    usuario.registrarAcceso()
    await this.usuarioRepository.update(usuario)

    // Obtener rol
    const roles = await this.rolRepository.findRolesByUsuarioId(usuario.id)
    const rol = roles[0]?.getNombre() ?? 'candidato'

    // Generar token JWT
    const accessToken = this.tokenGenerator.generateAccessToken({
      idUsuario: usuario.id,
      rol,
      correo: usuario.getCorreo(),
    })

    // Cargar preferencias de accesibilidad
    const preferencia = await this.preferenciaRepository.findByIdUsuario(usuario.id)

    await this.auditLogger.log({
      idUsuario: usuario.id,
      accion: 'login',
      modulo: 'acceso',
      ipOrigen: input.ipOrigen,
      resultado: 'exitoso',
    })

    return {
      accessToken,
      idUsuario: usuario.id,
      correo: usuario.getCorreo(),
      rol,
      preferenciasAccesibilidad: preferencia
        ? preferencia.toPlainObject()
        : {
            tipoContraste: 'normal',
            tamanoTexto: 'mediano',
            subtitulosActivos: false,
            lenguaSenas: false,
            lectorPantalla: false,
            lenguajeSencillo: false,
          },
    }
  }
}
