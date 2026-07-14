import { BcryptPasswordHasher } from '../infrastructure/services/auth/BcryptPasswordHasher'
import { JwtTokenGenerator } from '../infrastructure/services/auth/JwtTokenGenerator'
import { NodemailerEmailService } from '../infrastructure/services/email/NodemailerEmailService'
import { DatabaseAuditLoggerService } from '../infrastructure/services/audit/DatabaseAuditLoggerService'
import { InAppNotificationService } from '../infrastructure/services/notifications/InAppNotificationService'

// Faltan implementaciones PostgreSQL

import { RegistrarCandidatoUseCase } from '../application/use-cases/accesoRegistro/registrarCandidato/RegistrarCandidato.usecase'
import { RegistrarEmpresaUseCase } from '../application/use-cases/accesoRegistro/registrarEmpresa/RegistrarEmpresa.usecase'
import { IniciarSesionUseCase } from '../application/use-cases/accesoRegistro/iniciarSesion/IniciarSesion.usecase'
import { SolicitarRecuperacionContrasenaUseCase } from '../application/use-cases/accesoRegistro/recuperarContrasena/SolicitarRecuperacionContrasena.usecase'
import { ValidarTokenRecuperacionUseCase } from '../application/use-cases/accesoRegistro/recuperarContrasena/ValidarTokenRecuperacion.usecase'
import { ActualizarContrasenaUseCase } from '../application/use-cases/accesoRegistro/recuperarContrasena/ActualizarContrasena.usecase'
import { ObtenerPreferenciasAccesibilidadUseCase } from '../application/use-cases/accesoRegistro/configurarAccesibilidad/ObtenerPreferenciasAccesibilidad.usecase'
import { GuardarPreferenciasAccesibilidadUseCase } from '../application/use-cases/accesoRegistro/configurarAccesibilidad/GuardarPreferenciasAccesibilidad.usecase'
import { RestablecerPreferenciasDefectoUseCase } from '../application/use-cases/accesoRegistro/configurarAccesibilidad/RestablecerPreferenciasDefecto.usecase'
import { CrearCuentaIntermediadorUseCase } from '../application/use-cases/accesoRegistro/gestionarCuentas/CrearCuentaIntermediador.usecase'
import { SuspenderCuentaUseCase } from '../application/use-cases/accesoRegistro/gestionarCuentas/SuspenderCuenta.usecase'
import { ReactivarCuentaUseCase } from '../application/use-cases/accesoRegistro/gestionarCuentas/ReactivarCuenta.usecase'
import { EliminarCuentaUseCase } from '../application/use-cases/accesoRegistro/gestionarCuentas/EliminarCuenta.usecase'
import { CrearRolUseCase } from '../application/use-cases/accesoRegistro/gestionarRoles/CrearRol.usecase'
import { AsignarPermisosRolUseCase } from '../application/use-cases/accesoRegistro/gestionarRoles/AsignarPermisosRol.usecase'
import { ListarRolesConPermisosUseCase } from '../application/use-cases/accesoRegistro/gestionarRoles/ListarRolesConPermisos.usecase'

// Servicios compartidos
const passwordHasher = new BcryptPasswordHasher()
const tokenGenerator = new JwtTokenGenerator()
const emailService = new NodemailerEmailService()

export function buildModulo1Container(deps: {
  usuarioRepo: any
  candidatoRepo: any
  empresaRepo: any
  intermediadorRepo: any
  administradorRepo: any
  credencialRepo: any
  preferenciaRepo: any
  rolRepo: any
  notificacionRepo: any
  auditoriaRepo: any
}) {
  const auditLogger = new DatabaseAuditLoggerService(deps.auditoriaRepo)
  const notificationService = new InAppNotificationService(deps.notificacionRepo)

  return {
    // Servicios externos
    tokenGenerator,
    passwordHasher,

    // Use cases
    registrarCandidato: new RegistrarCandidatoUseCase(
      deps.usuarioRepo, deps.candidatoRepo, deps.credencialRepo,
      deps.preferenciaRepo, deps.rolRepo, passwordHasher, auditLogger, emailService,
    ),
    registrarEmpresa: new RegistrarEmpresaUseCase(
      deps.usuarioRepo, deps.empresaRepo, deps.credencialRepo,
      deps.preferenciaRepo, deps.rolRepo, passwordHasher, auditLogger, emailService,
    ),
    iniciarSesion: new IniciarSesionUseCase(
      deps.usuarioRepo, deps.preferenciaRepo, deps.rolRepo,
      passwordHasher, tokenGenerator, auditLogger, notificationService,
    ),
    solicitarRecuperacion: new SolicitarRecuperacionContrasenaUseCase(
      deps.usuarioRepo, deps.credencialRepo, tokenGenerator, auditLogger, emailService,
    ),
    validarToken: new ValidarTokenRecuperacionUseCase(deps.credencialRepo),
    actualizarContrasena: new ActualizarContrasenaUseCase(
      deps.usuarioRepo, deps.credencialRepo, passwordHasher, auditLogger,
    ),
    obtenerPreferencias: new ObtenerPreferenciasAccesibilidadUseCase(deps.preferenciaRepo),
    guardarPreferencias: new GuardarPreferenciasAccesibilidadUseCase(deps.preferenciaRepo, auditLogger),
    restablecerPreferencias: new RestablecerPreferenciasDefectoUseCase(deps.preferenciaRepo),
    crearIntermediador: new CrearCuentaIntermediadorUseCase(
      deps.usuarioRepo, deps.intermediadorRepo, deps.credencialRepo,
      deps.preferenciaRepo, deps.rolRepo, passwordHasher, tokenGenerator, auditLogger, emailService,
    ),
    suspenderCuenta: new SuspenderCuentaUseCase(deps.usuarioRepo, auditLogger, notificationService),
    reactivarCuenta: new ReactivarCuentaUseCase(deps.usuarioRepo, auditLogger, notificationService),
    eliminarCuenta: new EliminarCuentaUseCase(deps.usuarioRepo, auditLogger),
    crearRol: new CrearRolUseCase(deps.rolRepo, auditLogger),
    asignarPermisos: new AsignarPermisosRolUseCase(deps.rolRepo, auditLogger),
    listarRoles: new ListarRolesConPermisosUseCase(deps.rolRepo),
  }
}

export type Modulo1Container = ReturnType<typeof buildModulo1Container>
