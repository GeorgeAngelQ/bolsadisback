import { buildModulo1Container } from './accesoRegistro.container'

export function buildContainer(repos: {

    // Módulo 1
  usuarioRepo: any
  candidatoRepo: any
  empresaRepo: any
  intermediadorRepo: any
  administradorRepo: any
  credencialRepo: any
  preferenciaRepo: any
  rolRepo: any

  // Módulo 2
  perfilCandidatoRepo: any
  perfilEmpresaRepo: any
  cvRepo: any
  habilidadRepo: any
  experienciaRepo: any
  formacionRepo: any
  tipoDiscapacidadRepo: any
  ajusteRequeridoRepo: any
  certificadoRepo: any

  // Módulo 3
  vacanteRepo: any
  ajusteDisponibleRepo: any
  sancionRepo: any
  reporteContenidoRepo: any

  // Módulo 4
  postulacionRepo: any
  vacanteGuardadaRepo: any
  alertaRepo: any
  recomendacionRepo: any

  // Módulo 5
  asignacionRepo: any
  observacionRepo: any
  seguimientoRepo: any
  derivacionRepo: any
  entrevistaRepo: any

  // Módulo 6
  conversacionRepo: any
  mensajeRepo: any
  notificacionRepo: any
  plantillaRepo: any

  // Módulo 7
  contenidoRepo: any
  configAccesibilidadRepo: any
  auditoriaRepo: any
  mantenimientoRepo: any

  // Módulo 8
  reporteCuotaRepo: any
  reporteGestionRepo: any
  reporteGlobalRepo: any
  dashboardRepo: any
  
}) {
  const m1 = buildModulo1Container({
    usuarioRepo: repos.usuarioRepo,
    candidatoRepo: repos.candidatoRepo,
    empresaRepo: repos.empresaRepo,
    intermediadorRepo: repos.intermediadorRepo,
    administradorRepo: repos.administradorRepo,
    credencialRepo: repos.credencialRepo,
    preferenciaRepo: repos.preferenciaRepo,
    rolRepo: repos.rolRepo,
    notificacionRepo: repos.notificacionRepo,
    auditoriaRepo: repos.auditoriaRepo,
  })
  return { m1 }
}

export type AppContainer = ReturnType<typeof buildContainer>
