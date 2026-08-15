import { DatabaseAuditLoggerService } from '@infrastructure/services/audit/DatabaseAuditLoggerService'
import { LocalFileStorageService } from '@infrastructure/services/storage/LocalFileStorageService'
import { WcagAccessibilityChecker } from '@infrastructure/services/accessibility/WcagAccessibilityChecker'
import { InAppNotificationService } from '@infrastructure/services/notifications/InAppNotificationService'

import { CrearPerfilCandidatoUseCase } from '@application/use-cases/gestionPerfil/crearPerfilCandidato/CrearPerfilCandidato.usecase'
import {
  EditarPerfilCandidatoUseCase,
  ActualizarHabilidadesUseCase,
  ActualizarExperienciasLaboralesUseCase,
  ActualizarFormacionAcademicaUseCase,
} from '@application/use-cases/gestionPerfil/editarPerfilCandidato/EditarPerfilCandidato.usecase'
import {
  SubirCVUseCase,
  GenerarCVAutomaticoUseCase,
  DescargarCVUseCase,
} from '@application/use-cases/gestionPerfil/gestionarCV/GestionarCV.usecase'
import {
  RegistrarCertificadoDiscapacidadUseCase,
  VerificarCertificadoDiscapacidadUseCase,
} from '@application/use-cases/gestionPerfil/gestionarCertificado/GestionarCertificado.usecase'
import {
  CrearPerfilEmpresaUseCase,
  EditarPerfilEmpresaUseCase,
  GestionarUsuariosReclutadoresUseCase,
} from '@application/use-cases/gestionPerfil/gestionarPerfilEmpresa/GestionarPerfilEmpresa.usecase'

const fileStorage = new LocalFileStorageService()
const accessibilityChecker = new WcagAccessibilityChecker()

export function buildModulo2Container(deps: {
  perfilCandidatoRepo: any
  perfilEmpresaRepo: any
  cvRepo: any
  habilidadRepo: any
  experienciaRepo: any
  formacionRepo: any
  tipoDiscapacidadRepo: any
  ajusteRequeridoRepo: any
  certificadoRepo: any
  notificacionRepo: any
  auditoriaRepo: any
}) {
  const auditLogger = new DatabaseAuditLoggerService(deps.auditoriaRepo)
  const notificationService = new InAppNotificationService(deps.notificacionRepo)

  return {
    crearPerfilCandidato: new CrearPerfilCandidatoUseCase(
      deps.perfilCandidatoRepo, 
      deps.tipoDiscapacidadRepo,
      deps.ajusteRequeridoRepo, 
      auditLogger,
    ),
    editarPerfilCandidato: new EditarPerfilCandidatoUseCase(deps.perfilCandidatoRepo, auditLogger),
    actualizarHabilidades: new ActualizarHabilidadesUseCase(deps.perfilCandidatoRepo, deps.habilidadRepo),
    actualizarExperiencias: new ActualizarExperienciasLaboralesUseCase(deps.perfilCandidatoRepo, deps.experienciaRepo),
    actualizarFormaciones: new ActualizarFormacionAcademicaUseCase(deps.perfilCandidatoRepo, deps.formacionRepo),

    subirCV: new SubirCVUseCase(
      deps.perfilCandidatoRepo, deps.cvRepo, fileStorage, accessibilityChecker, auditLogger,
    ),
    generarCV: new GenerarCVAutomaticoUseCase(deps.perfilCandidatoRepo, deps.cvRepo, fileStorage, auditLogger),
    descargarCV: new DescargarCVUseCase(deps.perfilCandidatoRepo, deps.cvRepo, fileStorage),

    registrarCertificado: new RegistrarCertificadoDiscapacidadUseCase(
      deps.perfilCandidatoRepo, deps.certificadoRepo, fileStorage, auditLogger,
    ),
    verificarCertificado: new VerificarCertificadoDiscapacidadUseCase(deps.certificadoRepo, auditLogger),
    
    crearPerfilEmpresa: new CrearPerfilEmpresaUseCase(deps.perfilEmpresaRepo, auditLogger),
    editarPerfilEmpresa: new EditarPerfilEmpresaUseCase(deps.perfilEmpresaRepo, auditLogger),
    gestionarReclutadores: new GestionarUsuariosReclutadoresUseCase(deps.perfilEmpresaRepo, auditLogger),
  }
}

export type Modulo2Container = ReturnType<typeof buildModulo2Container>
