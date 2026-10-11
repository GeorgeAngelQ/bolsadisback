import { Repositories } from './repositories'
import { SharedServices } from './shared.container'

import { PostularVacanteUseCase } from "@application/use-cases/busquedaPostulacion/postularVacante/PostularVacante.usecase";
import { BuscarVacantesUseCase, ObtenerDetalleVacanteUseCase } from '@application/use-cases/busquedaPostulacion/buscarVacantes/BuscarVacantes.usecase'
import { CalificarExperienciaPostulacionUseCase } from '@application/use-cases/busquedaPostulacion/calificarPostulacion/CalificarExperienciaPostulacion.usecase'
import { 
  CrearAlertaEmpleoUseCase, 
  DesactivarAlertaEmpleoUseCase, 
  EditarAlertaEmpleoUseCase 
} from '@application/use-cases/busquedaPostulacion/gestionarAlertas/GestionarAlertas.usecase'
import { GuardarVacanteFavoritaUseCase, EliminarVacanteFavoritaUseCase } from '@application/use-cases/busquedaPostulacion/gestionarFavoritos/GestionarFavoritos.usecase'
import { 
  ListarPostulacionesCandidatoUseCase, 
  ObtenerDetallePostulacionUseCase, 
  RetirarPostulacionUseCase 
} from '@application/use-cases/busquedaPostulacion/gestionarPostulaciones/GestionarPostulaciones.usecase'
import { 
  GenerarRecomendacionesAutomaticasUseCase, 
  ListarRecomendacionesCandidatoUseCase, 
  CrearRecomendacionManualUseCase, 
  DescartarRecomendacionUseCase 
} from '@application/use-cases/busquedaPostulacion/gestionarRecomendaciones/GestionarRecomendaciones.usecase'


export type Modulo4Repos = Pick<
  Repositories,
  | 'vacanteRepo'
  | 'vacanteGuardadaRepo'
  | 'perfilCandidatoRepo'
  | 'tipoDiscapacidadRepo'
  | 'postulacionRepo'
  | 'ajusteRequeridoRepo'
  | 'sancionRepo'
  | 'alertaRepo'
  | 'recomendacionRepo'
>

export function buildModulo4Container(repos: Modulo4Repos, shared: SharedServices) {

  const { 
    auditLogger, 
    notificationService 
  } = shared

  return {
    buscarVacantes: new BuscarVacantesUseCase(repos.vacanteRepo, repos.vacanteGuardadaRepo, repos.perfilCandidatoRepo, repos.tipoDiscapacidadRepo),
    obtenerDetalleVacante: new ObtenerDetalleVacanteUseCase(repos.vacanteRepo, repos.vacanteGuardadaRepo, repos.postulacionRepo, repos.tipoDiscapacidadRepo),
    postularVacante: new PostularVacanteUseCase(repos.postulacionRepo, repos.vacanteRepo, repos.perfilCandidatoRepo, notificationService, auditLogger),
    listarPostulaciones: new ListarPostulacionesCandidatoUseCase(repos.postulacionRepo),
    obtenerDetallePostulacion: new ObtenerDetallePostulacionUseCase(repos.postulacionRepo),
    retirarPostulacion: new RetirarPostulacionUseCase(repos.postulacionRepo, notificationService, auditLogger),
    calificarPostulacion: new CalificarExperienciaPostulacionUseCase(repos.postulacionRepo, auditLogger),
    guardarFavorita: new GuardarVacanteFavoritaUseCase(repos.vacanteGuardadaRepo, repos.vacanteRepo),
    eliminarFavorita: new EliminarVacanteFavoritaUseCase(repos.vacanteGuardadaRepo),
    crearAlerta: new CrearAlertaEmpleoUseCase(repos.alertaRepo, auditLogger),
    editarAlerta: new EditarAlertaEmpleoUseCase(repos.alertaRepo),
    desactivarAlerta: new DesactivarAlertaEmpleoUseCase(repos.alertaRepo),
    generarRecomendacionesAuto: new GenerarRecomendacionesAutomaticasUseCase(repos.recomendacionRepo, repos.vacanteRepo, repos.perfilCandidatoRepo, repos.tipoDiscapacidadRepo, notificationService),
    listarRecomendaciones: new ListarRecomendacionesCandidatoUseCase(repos.recomendacionRepo),
    crearRecomendacionManual: new CrearRecomendacionManualUseCase(repos.recomendacionRepo, repos.vacanteRepo, notificationService),
    descartarRecomendacion: new DescartarRecomendacionUseCase(repos.recomendacionRepo),
  }
}

export type Modulo4Container = ReturnType<typeof buildModulo4Container>
