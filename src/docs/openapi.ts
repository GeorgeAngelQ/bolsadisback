// Mod 1
import '@docs/paths/accesoRegistro/registro/registrarCandidato.path'
import '@docs/paths/accesoRegistro/registro/registrarEmpresa.path'
import '@docs/paths/accesoRegistro/autenticacion/iniciarSesion.path'
import '@docs/paths/accesoRegistro/autenticacion/solicitarRecuperacion.path'
import '@docs/paths/accesoRegistro/cuentas/crearCuentaIL.path'
import '@docs/paths/accesoRegistro/cuentas/suspenderCuenta.path'
import '@docs/paths/accesoRegistro/cuentas/reactivarCuenta.path'
import '@docs/paths/accesoRegistro/roles/listarRoles.path'
import '@docs/paths/accesoRegistro/roles/crearRol.path'
import '@docs/paths/accesoRegistro/roles/asignarPermisos.path'

// Mod 2
import '@docs/paths/gestionPerfil/candidato/crearPerfil.path'
import '@docs/paths/gestionPerfil/candidato/editarPerfil.path'
import '@docs/paths/gestionPerfil/candidato/actualizarExperiencias.path'
import '@docs/paths/gestionPerfil/candidato/actualizarFormaciones.path'
import '@docs/paths/gestionPerfil/candidato/actualizarHabilidadades.path'
import '@docs/paths/gestionPerfil/certificado/registrarCertificado.path'
import '@docs/paths/gestionPerfil/certificado/verificarCertificado.path'
import '@docs/paths/gestionPerfil/curriculum/subirCV.path'
import '@docs/paths/gestionPerfil/curriculum/generarCV.path'
import '@docs/paths/gestionPerfil/curriculum/descargarCV.path'
import '@docs/paths/gestionPerfil/empresa/crearPerfil.path'
import '@docs/paths/gestionPerfil/empresa/editarPerfil.path'

// Mod 3
import '@docs/paths/gestionVacante/vacante/publicarVacante.path'
import '@docs/paths/gestionVacante/vacante/editarVacante.path'
import '@docs/paths/gestionVacante/vacante/cerrarVacante.path'
import '@docs/paths/gestionVacante/vacante/verificarAjustes.path'
import '@docs/paths/gestionVacante/accion/listarPendientes.path'
import '@docs/paths/gestionVacante/accion/aprobarVacante.path'
import '@docs/paths/gestionVacante/accion/rechazarVacante.path'
import '@docs/paths/gestionVacante/sancion/registrarSancion.path'
import '@docs/paths/gestionVacante/sancion/levantarSancion.path'

import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi'
import { registry } from './openapiRegistry'

const generator = new OpenApiGeneratorV31(
  registry.definitions
  
)
export const openApiSpec = generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Bolsa de Trabajo Inclusivo API',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
      },
    ],
  }
)