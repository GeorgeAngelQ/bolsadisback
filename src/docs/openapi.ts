import './paths/accesoRegistro/registro/registrarCandidato.path'
import './paths/accesoRegistro/registro/registrarEmpresa.path'
import './paths/accesoRegistro/iniciarSesion/Autenticacion'
import './paths/accesoRegistro/iniciarSesion/Recuperar Contrasena'
import './paths/accesoRegistro/cuentas/crearIntermediadorLaboral'
import './paths/accesoRegistro/cuentas/suspenderCuenta'
import './paths/accesoRegistro/cuentas/reactivarCuenta'
import './paths/accesoRegistro/roles/listarRoles.path'
import './paths/accesoRegistro/roles/crearRolesPermisos.path'
import './paths/accesoRegistro/roles/asignarPermisos.path'
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { registry } from './openapiRegistry'

const generator = new OpenApiGeneratorV3(
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