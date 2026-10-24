import { conDatos, documentar } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'
import { publicarVacanteSchema } from '@infrastructure/validators/gestionVacante/vacante.schema'
import { VacantePublicada } from '@docs/schemas/vacante.responses'

const MODULO = 'Módulo 3: Gestión de Vacante'

documentar({
  metodo: 'post',
  ruta: '/empresas/{idEmpresa}/vacantes',
  modulo: MODULO,
  seccion: 'Vacante',
  resumen: 'Publicar vacante',
  descripcion:
    'Crea la vacante en estado `pendiente`, a la espera de que un administrador la apruebe (plazo de revisión: 48 horas).\n\n' +
    'Antes de crearla se comprueba, en este orden:\n' +
    '1. La empresa tiene perfil creado.\n' +
    '2. No tiene una sanción activa.\n' +
    '3. No supera el límite de 10 vacantes activas.\n' +
    '4. Se indica al menos un tipo de discapacidad compatible y un ajuste razonable disponible.\n\n' +
    '`fechaCierre`, si se envía, debe ser posterior a la fecha actual.',
  roles: ['empresa'],
  params: ids('idEmpresa'),
  body: publicarVacanteSchema,
  exito: {
    status: 201, 
    descripcion: 'Vacante creada y enviada a revisión', 
    schema: conDatos(VacantePublicada) 
  },
  errores: [404, 422],
})