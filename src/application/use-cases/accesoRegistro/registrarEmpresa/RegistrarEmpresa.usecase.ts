import { Usuario } from '@domain/entities/accesoRegistro/Usuario.entity'
import { EmpresaEmpleadora } from '@domain/entities/accesoRegistro/EmpresaEmpleadora.entity'
import { CredencialAcceso } from '@domain/entities/accesoRegistro/CredencialAcceso.entity'
import { PreferenciaAccesibilidad } from '@domain/entities/accesoRegistro/PreferenciaAccesibilidad.entity'

import { Email } from '@domain/value-objects/Email.vo'
import { Ruc } from '@domain/value-objects/Ruc.vo'

import { EstadoUsuario } from '@domain/enums/EstadoUsuario.enum'

import { IUsuarioRepository } from '@domain/repositories/accesoRegistro/IUsuarioRepository'
import { IEmpresaEmpleadoraRepository } from '@domain/repositories/accesoRegistro/IEmpresaEmpleadoraRepository'
import { ICredencialAccesoRepository } from '@domain/repositories/accesoRegistro/ICredencialAccesoRepository'
import { IPreferenciaAccesibilidadRepository } from '@domain/repositories/accesoRegistro/IPreferenciaAccesibilidadRepository'
import { IRolRepository } from '@domain/repositories/accesoRegistro/IRolRepository'

import { IPasswordHasher } from '@domain/services/IPasswordHasher'

import { DuplicateEntityError, EntityNotFoundError } from '@domain/errors/DomainError'

import { IAuditLoggerService } from '@application/ports/IAuditLoggerService'
import { IEmailService } from '@application/ports/IEmailService'
import { IUnitWork } from '@application/ports/IUnitOfWork'
import { ILogger } from '@application/ports/ILogger'

import { RegistrarEmpresaInputDto } from '@application/use-cases/accesoRegistro/registrarEmpresa/RegistrarEmpresaInput.dto'
import { RegistrarEmpresaOutputDto } from '@application/use-cases/accesoRegistro/registrarEmpresa/RegistrarEmpresaOutput.dto'

export class RegistrarEmpresaUseCase {
  constructor(
    private readonly unitOfWork: IUnitWork,
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly empresaRepository: IEmpresaEmpleadoraRepository,
    private readonly credencialRepository: ICredencialAccesoRepository,
    private readonly preferenciaRepository: IPreferenciaAccesibilidadRepository,
    private readonly rolRepository: IRolRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly auditLogger: IAuditLoggerService,
    private readonly emailService: IEmailService,
    private readonly logger: ILogger
  ) {}

  async execute(input: RegistrarEmpresaInputDto): Promise<RegistrarEmpresaOutputDto> {
    const email = new Email(input.correo)
    const ruc = new Ruc(input.ruc)

    const correoExistente = await this.usuarioRepository.existsByCorreo(email.getValue())
    if (correoExistente) {
      throw new DuplicateEntityError('Usuario', 'correo electrónico')
    }

    const rucExistente = await this.empresaRepository.existsByRuc(ruc.getValue())
    if (rucExistente) {
      throw new DuplicateEntityError('EmpresaEmpleadora', 'RUC')
    }

    const contrasenaHash = await this.passwordHasher.hash(input.contrasena)

    const { usuario, empresa } = await this.unitOfWork.execute(async () => {

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
        new CredencialAcceso({ 
          id: 0, 
          idUsuario: usuario.id 
        }),
      )

      await this.preferenciaRepository.save(
        PreferenciaAccesibilidad.crearPorDefecto(0, usuario.id),
      )

      const rolEmpresa = await this.rolRepository.findByNombre('empresa')
      if (!rolEmpresa) throw new EntityNotFoundError('Rol', 'empresa')
      await this.rolRepository.assignRolToUsuario(usuario.id, rolEmpresa.id)

      return { usuario, empresa }
    })

    await this.auditLogger.log({
      idUsuario: usuario.id,
      accion: 'registro_empresa',
      modulo: 'acceso',
      objetoAfectado: 'EmpresaEmpleadora',
      idObjetoAfectado: empresa.id,
      resultado: 'exitoso',
    })
    try {
      await this.emailService.sendWelcomeEmail(email.getValue(), empresa.getRazonSocial())
    }
    catch (error) {
      this.logger.error('No se pudo enviar el correo de bienvenida: ', {  
        err: error
      })
    }

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
