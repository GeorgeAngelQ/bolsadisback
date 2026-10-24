import { documentar, RespuestaDatos } from '@docs/helpers/documentar'

const MODULO = 'Módulo 1: Acceso y Registro'

documentar({
  metodo: 'get',
  ruta: '/auth/roles',
  modulo: MODULO,
  seccion: 'Gestión de Roles',
  resumen: 'Listar roles',
  descripcion: 'Permite al administrador listar los roles existentes',
  roles: ['admin', 'superadmin'],
  exito: { 
    descripcion: 'Roles listados correctamente', 
    schema: RespuestaDatos 
  },
  errores: [400, 401,403, 413, 422],
})