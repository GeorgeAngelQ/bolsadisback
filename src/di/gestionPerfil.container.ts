import { Repositories } from './repositories'
import { SharedServices } from './shared.container'

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

export type Modulo2Repos = Pick<
  Repositories,
  | 'perfilCandidatoRepo'
  | 'perfilEmpresaRepo'
  | 'cvRepo'
  | 'habilidadRepo'
  | 'experienciaRepo'
  | 'formacionRepo'
  | 'tipoDiscapacidadRepo'
  | 'ajusteRequeridoRepo'
  | 'certificadoRepo'
>

export function buildModulo2Container(repos: Modulo2Repos, shared: SharedServices) {
  
  const { 
    auditLogger, 
    fileStorage, 
    accessibilityChecker
  } = shared

  return {
    crearPerfilCandidato: new CrearPerfilCandidatoUseCase(
      repos.perfilCandidatoRepo, 
      repos.tipoDiscapacidadRepo,
      repos.ajusteRequeridoRepo, 
      auditLogger,
    ),
    editarPerfilCandidato: new EditarPerfilCandidatoUseCase(repos.perfilCandidatoRepo, auditLogger),
    actualizarHabilidades: new ActualizarHabilidadesUseCase(repos.perfilCandidatoRepo, repos.habilidadRepo),
    actualizarExperiencias: new ActualizarExperienciasLaboralesUseCase(repos.perfilCandidatoRepo, repos.experienciaRepo),
    actualizarFormaciones: new ActualizarFormacionAcademicaUseCase(repos.perfilCandidatoRepo, repos.formacionRepo),

    subirCV: new SubirCVUseCase(
      repos.perfilCandidatoRepo, repos.cvRepo, fileStorage, accessibilityChecker, auditLogger,
    ),
    generarCV: new GenerarCVAutomaticoUseCase(repos.perfilCandidatoRepo, repos.cvRepo, fileStorage, auditLogger),
    descargarCV: new DescargarCVUseCase(repos.perfilCandidatoRepo, repos.cvRepo, fileStorage),

    registrarCertificado: new RegistrarCertificadoDiscapacidadUseCase(
      repos.perfilCandidatoRepo, repos.certificadoRepo, fileStorage, auditLogger,
    ),
    verificarCertificado: new VerificarCertificadoDiscapacidadUseCase(repos.certificadoRepo, auditLogger),
    
    crearPerfilEmpresa: new CrearPerfilEmpresaUseCase(repos.perfilEmpresaRepo, auditLogger),
    editarPerfilEmpresa: new EditarPerfilEmpresaUseCase(repos.perfilEmpresaRepo, auditLogger),
    gestionarReclutadores: new GestionarUsuariosReclutadoresUseCase(repos.perfilEmpresaRepo, auditLogger),
  }
}

export type Modulo2Container = ReturnType<typeof buildModulo2Container>
