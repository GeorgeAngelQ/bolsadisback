import { conDatos, documentar } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'
import { verificarAjustesSchema } from '@infrastructure/validators/gestionVacante/vacante.schema';
import { AjustesVerificados } from '@docs/schemas/vacante.responses';

const MODULO = 'Módulo 3: Gestión de Vacante'

documentar({
  metodo: 'patch',
  ruta: '/vacantes/{id}/ajustes/verificar',
  modulo: MODULO,
  seccion: 'Vacante',
  resumen: 'Verificar ajustes razonables de una vacante',
  descripcion:
    'Un intermediador marca como verificados los ajustes razonables que ofrece la vacante y detecta brechas frente a lo que ' +
    'necesita un candidato concreto.\n\n' +
    '- Los ids de `idsAjustesVerificados` que no pertenecen a la vacante se ignoran y no cuentan en `ajustesVerificados`.\n' +
    '- Una brecha se reporta solo para ajustes **esenciales** del perfil del candidato cuyo tipo no ofrece la vacante.\n' +
    '- `idUsuarioEmpresa` es el usuario de la empresa que recibe la notificación.',
  roles: ['intermediador'],
  params: ids('id'),
  body: verificarAjustesSchema,
  exito: { 
    descripcion: 'Verificación registrada', 
    schema: conDatos(AjustesVerificados) 
  },
  errores: [400, 401,403, 413, 422],
})