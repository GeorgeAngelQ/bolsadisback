import { Repositories } from './repositories'
import { SharedServices } from './shared.container'

import { 
   AprobarVacanteUseCase, 
   ListarVacantesPendientesUseCase, 
   RechazarVacanteUseCase 
} from "@application/use-cases/gestionVacante/aprobarRechazarVacante/AprobarRechazarVacante.usecase";
import { CerrarVacanteUseCase } from "@application/use-cases/gestionVacante/cerrarVacante/CerrarVacante.usecase";
import { EditarVacanteUseCase } from "@application/use-cases/gestionVacante/editarVacante/EditarVacante.usecase";
import { PublicarVacanteUseCase } from "@application/use-cases/gestionVacante/publicarVacante/PublicarVacante.usecase";
import { LevantarSancionEmpresaUseCase, RegistrarSancionEmpresaUseCase } from "@application/use-cases/gestionVacante/registrarSancionEmpresa/GestionarSancionEmpresa.usecase";
import { VerificarAjustesRazonablesVacanteUseCase } from "@application/use-cases/gestionVacante/verificarAjustesRazonables/VerificarAjustesRazonablesVacante.usecase";
// Pendiente
import { 
   DesestimarReporteContenidoUseCase, 
   RegistrarReporteContenidoUseCase, 
   RetirarContenidoReportadoUseCase 
} from "@application/use-cases/gestionVacante/gestionarReportesContenido/GestionarReportesContenido.usecase";


export type Modulo3Repos = Pick<
  Repositories,
  | 'vacanteRepo'
  | 'ajusteDisponibleRepo'
  | 'sancionRepo'
  | 'perfilEmpresaRepo'
  | 'tipoDiscapacidadRepo'
  | 'perfilCandidatoRepo'
  | 'ajusteRequeridoRepo'
>

export function buildModulo3Container(repos: Modulo3Repos, shared: SharedServices) {
  
  const { 
    auditLogger, 
    notificationService 
  } = shared

  return {
    publicarVacante: new PublicarVacanteUseCase(repos.vacanteRepo, repos.ajusteDisponibleRepo, repos.sancionRepo, repos.perfilEmpresaRepo, repos.tipoDiscapacidadRepo, notificationService, auditLogger),
    editarVacante: new EditarVacanteUseCase(repos.vacanteRepo, repos.ajusteDisponibleRepo, repos.tipoDiscapacidadRepo, auditLogger),
    cerrarVacante: new CerrarVacanteUseCase(repos.vacanteRepo, notificationService, auditLogger),
    aprobarVacante: new AprobarVacanteUseCase(repos.vacanteRepo, notificationService, auditLogger),
    rechazarVacante: new RechazarVacanteUseCase(repos.vacanteRepo, notificationService, auditLogger),
    listarPendientes: new ListarVacantesPendientesUseCase(repos.vacanteRepo),
    verificarAjustes: new VerificarAjustesRazonablesVacanteUseCase(repos.vacanteRepo, repos.ajusteDisponibleRepo, repos.perfilCandidatoRepo, repos.ajusteRequeridoRepo, notificationService, auditLogger),
    registrarSancion: new RegistrarSancionEmpresaUseCase(repos.sancionRepo, auditLogger),
    levantarSancion: new LevantarSancionEmpresaUseCase(repos.sancionRepo, auditLogger),
    // registrarReporte: new RegistrarReporteContenidoUseCase(repos.reporteContenidoRepo, notificationService),
    // desestimarReporte: new DesestimarReporteContenidoUseCase(repos.reporteContenidoRepo, auditLogger),
    // retirarContenido: new RetirarContenidoReportadoUseCase(repos.reporteContenidoRepo, repos.vacanteRepo, notificationService, auditLogger),
  }
}

export type Modulo3Container = ReturnType<typeof buildModulo3Container>
