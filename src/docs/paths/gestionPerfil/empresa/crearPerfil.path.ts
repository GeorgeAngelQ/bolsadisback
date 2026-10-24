import { conDatos, documentar } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'
import { crearPerfilEmpresaSchema } from '@infrastructure/validators/gestionPerfil/perfil.schema'
import { PerfilEmpresaCreado } from '@docs/schemas/perfil.responses'

const MODULO = 'Módulo 2: Gestión de Perfil'

documentar({
  metodo: 'post',
  ruta: '/empresas/{idEmpresa}/perfil',
  modulo: MODULO,
  seccion: 'Perfil de la empresa empleadora',
  resumen: 'Crear perfil de empresa',
  descripcion:
    'Crea el perfil de la empresa y calcula la cuota de inclusión que debe cumplir: ' +
    '3 % del total de trabajadores si es privada o 5 % si es pública, redondeado hacia arriba.\n\n' +
    'Cada empresa puede tener un solo perfil.',
  roles: ['empresa'],
  params: ids('idEmpresa'),
  body: crearPerfilEmpresaSchema,
  exito: { 
    status: 201,
    descripcion: 'Perfil creado', 
    schema: conDatos(PerfilEmpresaCreado) 
  },
  errores: [422],
})