import { Router } from 'express'
import { AuthMiddleware } from '../middlewares/authMiddleware'
import { requireCandidato, requireEmpresa, requireAdministrador } from '../middlewares/roleMiddleware'
import { upload } from '../middlewares/uploadMiddleware'

import {
  CertificadoController,
  CurriculumVitaeController,
  PerfilCandidatoController,
  PerfilEmpresaController
} from '@infrastructure/controllers/gestionPerfil/PerfilController'

export function createPerfilRoutes(
  auth: AuthMiddleware,
  candidato: PerfilCandidatoController,
  curriculum: CurriculumVitaeController,
  certificado: CertificadoController,
  empresa: PerfilEmpresaController
): Router {
  const router = Router()

  router.post('/candidatos/:idCandidato/perfil', auth, requireCandidato(), candidato.crear)
  router.put('/candidatos/:idCandidato/perfil', auth, requireCandidato(), candidato.editar)
  router.patch('/candidatos/:idCandidato/perfil/habilidades', auth, requireCandidato(), candidato.actualizarHabilidades)
  router.patch('/candidatos/:idCandidato/perfil/experiencias', auth, requireCandidato(), candidato.actualizarExperiencias)
  router.patch('/candidatos/:idCandidato/perfil/formaciones', auth, requireCandidato(), candidato.actualizarFormaciones)

  router.post('/candidatos/:idCandidato/cv', auth, requireCandidato(), upload.single('archivo'), curriculum.subir)
  router.post('/candidatos/:idCandidato/cv/generar', auth, requireCandidato(), curriculum.generar)
  router.get('/candidatos/:idCandidato/cv/descargar', auth, requireCandidato(), curriculum.descargar)

  router.post('/candidatos/:idCandidato/certificados', auth, requireCandidato(), upload.single('archivo'), certificado.registrar)
  router.patch('/perfiles/:idPerfil/certificados/verificar', auth, requireAdministrador(), certificado.verificar)

  router.post('/empresas/:idEmpresa/perfil', auth, requireEmpresa(), empresa.crear)
  router.put('/empresas/:idEmpresa/perfil', auth, requireEmpresa(), empresa.editar)

  return router
}