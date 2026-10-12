import { Repositories } from './repositories'
import { SharedServices } from './shared.container'

import { RegistrarCandidatoUseCase } from '@application/use-cases/accesoRegistro/registrarCandidato/RegistrarCandidato.usecase'
import { RegistrarEmpresaUseCase } from '@application/use-cases/accesoRegistro/registrarEmpresa/RegistrarEmpresa.usecase'
import { IniciarSesionUseCase } from '@application/use-cases/accesoRegistro/iniciarSesion/IniciarSesion.usecase'
import { SolicitarRecuperacionContrasenaUseCase } from '@application/use-cases/accesoRegistro/recuperarContrasena/SolicitarRecuperacionContrasena.usecase'
import { ValidarTokenRecuperacionUseCase } from '@application/use-cases/accesoRegistro/recuperarContrasena/ValidarTokenRecuperacion.usecase'
import { ActualizarContrasenaUseCase } from '@application/use-cases/accesoRegistro/recuperarContrasena/ActualizarContrasena.usecase'
import { ObtenerPreferenciasAccesibilidadUseCase } from '@application/use-cases/accesoRegistro/configurarAccesibilidad/ObtenerPreferenciasAccesibilidad.usecase'
import { GuardarPreferenciasAccesibilidadUseCase } from '@application/use-cases/accesoRegistro/configurarAccesibilidad/GuardarPreferenciasAccesibilidad.usecase'
import { RestablecerPreferenciasDefectoUseCase } from '@application/use-cases/accesoRegistro/configurarAccesibilidad/RestablecerPreferenciasDefecto.usecase'
import { CrearCuentaIntermediadorUseCase } from '@application/use-cases/accesoRegistro/gestionarCuentas/CrearCuentaIntermediador.usecase'
import { SuspenderCuentaUseCase } from '@application/use-cases/accesoRegistro/gestionarCuentas/SuspenderCuenta.usecase'
import { ReactivarCuentaUseCase } from '@application/use-cases/accesoRegistro/gestionarCuentas/ReactivarCuenta.usecase'
import { EliminarCuentaUseCase } from '@application/use-cases/accesoRegistro/gestionarCuentas/EliminarCuenta.usecase'
import { CrearRolUseCase } from '@application/use-cases/accesoRegistro/gestionarRoles/CrearRol.usecase'
import { AsignarPermisosRolUseCase } from '@application/use-cases/accesoRegistro/gestionarRoles/AsignarPermisosRol.usecase'
import { ListarRolesConPermisosUseCase } from '@application/use-cases/accesoRegistro/gestionarRoles/ListarRolesConPermisos.usecase'


export type Modulo1Repos = Pick<
  Repositories,
  | 'usuarioRepo'
  | 'candidatoRepo'
  | 'empresaRepo'
  | 'intermediadorRepo'
  | 'credencialRepo'
  | 'preferenciaRepo'
  | 'rolRepo'
>

export function buildModulo1Container(repos: Modulo1Repos, shared: SharedServices) {

  const {
    unitOfWork,
    passwordHasher,
    tokenGenerator,
    emailService,
    auditLogger,
    notificationService,
    logger
  } = shared

  return {
    registrarCandidato: new RegistrarCandidatoUseCase(
      unitOfWork, repos.usuarioRepo, repos.candidatoRepo, repos.credencialRepo,
      repos.preferenciaRepo, repos.rolRepo, passwordHasher, auditLogger, emailService, logger
    ),
    registrarEmpresa: new RegistrarEmpresaUseCase(
      unitOfWork, repos.usuarioRepo, repos.empresaRepo, repos.credencialRepo,
      repos.preferenciaRepo, repos.rolRepo, passwordHasher, auditLogger, emailService, logger
    ),
    iniciarSesion: new IniciarSesionUseCase(
      repos.usuarioRepo, repos.preferenciaRepo, repos.rolRepo,
      passwordHasher, tokenGenerator, auditLogger, notificationService,
    ),
    solicitarRecuperacion: new SolicitarRecuperacionContrasenaUseCase(
      repos.usuarioRepo, repos.credencialRepo, tokenGenerator, auditLogger, emailService,
    ),
    validarToken: new ValidarTokenRecuperacionUseCase(repos.credencialRepo),
    actualizarContrasena: new ActualizarContrasenaUseCase(
      repos.usuarioRepo, repos.credencialRepo, passwordHasher, auditLogger,
    ),
    obtenerPreferencias: new ObtenerPreferenciasAccesibilidadUseCase(repos.preferenciaRepo),
    guardarPreferencias: new GuardarPreferenciasAccesibilidadUseCase(repos.preferenciaRepo, auditLogger),
    restablecerPreferencias: new RestablecerPreferenciasDefectoUseCase(repos.preferenciaRepo),
    crearIntermediador: new CrearCuentaIntermediadorUseCase(
      unitOfWork, repos.usuarioRepo, repos.intermediadorRepo, repos.credencialRepo,
      repos.preferenciaRepo, repos.rolRepo, passwordHasher, tokenGenerator, auditLogger, emailService, 
      logger
    ),
    suspenderCuenta: new SuspenderCuentaUseCase(unitOfWork, repos.usuarioRepo, auditLogger, notificationService),
    reactivarCuenta: new ReactivarCuentaUseCase(unitOfWork, repos.usuarioRepo, auditLogger, notificationService),
    eliminarCuenta: new EliminarCuentaUseCase(repos.usuarioRepo, auditLogger),
    crearRol: new CrearRolUseCase(repos.rolRepo, auditLogger),
    asignarPermisos: new AsignarPermisosRolUseCase(unitOfWork, repos.rolRepo, auditLogger),
    listarRoles: new ListarRolesConPermisosUseCase(repos.rolRepo),
  }
}

export type Modulo1Container = ReturnType<typeof buildModulo1Container>
