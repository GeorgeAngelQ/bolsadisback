import { documentar, RespuestaDatos } from '@docs/helpers/documentar'

const MODULO = 'Módulo 1: Acceso y Registro'

documentar({
  metodo: 'get',
  ruta: '/auth/accesibilidad',
  modulo: MODULO,
  seccion: 'Accesibilidad',
  resumen: 'Obtener la accesibilidad de la cuenta',
  descripcion: 'Permite al usuario obtener la accesibilidad de una cuenta',
  publico: true,
  exito: { 
    descripcion: 'Accesibilidad retornada correctamente', 
    schema: RespuestaDatos 
  },
  errores: [400, 422],
})