import { conDatos, documentar } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'
import { editarPerfilEmpresaSchema } from '@infrastructure/validators/gestionPerfil/perfil.schema'
import { PerfilEmpresaEditado } from '@docs/schemas/perfil.responses'

const MODULO = 'Módulo 2: Gestión de Perfil'

documentar({
  metodo: 'put',
  ruta: '/empresas/{idEmpresa}/perfil',
  modulo: MODULO,
  seccion: 'Perfil de la empresa empleadora',
  resumen: 'Editar perfil de empresa',
  descripcion: 'Actualiza solo los campos enviados y devuelve la cuota obligada recalculada',
  roles: ['empresa'],
  params: ids('idEmpresa'),
  body: editarPerfilEmpresaSchema,
  exito: { 
    descripcion: 'Perfil actualizado', 
    schema: conDatos(PerfilEmpresaEditado)
  },
  errores: [404, 422],
})