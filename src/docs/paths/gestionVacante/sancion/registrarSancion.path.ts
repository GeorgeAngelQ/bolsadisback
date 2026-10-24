import { documentar, mensaje } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'
import { registrarSancionSchema } from '@infrastructure/validators/gestionVacante/vacante.schema'

const MODULO = 'Módulo 3: Gestión de Vacante'

documentar({
  metodo: 'post',
  ruta: '/empresas/{idEmpresa}/sanciones',
  modulo: MODULO,
  seccion: 'Sanción a la empresa',
  resumen: 'Registrar sanción',
  descripcion: 'Registra una sanción en estado activo. Mientras la empresa tenga una sanción activa no puede publicar vacantes',  
  roles: ['admin', 'superadmin'],
  params: ids('idEmpresa'),
  body: registrarSancionSchema,
  exito: { 
    status: 201,
    descripcion: 'Sanción registrada', 
    schema: mensaje('Sanción registrada correctamente') 
  },
})