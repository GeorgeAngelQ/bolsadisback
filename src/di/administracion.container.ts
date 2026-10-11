import { Repositories } from './repositories'
import { SharedServices } from './shared.container'

import { 
   ActualizarConfiguracionAccesibilidadGlobalUseCase, 
   BuscarEventosAuditoriaUseCase, 
   DetectarPatronesAnomaloUseCase, 
   EditarContenidoInformativoUseCase, 
   EliminarTipoDiscapacidadUseCase, 
   ExportarRegistroAuditoriaUseCase, 
   PublicarContenidoInformativoUseCase, 
   RetirarContenidoInformativoUseCase 
} from "@application/use-cases/administracion/AdministracionUseCases.usecase"

export type Modulo7Repos = Pick<
  Repositories,
  | 'contenidoRepo'
  | 'tipoDiscapacidadRepo'
  | 'configAccesibilidadRepo'
  | 'auditoriaRepo'
>

export function buildModulo7Container(repos: Modulo7Repos, shared: SharedServices) {

   const { 
      auditLogger, 
      notificationService, 
      accessibilityChecker 
   } = shared

  return {
      publicarContenido: new PublicarContenidoInformativoUseCase(repos.contenidoRepo, accessibilityChecker, auditLogger),
      editarContenido: new EditarContenidoInformativoUseCase(repos.contenidoRepo, auditLogger),
      retirarContenido: new RetirarContenidoInformativoUseCase(repos.contenidoRepo, auditLogger),
      eliminarTipoDiscapacidad: new EliminarTipoDiscapacidadUseCase(repos.tipoDiscapacidadRepo, auditLogger),
      actualizarConfigAccesibilidad: new ActualizarConfiguracionAccesibilidadGlobalUseCase(repos.configAccesibilidadRepo, notificationService, auditLogger),
      buscarEventosAuditoria: new BuscarEventosAuditoriaUseCase(repos.auditoriaRepo),
      detectarPatrones: new DetectarPatronesAnomaloUseCase(repos.auditoriaRepo, notificationService),
      exportarAuditoria: new ExportarRegistroAuditoriaUseCase(repos.auditoriaRepo, auditLogger),
      // programarManteniento: new ProgramarMantenimientoUseCase(repos.mantenimientoRepo, notificationService, auditLogger),
      // finalizarMantenimiento: new FinalizarMantenimientoUseCase(repos.mantenimientoRepo, notificationService, auditLogger),
  }
}

export type Modulo7Container = ReturnType<typeof buildModulo7Container>