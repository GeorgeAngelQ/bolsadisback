import { Application } from 'express'
import { AppContainer } from '@di/container'

import { createAuthRoutes } from './auth.routes'
import { createPerfilRoutes } from './perfil.routes'
import { createVacanteRoutes } from './vacante.routes'
import { createPostulacionRoutes } from './postulacion.routes'
import { createIntermediacionRoutes } from './intermediacion.routes'
import { createComunicacionRoutes } from './comunicacion.routes'
import { createAdministracionRoutes } from './administracion.routes'
import { createReportesRoutes } from './reportes.routes'

import { 
   AuthController, 
   AccesibilidadController, 
   GestionCuentasController, 
   RolController 
} from '../controllers/accesoRegistro/AuthController'
import { 
   PerfilCandidatoController, 
   CurriculumVitaeController, 
   CertificadoController, 
   PerfilEmpresaController 
} from '../controllers/gestionPerfil/PerfilController'
import { 
   VacanteController, 
   AprobacionVacanteController, 
   // ReporteContenidoController, 
   SancionEmpresaController 
} from '../controllers/gestionVacante/VacanteController'
import { 
   BusquedaVacanteController, 
   PostulacionController, 
   VacanteGuardadaController, 
   AlertaEmpleoController, 
   RecomendacionVacanteController
} from '../controllers/busquedaPostulacion/PostulacionController'
import { 
   IntermediacionLaboralController, 
   ObservacionCandidatoController, 
   SeguimientoPostulacionController, 
   CoordinacionEntrevistaController, 
   DerivacionServicioController
} from '../controllers/intermediacion/IntermediacionController'
import { 
   ConversacionController, 
   MensajeController, 
   PlantillaNotificacionController
} from '../controllers/comunicacion/ComunicacionController'
import { 
   ContenidoInformativoController, 
   CategoriaController, 
   ConfiguracionAccesibilidadController, 
   AuditoriaController, 
   //MantenimientoController 
} from '../controllers/administracion/AdministracionController'
import { 
   ReporteCuotaController, 
   ReporteGestionController, 
   ReporteGlobalController, 
   DashboardController, 
   ExportacionController 
} from '../controllers/reportes/ReporteController'

const API = '/api/v1'

export function registerRoutes(app: Application, container: AppContainer): void {
  const { shared, m1, m2, m3, m4, m5, m6, m7, m8 } = container

  app.use(`${API}/auth`, createAuthRoutes(
    shared.authMiddleware,
    new AuthController(m1), 
    new AccesibilidadController(m1),
    new GestionCuentasController(m1), 
    new RolController(m1),
  ))

  app.use(API, createPerfilRoutes(
    shared.authMiddleware,
    new PerfilCandidatoController(m2), 
    new CurriculumVitaeController(m2),
    new CertificadoController(m2), 
    new PerfilEmpresaController(m2),
  ))

  app.use(API, createVacanteRoutes(
    shared.authMiddleware,
    new VacanteController(m3), 
    new AprobacionVacanteController(m3),
    // new ReporteContenidoController(m3), 
    new SancionEmpresaController(m3),
  ))

  app.use(API, createPostulacionRoutes(
    shared.authMiddleware,
    new BusquedaVacanteController(m4), 
    new PostulacionController(m4),
    new VacanteGuardadaController(m4), 
    new AlertaEmpleoController(m4),
    new RecomendacionVacanteController(m4),
  ))

  app.use(API, createIntermediacionRoutes(
    shared.authMiddleware,
    new IntermediacionLaboralController(m5), 
    new ObservacionCandidatoController(m5),
    new SeguimientoPostulacionController(m5), 
    new CoordinacionEntrevistaController(m5),
    new DerivacionServicioController(m5),
  ))

  app.use(API, createComunicacionRoutes(
    shared.authMiddleware,
    new ConversacionController(m6), 
    new MensajeController(m6),
    new PlantillaNotificacionController(m6),
  ))

  app.use(`${API}/administracion`, createAdministracionRoutes(
    shared.authMiddleware,
    new ContenidoInformativoController(m7), 
    new CategoriaController(m7),
    new ConfiguracionAccesibilidadController(m7), 
    new AuditoriaController(m7),
    // new MantenimientoController(m7),
  ))

  app.use(API, createReportesRoutes(
    shared.authMiddleware,
    new ReporteCuotaController(m8), 
    new ReporteGestionController(m8),
    new ReporteGlobalController(m8), 
    new DashboardController(m8),
    new ExportacionController(m8),
  ))
}