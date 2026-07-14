import { IUsuarioRepository } from '../../../../domain/repositories/accesoRegistro/IUsuarioRepository'
import { IEmpresaEmpleadoraRepository } from '../../../../domain/repositories/accesoRegistro/IEmpresaEmpleadoraRepository'
import { ICredencialAccesoRepository } from '../../../../domain/repositories/accesoRegistro/ICredencialAccesoRepository'
import { IPreferenciaAccesibilidadRepository } from '../../../../domain/repositories/accesoRegistro/IPreferenciaAccesibilidadRepository'
import { IRolRepository } from '../../../../domain/repositories/accesoRegistro/IRolRepository'
import { IPasswordHasher } from '../../../../domain/services/IPasswordHasher'
import { IAuditLoggerService } from '../../../ports/IAuditLoggerService'
import { IEmailService } from '../../../ports/IEmailService'
import { Usuario } from '../../../../domain/entities/accesoRegistro/Usuario.entity'
import { EmpresaEmpleadora } from '../../../../domain/entities/accesoRegistro/EmpresaEmpleadora.entity'
import { CredencialAcceso } from '../../../../domain/entities/accesoRegistro/CredencialAcceso.entity'
import { PreferenciaAccesibilidad } from '../../../../domain/entities/accesoRegistro/PreferenciaAccesibilidad.entity'
import { Email } from '../../../../domain/value-objects/Email.vo'
import { Ruc } from '../../../../domain/value-objects/Ruc.vo'
import { EstadoUsuario } from '../../../../domain/enums/EstadoUsuario.enum'
import { DuplicateEntityError } from '../../../../domain/errors/DomainError'
import { RegistrarEmpresaInputDto } from './RegistrarEmpresaInput.dto'
import { RegistrarEmpresaOutputDto } from './RegistrarEmpresaOutput.dto'

export class RegistrarEmpresaUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly empresaRepository: IEmpresaEmpleadoraRepository,
    private readonly credencialRepository: ICredencialAccesoRepository,
    private readonly preferenciaRepository: IPreferenciaAccesibilidadRepository,
    private readonly rolRepository: IRolRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly auditLogger: IAuditLoggerService,
    private readonly emailService: IEmailService,
  ) {}

  async execute(input: RegistrarEmpresaInputDto): Promise<RegistrarEmpresaOutputDto> {
    const email = new Email(input.correo)
    const ruc = new Ruc(input.ruc)

    // RN-07: correo único
    const correoExistente = await this.usuarioRepository.existsByCorreo(email.getValue())
    if (correoExistente) {
      throw new DuplicateEntityError('Usuario', 'correo electrónico')
    }

    // RN-17: RUC único por empresa
    const rucExistente = await this.empresaRepository.existsByRuc(ruc.getValue())
    if (rucExistente) {
      throw new DuplicateEntityError('EmpresaEmpleadora', 'RUC')
    }

    const contrasenaHash = await this.passwordHasher.hash(input.contrasena)

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

    const empresa = await this.empresaRepository.save(
      new EmpresaEmpleadora({
        id: 0,
        idUsuario: usuario.id,
        razonSocial: input.razonSocial,
        ruc,
        representanteLegal: input.representanteLegal,
        telefonoEmpresa: input.telefonoEmpresa,
        correoEmpresa: input.correoEmpresa,
      }),
    )

    await this.credencialRepository.save(
      new CredencialAcceso({ id: 0, idUsuario: usuario.id }),
    )

    await this.preferenciaRepository.save(
      PreferenciaAccesibilidad.crearPorDefecto(0, usuario.id),
    )

    const rolEmpresa = await this.rolRepository.findByNombre('empresa')
    if (rolEmpresa) {
      await this.rolRepository.assignRolToUsuario(usuario.id, rolEmpresa.id)
    }

    await this.auditLogger.log({
      idUsuario: usuario.id,
      accion: 'registro_empresa',
      modulo: 'acceso',
      objetoAfectado: 'EmpresaEmpleadora',
      idObjetoAfectado: empresa.id,
      resultado: 'exitoso',
    })

    await this.emailService.sendWelcomeEmail(email.getValue(), empresa.getRazonSocial())

    return {
      idUsuario: usuario.id,
      idEmpresa: empresa.id,
      correo: email.getValue(),
      razonSocial: empresa.getRazonSocial(),
      ruc: empresa.getRuc(),
      fechaRegistro: usuario.fechaRegistro,
    }
  }
}
