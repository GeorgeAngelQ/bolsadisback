import { registrarCandidatoSchema } from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'
import { documentar, RespuestaDatos } from '@docs/helpers/documentar'

const MODULO = 'Módulo 1: Acceso y Registro'

documentar({
  metodo: 'post',
  ruta: '/auth/candidatos/registro',
  modulo: MODULO,
  seccion: 'Registro',
  resumen: 'Registrar candidato',
  descripcion: 'Permite crear la cuenta de usuario personal con el rol de candidato',
  publico: true,
  body: registrarCandidatoSchema,
  exito: { 
    descripcion: 'Cuenta creada correctamente', 
    schema: RespuestaDatos
  },
  errores: [400, 409, 422],
})