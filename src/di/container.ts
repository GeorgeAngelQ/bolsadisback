import { buildModulo1Container } from './accesoRegistro.container'
import { buildModulo2Container } from './gestionPerfil.container'
import { buildModulo3Container } from './gestionVacante.container'
import { buildModulo4Container } from './busquedaPostulacion.container'
import { buildModulo5Container } from './intermediacion.container'
import { buildModulo6Container } from './comunicacion.container'
import { buildModulo7Container } from './administracion.container'
import { buildModulo8Container } from './reporte.container'
//Mod 1
import { 
  PostgresAdministradorRepository, 
  PostgresCandidatoRepository, 
  PostgresEmpresaEmpleadoraRepository, 
  PostgresIntermediadorRepository 
} from '@infrastructure/persistence/postgres/repositories/accesoRegistro/PostgresActoresRepository'
import { 
  PostgresCredencialAccesoRepository, 
  PostgresPreferenciaAccesibilidadRepository, 
  PostgresRolRepository 
} from '@infrastructure/persistence/postgres/repositories/accesoRegistro/PostgresRolCredencialRepository'
import { 
  PostgresUsuarioRepository 
} from '@infrastructure/persistence/postgres/repositories/accesoRegistro/PostgresUsuarioRepository'

//Mod 2
import { 
  PostgresAjusteRazonableRequeridoRepository,
  PostgresCertificadoDiscapacidadRepository,
  PostgresCurriculumVitaeRepository,
  PostgresExperienciaLaboralRepository,
  PostgresFormacionAcademicaRepository,
  PostgresHabilidadRepository,
  PostgresPerfilCandidatoRepository, 
  PostgresPerfilEmpresaRepository, 
  PostgresTipoDiscapacidadRepository
} from '@infrastructure/persistence/postgres/repositories/gestionPerfil/PostgresPerfilRepositories'

//Mod 3
import { 
  PostgresAjusteRazonableDisponibleRepository, 
  PostgresSancionEmpresaRepository, 
  PostgresVacanteRepository 
} from '@infrastructure/persistence/postgres/repositories/gestionVacante/PostgresVacanteRepositories'

//Mod 4
import { 
  PostgresAlertaEmpleoRepository,
  PostgresPostulacionRepository,
  PostgresRecomendacionVacanteRepository,
  PostgresVacanteGuardadaRepository
} from '@infrastructure/persistence/postgres/repositories/busquedaPostulacion/PostgresPostulacionRepositories'

//Mod 5
import { 
  PostgresAsignacionIntermediadorRepository, 
  PostgresCoordinacionEntrevistaRepository, 
  PostgresDerivacionServicioRepository, 
  PostgresObservacionCandidatoRepository, 
  PostgresSeguimientoPostulacionRepository 
} from '@infrastructure/persistence/postgres/repositories/intermediacion/PostgresIntermediacionRepositories'

// Mod 6
import { 
  PostgresConversacionRepository, 
  PostgresMensajeInternoRepository, 
  PostgresNotificacionRepository, 
  PostgresPlantillaNotificacionRepository 
} from '@infrastructure/persistence/postgres/repositories/comunicacion/PostgresComunicacionRepositories'

//Mod 7
import { 
  PostgresConfiguracionAccesibilidadRepository, 
  PostgresContenidoInformativoRepository, 
  PostgresEventoAuditoriaRepository 
} from '@infrastructure/persistence/postgres/repositories/administracion/PostgresAdministracionRepositories'

//Mod 8
import { 
  PostgresDashboardIndicadoresRepository, 
  PostgresReporteCuotaInclusionRepository, 
  PostgresReporteGestionIntermediadorRepository, 
  PostgresReporteInclusionLaboralRepository 
} from '@infrastructure/persistence/postgres/repositories/reportes/PostgresReporteRepositories'

export function buildContainer() {

  // Módulo 1
  const usuarioRepo = new PostgresUsuarioRepository()
  const candidatoRepo = new PostgresCandidatoRepository()
  const empresaRepo = new PostgresEmpresaEmpleadoraRepository()
  const intermediadorRepo = new PostgresIntermediadorRepository()
  const administradorRepo = new PostgresAdministradorRepository()
  const credencialRepo = new PostgresCredencialAccesoRepository()
  const preferenciaRepo = new PostgresPreferenciaAccesibilidadRepository()
  const rolRepo = new PostgresRolRepository()

  // Módulo 2
  const perfilCandidatoRepo = new PostgresPerfilCandidatoRepository()
  const perfilEmpresaRepo = new PostgresPerfilEmpresaRepository()
  const cvRepo = new PostgresCurriculumVitaeRepository()
  const habilidadRepo = new PostgresHabilidadRepository()
  const experienciaRepo = new PostgresExperienciaLaboralRepository()
  const formacionRepo = new PostgresFormacionAcademicaRepository()
  const tipoDiscapacidadRepo = new PostgresTipoDiscapacidadRepository()
  const ajusteRequeridoRepo = new PostgresAjusteRazonableRequeridoRepository()
  const certificadoRepo = new PostgresCertificadoDiscapacidadRepository()

  // Módulo 3
  const vacanteRepo = new PostgresVacanteRepository()
  const ajusteDisponibleRepo = new PostgresAjusteRazonableDisponibleRepository()
  const sancionRepo = new PostgresSancionEmpresaRepository()

  // Módulo 4
  const postulacionRepo = new PostgresPostulacionRepository()
  const vacanteGuardadaRepo = new PostgresVacanteGuardadaRepository()
  const alertaRepo = new PostgresAlertaEmpleoRepository()
  const recomendacionRepo = new PostgresRecomendacionVacanteRepository()

  // Módulo 5
  const asignacionRepo = new PostgresAsignacionIntermediadorRepository()
  const observacionRepo = new PostgresObservacionCandidatoRepository()
  const seguimientoRepo = new PostgresSeguimientoPostulacionRepository()
  const derivacionRepo = new PostgresDerivacionServicioRepository()
  const entrevistaRepo = new PostgresCoordinacionEntrevistaRepository()

  // Módulo 6
  const conversacionRepo = new PostgresConversacionRepository()
  const mensajeRepo = new PostgresMensajeInternoRepository()
  const notificacionRepo = new PostgresNotificacionRepository()
  const plantillaRepo = new PostgresPlantillaNotificacionRepository()

  // Módulo 7
  const contenidoRepo = new PostgresContenidoInformativoRepository()
  const configAccesibilidadRepo = new PostgresConfiguracionAccesibilidadRepository()
  const auditoriaRepo = new PostgresEventoAuditoriaRepository()

  // Módulo 8
  const reporteCuotaRepo = new PostgresReporteCuotaInclusionRepository()
  const reporteGestionRepo = new PostgresReporteGestionIntermediadorRepository()
  const reporteGlobalRepo = new PostgresReporteInclusionLaboralRepository()
  const dashboardRepo = new PostgresDashboardIndicadoresRepository()
  
  const m1 = buildModulo1Container({
    usuarioRepo,
    candidatoRepo,
    empresaRepo,
    intermediadorRepo,
    administradorRepo,
    credencialRepo,
    preferenciaRepo,
    rolRepo,
    notificacionRepo,
    auditoriaRepo,
  })

  const m2 = buildModulo2Container({
    perfilCandidatoRepo,
    perfilEmpresaRepo,
    cvRepo,
    habilidadRepo,
    experienciaRepo,
    formacionRepo,
    tipoDiscapacidadRepo,
    ajusteRequeridoRepo,
    certificadoRepo,
    notificacionRepo,
    auditoriaRepo,
  })

  const m3 = buildModulo3Container({
    vacanteRepo,
    ajusteDisponibleRepo,
    sancionRepo,
    perfilEmpresaRepo,
    tipoDiscapacidadRepo,
    perfilCandidatoRepo,
    ajusteRequeridoRepo,
    //reporteContenidoRepo, 
    notificacionRepo,
    auditoriaRepo,
  })

  const m4 = buildModulo4Container({
    vacanteRepo,
    vacanteGuardadaRepo,
    perfilCandidatoRepo,
    tipoDiscapacidadRepo,
    postulacionRepo,
    ajusteRequeridoRepo,
    sancionRepo,
    alertaRepo,
    recomendacionRepo,
    notificacionRepo,
    auditoriaRepo,
  })

  const m5 = buildModulo5Container({
    asignacionRepo,
    observacionRepo,
    seguimientoRepo,
    postulacionRepo,
    entrevistaRepo,
    derivacionRepo,
    notificacionRepo,
    auditoriaRepo,
  })

  const m6 = buildModulo6Container({
    conversacionRepo,
    postulacionRepo,
    asignacionRepo,
    mensajeRepo,
    plantillaRepo,
    auditoriaRepo,
    notificacionRepo
  })

  const m7 = buildModulo7Container({
    contenidoRepo,
    tipoDiscapacidadRepo,
    configAccesibilidadRepo,
    //mantenimientoRepo,
    auditoriaRepo,
    notificacionRepo
  })

  const m8 = buildModulo8Container({
    reporteCuotaRepo,
    reporteGestionRepo,
    reporteGlobalRepo,
    dashboardRepo,
    perfilEmpresaRepo,
    auditoriaRepo
  })
  return { m1, m2, m3, m4, m5, m6, m7, m8 }
}

export type AppContainer = ReturnType<typeof buildContainer>
