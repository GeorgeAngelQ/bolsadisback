import { registrarEmpresaSchema } from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'
import { documentar, RespuestaDatos } from '@docs/helpers/documentar'

const MODULO = 'Módulo 1: Acceso y Registro'

documentar({
  metodo: 'post',
  ruta: '/auth/empresas/registro',
  modulo: MODULO,
  seccion: 'Registro',
  resumen: 'Registrar emmpresa',
  descripcion: 'Permite crear la cuenta de empresa empleadora con el rol de empresa',
  publico: true,
  body: registrarEmpresaSchema,
  exito: { 
    descripcion: 'Cuenta creada correctamente', 
    schema: RespuestaDatos
  },
  errores: [400, 409, 422],
})