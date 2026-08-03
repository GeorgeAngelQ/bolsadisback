import { extendZodWithOpenApi, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

import {
  registrarCandidatoSchema,
  registrarEmpresaSchema,
  loginSchema,
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

