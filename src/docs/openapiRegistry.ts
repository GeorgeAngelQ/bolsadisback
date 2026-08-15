import { extendZodWithOpenApi, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

import {
  registrarCandidatoSchema,
  registrarEmpresaSchema,
  loginSchema,
  asignarPermisosSchema,
  crearRolSchema,
  crearIntermediadorSchema,
  solicitarRecuperacionSchema,
  actualizarContrasenaSchema,
  guardarPreferenciasSchema,

} from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'

export const registry = new OpenAPIRegistry()

registry.register(
  'RegistrarCandidato',
  registrarCandidatoSchema
)

registry.register(
  'RegistrarEmpresa',
  registrarEmpresaSchema
)

registry.register(
  'Login',
  loginSchema
)
registry.register(
  'AsignarPermisos',
  asignarPermisosSchema
)
registry.register(
  'CrearRol',
  crearRolSchema
)
registry.register(
  'CrearIntermediador',
  crearIntermediadorSchema
)
registry.register(
  'SolicitarRecuperacion',
  solicitarRecuperacionSchema
)
registry.register(
  'ActualizarContrasena',
  actualizarContrasenaSchema
)
registry.register(
  'GuardarPreferencias',
  guardarPreferenciasSchema
)

registry.registerComponent(
  'securitySchemes',
  'bearerAuth',
  {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  }
)