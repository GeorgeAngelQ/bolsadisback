import { documentar, RespuestaDatos } from '@docs/helpers/documentar'
import { guardarPreferenciasSchema } from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'

const MODULO = 'Módulo 1: Acceso y Registro'

documentar({
  metodo: 'put',
  ruta: '/auth/accesibilidad',
  modulo: MODULO,
  seccion: 'Accesibilidad',
  resumen: 'Guardar preferencias de accesibilidad',
  descripcion: 'Permite al usuario guardar sus preferencias de accesibilidad',
  publico: true,
  params: guardarPreferenciasSchema,
  exito: { 
    descripcion: 'Preferencias de accesibilidad guardadas correctamente', 
    schema: RespuestaDatos 
  },
  errores: [400, 422],
})