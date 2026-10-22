import { Router } from 'express'
import { AuthMiddleware } from '@infrastructure/middlewares/authMiddleware'
import { requireCandidato, requireEmpresa, requireAdministrador } from '@infrastructure/middlewares/roleMiddleware'
import { upload } from '@infrastructure/middlewares/uploadMiddleware'
import { validate } from '@infrastructure/middlewares/validationMiddleware'
import { ids } from '@infrastructure/validators/common/common.schemas'
import {
  actualizarExperienciasSchema, actualizarFormacionesSchema, actualizarHabilidadesSchema,
  crearPerfilCandidatoSchema, crearPerfilEmpresaSchema, editarPerfilCandidatoSchema,
  editarPerfilEmpresaSchema, registrarCertificadoSchema, subirCvSchema,
} from '@infrastructure/validators/gestionPerfil/perfil.schema'
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

  router.post('/candidatos/:idCandidato/perfil', auth, requireCandidato(), validate({ params: ids('idCandidato'), body: crearPerfilCandidatoSchema }), candidato.crear)
  router.put('/candidatos/:idCandidato/perfil', auth, requireCandidato(), validate({ params: ids('idCandidato'), body: editarPerfilCandidatoSchema }), candidato.editar)
  router.patch('/candidatos/:idCandidato/perfil/habilidades', auth, requireCandidato(), validate({ params: ids('idCandidato'), body: actualizarHabilidadesSchema }), candidato.actualizarHabilidades)
  router.patch('/candidatos/:idCandidato/perfil/experiencias', auth, requireCandidato(), validate({ params: ids('idCandidato'), body: actualizarExperienciasSchema }), candidato.actualizarExperiencias)
  router.patch('/candidatos/:idCandidato/perfil/formaciones', auth, requireCandidato(), validate({ params: ids('idCandidato'), body: actualizarFormacionesSchema }), candidato.actualizarFormaciones)

router.post('/candidatos/:idCandidato/cv', auth, requireCandidato(), upload.single('archivo'), validate({ params: ids('idCandidato'), body: subirCvSchema }), curriculum.subir)
  router.post('/candidatos/:idCandidato/cv/generar', auth, requireCandidato(), validate({ params: ids('idCandidato') }), curriculum.generar)
  router.get('/candidatos/:idCandidato/cv/descargar', auth, requireCandidato(), validate({ params: ids('idCandidato') }), curriculum.descargar)

  router.post('/candidatos/:idCandidato/certificados', auth, requireCandidato(), upload.single('archivo'), validate({ params: ids('idCandidato'), body: registrarCertificadoSchema }), certificado.registrar)
  router.patch('/perfiles/:idPerfil/certificados/verificar', auth, requireAdministrador(), validate({ params: ids('idPerfil') }), certificado.verificar)

  router.post('/empresas/:idEmpresa/perfil', auth, requireEmpresa(), validate({ params: ids('idEmpresa'), body: crearPerfilEmpresaSchema }), empresa.crear)
  router.put('/empresas/:idEmpresa/perfil', auth, requireEmpresa(), validate({ params: ids('idEmpresa'), body: editarPerfilEmpresaSchema }), empresa.editar)

  return router
}