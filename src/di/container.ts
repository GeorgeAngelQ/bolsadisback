import { buildRepositories } from './repositories'
import { buildSharedServices } from './shared.container'
import { buildModulo1Container } from './accesoRegistro.container'
import { buildModulo2Container } from './gestionPerfil.container'
import { buildModulo3Container } from './gestionVacante.container'
import { buildModulo4Container } from './busquedaPostulacion.container'
import { buildModulo5Container } from './intermediacion.container'
import { buildModulo6Container } from './comunicacion.container'
import { buildModulo7Container } from './administracion.container'
import { buildModulo8Container } from './reporte.container'


  
export function buildContainer() {
  const repos = buildRepositories()
  const shared = buildSharedServices(repos)

  return {
    shared,
    m1: buildModulo1Container(repos, shared),
    m2: buildModulo2Container(repos, shared),
    m3: buildModulo3Container(repos, shared),
    m4: buildModulo4Container(repos, shared),
    m5: buildModulo5Container(repos, shared),
    m6: buildModulo6Container(repos, shared),
    m7: buildModulo7Container(repos, shared),
    m8: buildModulo8Container(repos, shared),
  }
}

export type AppContainer = ReturnType<typeof buildContainer>
