import { crearRolSchema } from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'
import { documentar, RespuestaMensaje } from '@docs/helpers/documentar'

const MODULO = 'Módulo 1: Acceso y Registro'

documentar({
  metodo: 'post',
  ruta: '/auth/roles',
  modulo: MODULO,
  seccion: 'Gestión de Roles',
  resumen: 'Crear rol',
  descripcion: 'Permite al administrador crear un nuevo rol',
  roles: ['admin', 'superadmin'],
  body: crearRolSchema,
  exito: { 
    descripcion: 'Rol creado correctamente', 
    schema: RespuestaMensaje 
  },
  errores: [400, 401,403, 413, 422],
})