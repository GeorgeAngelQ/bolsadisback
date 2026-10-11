import { Repositories } from './repositories'
import { SharedServices } from './shared.container'

import { 
  ActualizarEstadoDerivacionUseCase, 
  ActualizarNotasSeguimientoUseCase, 
  AsignarseCandidatoUseCase, 
  IniciarSeguimientoPostulacionUseCase, 
  ProgramarEntrevistaUseCase, 
  RegistrarDerivacionServicioUseCase, 
  RegistrarObservacionCandidatoUseCase, 
  RegistrarResultadoSeleccionUseCase 
} from "@application/use-cases/intermediacion/IntermediacionUseCases.usecase";


export type Modulo5Repos = Pick<
  Repositories,
  | 'asignacionRepo'
  | 'observacionRepo'
  | 'seguimientoRepo'
  | 'postulacionRepo'
  | 'entrevistaRepo'
  | 'derivacionRepo'
>

export function buildModulo5Container(repos: Modulo5Repos, shared: SharedServices) {
  const { 
    auditLogger, 
    notificationService 
  } = shared
  return {
   asignarCandidato: new AsignarseCandidatoUseCase(repos.asignacionRepo, notificationService, auditLogger),
   registrarObservacion: new RegistrarObservacionCandidatoUseCase(repos.asignacionRepo, repos.observacionRepo, auditLogger),
   iniciarSeguimiento: new IniciarSeguimientoPostulacionUseCase(repos.asignacionRepo, repos.seguimientoRepo, repos.postulacionRepo),
   actualizarNotas: new ActualizarNotasSeguimientoUseCase(repos.seguimientoRepo),
   registrarResultado: new RegistrarResultadoSeleccionUseCase(repos.seguimientoRepo, repos.postulacionRepo, notificationService, auditLogger),
   programarEntrevista: new ProgramarEntrevistaUseCase(repos.entrevistaRepo, repos.postulacionRepo, notificationService, auditLogger),
   registrarDerivacion: new RegistrarDerivacionServicioUseCase(repos.derivacionRepo, repos.seguimientoRepo, notificationService, auditLogger),
   actualizarDerivacion: new ActualizarEstadoDerivacionUseCase(repos.derivacionRepo, notificationService, auditLogger)
  }
}

export type Modulo5Container = ReturnType<typeof buildModulo5Container>
