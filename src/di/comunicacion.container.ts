import { Repositories } from './repositories'
import { SharedServices } from './shared.container'

import { 
   CrearPlantillaNotificacionUseCase, 
   DesactivarPlantillaNotificacionUseCase, 
   EditarPlantillaNotificacionUseCase, 
   EnviarMensajeMasivoUseCase, 
   EnviarMensajeUseCase, 
   IniciarConversacionUseCase, 
   MarcarMensajesLeidosUseCase, 
   ObtenerHistorialConversacionUseCase 
} from '@application/use-cases/comunicacion/ComunicacionUseCases.usecase'


export type Modulo6Repos = Pick<
  Repositories,
  | 'conversacionRepo'
  | 'postulacionRepo'
  | 'asignacionRepo'
  | 'mensajeRepo'
  | 'plantillaRepo'
>

export function buildModulo6Container(repos: Modulo6Repos, shared: SharedServices) {
  const { 
    auditLogger, 
    notificationService 
  } = shared

  return {
    iniciarConversacion: new IniciarConversacionUseCase(repos.conversacionRepo, repos.postulacionRepo, repos.asignacionRepo),
    obtenerHistorial: new ObtenerHistorialConversacionUseCase(repos.conversacionRepo, repos.mensajeRepo),
    enviarMensaje: new EnviarMensajeUseCase(repos.conversacionRepo, repos.mensajeRepo, notificationService, auditLogger),
    enviarMasivo: new EnviarMensajeMasivoUseCase(repos.conversacionRepo, repos.mensajeRepo, notificationService),
    marcarLeidos: new MarcarMensajesLeidosUseCase(repos.conversacionRepo, repos.mensajeRepo),
    crearPlantilla: new CrearPlantillaNotificacionUseCase(repos.plantillaRepo, auditLogger),
    editarPlantilla: new EditarPlantillaNotificacionUseCase(repos.plantillaRepo, auditLogger),
    desactivarPlantilla: new DesactivarPlantillaNotificacionUseCase(repos.plantillaRepo, auditLogger),
  }
}

export type Modulo6Container = ReturnType<typeof buildModulo6Container>
