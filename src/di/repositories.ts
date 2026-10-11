import { IUsuarioRepository } from '@domain/repositories/accesoRegistro/IUsuarioRepository'
import { ICandidatoRepository } from '@domain/repositories/accesoRegistro/ICandidatoRepository'
import { IEmpresaEmpleadoraRepository } from '@domain/repositories/accesoRegistro/IEmpresaEmpleadoraRepository'
import { IIntermediadorLaboralRepository } from '@domain/repositories/accesoRegistro/IIntermediadorLaboralRepository'
import { IAdministradorRepository } from '@domain/repositories/accesoRegistro/IAdministradorRepository'
import { ICredencialAccesoRepository } from '@domain/repositories/accesoRegistro/ICredencialAccesoRepository'
import { IPreferenciaAccesibilidadRepository } from '@domain/repositories/accesoRegistro/IPreferenciaAccesibilidadRepository'
import { IRolRepository } from '@domain/repositories/accesoRegistro/IRolRepository'
import { IPerfilCandidatoRepository } from '@domain/repositories/gestionPerfil/IPerfilCandidatoRepository'
import {
  IPerfilEmpresaRepository,
  ICurriculumVitaeRepository,
  IHabilidadRepository,
  IExperienciaLaboralRepository,
  IFormacionAcademicaRepository,
  ITipoDiscapacidadRepository,
  IAjusteRazonableRequeridoRepository,
  ICertificadoDiscapacidadRepository,
} from '@domain/repositories/gestionPerfil/PerfilRepositories'
import {
  IVacanteRepository,
  IAjusteRazonableDisponibleRepository,
  ISancionEmpresaRepository,
} from '@domain/repositories/gestionVacante/VacanteRepositories'
import {
  IPostulacionRepository,
  IVacanteGuardadaRepository,
  IAlertaEmpleoRepository,
  IRecomendacionVacanteRepository,
} from '@domain/repositories/busquedaPostulacion/PostulacionRepositories'
import {
  IAsignacionIntermediadorRepository,
  IObservacionCandidatoRepository,
  ISeguimientoPostulacionRepository,
  IDerivacionServicioRepository,
  ICoordinacionEntrevistaRepository,
} from '@domain/repositories/intermediacion/IntermediacionRepositories'
import {
  IConversacionRepository,
  IMensajeInternoRepository,
  INotificacionRepository,
  IPlantillaNotificacionRepository,
} from '@domain/repositories/comunicacion/ComunicacionRepositories'
import {
  IContenidoInformativoRepository,
  IConfiguracionAccesibilidadGlobalRepository,
  IEventoAuditoriaRepository,
} from '@domain/repositories/administracion/AdministracionRepositories'
import {
  IReporteCuotaInclusionRepository,
  IReporteGestionIntermediadorRepository,
  IReporteInclusionLaboralRepository,
  IDashboardIndicadoresRepository,
} from '@domain/repositories/reportes/ReporteRepositories'


import {
  PostgresAdministradorRepository,
  PostgresCandidatoRepository,
  PostgresEmpresaEmpleadoraRepository,
  PostgresIntermediadorRepository,
} from '@infrastructure/persistence/postgres/repositories/accesoRegistro/PostgresActoresRepository'
import {
  PostgresCredencialAccesoRepository,
  PostgresPreferenciaAccesibilidadRepository,
  PostgresRolRepository,
} from '@infrastructure/persistence/postgres/repositories/accesoRegistro/PostgresRolCredencialRepository'
import { PostgresUsuarioRepository } from '@infrastructure/persistence/postgres/repositories/accesoRegistro/PostgresUsuarioRepository'
import {
  PostgresAjusteRazonableRequeridoRepository,
  PostgresCertificadoDiscapacidadRepository,
  PostgresCurriculumVitaeRepository,
  PostgresExperienciaLaboralRepository,
  PostgresFormacionAcademicaRepository,
  PostgresHabilidadRepository,
  PostgresPerfilCandidatoRepository,
  PostgresPerfilEmpresaRepository,
  PostgresTipoDiscapacidadRepository,
} from '@infrastructure/persistence/postgres/repositories/gestionPerfil/PostgresPerfilRepositories'
import {
  PostgresAjusteRazonableDisponibleRepository,
  PostgresSancionEmpresaRepository,
  PostgresVacanteRepository,
} from '@infrastructure/persistence/postgres/repositories/gestionVacante/PostgresVacanteRepositories'
import {
  PostgresAlertaEmpleoRepository,
  PostgresPostulacionRepository,
  PostgresRecomendacionVacanteRepository,
  PostgresVacanteGuardadaRepository,
} from '@infrastructure/persistence/postgres/repositories/busquedaPostulacion/PostgresPostulacionRepositories'
import {
  PostgresAsignacionIntermediadorRepository,
  PostgresCoordinacionEntrevistaRepository,
  PostgresDerivacionServicioRepository,
  PostgresObservacionCandidatoRepository,
  PostgresSeguimientoPostulacionRepository,
} from '@infrastructure/persistence/postgres/repositories/intermediacion/PostgresIntermediacionRepositories'
import {
  PostgresConversacionRepository,
  PostgresMensajeInternoRepository,
  PostgresNotificacionRepository,
  PostgresPlantillaNotificacionRepository,
} from '@infrastructure/persistence/postgres/repositories/comunicacion/PostgresComunicacionRepositories'
import {
  PostgresConfiguracionAccesibilidadRepository,
  PostgresContenidoInformativoRepository,
  PostgresEventoAuditoriaRepository,
} from '@infrastructure/persistence/postgres/repositories/administracion/PostgresAdministracionRepositories'
import {
  PostgresDashboardIndicadoresRepository,
  PostgresReporteCuotaInclusionRepository,
  PostgresReporteGestionIntermediadorRepository,
  PostgresReporteInclusionLaboralRepository,
} from '@infrastructure/persistence/postgres/repositories/reportes/PostgresReporteRepositories'

export interface Repositories {
  // Módulo 1
  usuarioRepo: IUsuarioRepository
  candidatoRepo: ICandidatoRepository
  empresaRepo: IEmpresaEmpleadoraRepository
  intermediadorRepo: IIntermediadorLaboralRepository
  administradorRepo: IAdministradorRepository
  credencialRepo: ICredencialAccesoRepository
  preferenciaRepo: IPreferenciaAccesibilidadRepository
  rolRepo: IRolRepository

  // Módulo 2
  perfilCandidatoRepo: IPerfilCandidatoRepository
  perfilEmpresaRepo: IPerfilEmpresaRepository
  cvRepo: ICurriculumVitaeRepository
  habilidadRepo: IHabilidadRepository
  experienciaRepo: IExperienciaLaboralRepository
  formacionRepo: IFormacionAcademicaRepository
  tipoDiscapacidadRepo: ITipoDiscapacidadRepository
  ajusteRequeridoRepo: IAjusteRazonableRequeridoRepository
  certificadoRepo: ICertificadoDiscapacidadRepository

  // Módulo 3
  vacanteRepo: IVacanteRepository
  ajusteDisponibleRepo: IAjusteRazonableDisponibleRepository
  sancionRepo: ISancionEmpresaRepository

  // Módulo 4
  postulacionRepo: IPostulacionRepository
  vacanteGuardadaRepo: IVacanteGuardadaRepository
  alertaRepo: IAlertaEmpleoRepository
  recomendacionRepo: IRecomendacionVacanteRepository

  // Módulo 5
  asignacionRepo: IAsignacionIntermediadorRepository
  observacionRepo: IObservacionCandidatoRepository
  seguimientoRepo: ISeguimientoPostulacionRepository
  derivacionRepo: IDerivacionServicioRepository
  entrevistaRepo: ICoordinacionEntrevistaRepository

  // Módulo 6
  conversacionRepo: IConversacionRepository
  mensajeRepo: IMensajeInternoRepository
  notificacionRepo: INotificacionRepository
  plantillaRepo: IPlantillaNotificacionRepository

  // Módulo 7
  contenidoRepo: IContenidoInformativoRepository
  configAccesibilidadRepo: IConfiguracionAccesibilidadGlobalRepository
  auditoriaRepo: IEventoAuditoriaRepository
  
  // Módulo 8
  reporteCuotaRepo: IReporteCuotaInclusionRepository
  reporteGestionRepo: IReporteGestionIntermediadorRepository
  reporteGlobalRepo: IReporteInclusionLaboralRepository
  dashboardRepo: IDashboardIndicadoresRepository
}

export function buildRepositories(): Repositories {
  return {
    usuarioRepo: new PostgresUsuarioRepository(),
    candidatoRepo: new PostgresCandidatoRepository(),
    empresaRepo: new PostgresEmpresaEmpleadoraRepository(),
    intermediadorRepo: new PostgresIntermediadorRepository(),
    administradorRepo: new PostgresAdministradorRepository(),
    credencialRepo: new PostgresCredencialAccesoRepository(),
    preferenciaRepo: new PostgresPreferenciaAccesibilidadRepository(),
    rolRepo: new PostgresRolRepository(),

    perfilCandidatoRepo: new PostgresPerfilCandidatoRepository(),
    perfilEmpresaRepo: new PostgresPerfilEmpresaRepository(),
    cvRepo: new PostgresCurriculumVitaeRepository(),
    habilidadRepo: new PostgresHabilidadRepository(),
    experienciaRepo: new PostgresExperienciaLaboralRepository(),
    formacionRepo: new PostgresFormacionAcademicaRepository(),
    tipoDiscapacidadRepo: new PostgresTipoDiscapacidadRepository(),
    ajusteRequeridoRepo: new PostgresAjusteRazonableRequeridoRepository(),
    certificadoRepo: new PostgresCertificadoDiscapacidadRepository(),

    vacanteRepo: new PostgresVacanteRepository(),
    ajusteDisponibleRepo: new PostgresAjusteRazonableDisponibleRepository(),
    sancionRepo: new PostgresSancionEmpresaRepository(),

    postulacionRepo: new PostgresPostulacionRepository(),
    vacanteGuardadaRepo: new PostgresVacanteGuardadaRepository(),
    alertaRepo: new PostgresAlertaEmpleoRepository(),
    recomendacionRepo: new PostgresRecomendacionVacanteRepository(),

    asignacionRepo: new PostgresAsignacionIntermediadorRepository(),
    observacionRepo: new PostgresObservacionCandidatoRepository(),
    seguimientoRepo: new PostgresSeguimientoPostulacionRepository(),
    derivacionRepo: new PostgresDerivacionServicioRepository(),
    entrevistaRepo: new PostgresCoordinacionEntrevistaRepository(),

    conversacionRepo: new PostgresConversacionRepository(),
    mensajeRepo: new PostgresMensajeInternoRepository(),
    notificacionRepo: new PostgresNotificacionRepository(),
    plantillaRepo: new PostgresPlantillaNotificacionRepository(),

    contenidoRepo: new PostgresContenidoInformativoRepository(),
    configAccesibilidadRepo: new PostgresConfiguracionAccesibilidadRepository(),
    auditoriaRepo: new PostgresEventoAuditoriaRepository(),

    reporteCuotaRepo: new PostgresReporteCuotaInclusionRepository(),
    reporteGestionRepo: new PostgresReporteGestionIntermediadorRepository(),
    reporteGlobalRepo: new PostgresReporteInclusionLaboralRepository(),
    dashboardRepo: new PostgresDashboardIndicadoresRepository(),
  }
}