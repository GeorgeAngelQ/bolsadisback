import { documentar, RespuestaMensaje } from '@docs/helpers/documentar'

const MODULO = 'Módulo 1: Acceso y Registro'

documentar({
  metodo: 'delete',
  ruta: '/auth/accesibilidad',
  modulo: MODULO,
  seccion: 'Accesibilidad',
  resumen: 'Restablece la accesibilidad de la cuenta',
  descripcion: 'Permite restablecer la accesibilidad de la misma cuenta',
  publico: true,
  exito: { 
    descripcion: 'Preferencias de accesibilidad restablecidas correctamente', 
    schema: RespuestaMensaje 
  },
  errores: [400, 422],
})