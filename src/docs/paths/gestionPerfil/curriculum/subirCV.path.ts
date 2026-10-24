import { conDatos, documentar } from '@docs/helpers/documentar'
import { ids } from '@infrastructure/validators/common/common.schemas'
import { subirCvSchema } from '@infrastructure/validators/gestionPerfil/perfil.schema'
import { CvSubido } from '@docs/schemas/perfil.responses'

const MODULO = 'Módulo 2: Gestión de Perfil'

documentar({
  metodo: 'post',
  ruta: '/candidatos/{idCandidato}/cv',
  modulo: MODULO,
  seccion: 'CV del candidato',
  resumen: 'Subir CV',
  descripcion:
    'Sube el CV como `multipart/form-data`. Si el candidato ya tenía uno, lo reemplaza.\n\n' +
    '- **Tipos de archivo aceptados por el almacenamiento:** PDF, DOC, DOCX, PNG y JPEG. El campo `formato` solo admite `pdf` o `docx`.\n' +
    '- **Tamaño:** hasta 5 MB. Entre 5 y 10 MB responde 422; sobre 10 MB responde 413.\n' +
    '- Se verifica la accesibilidad del archivo y el resultado se devuelve en `accesible` y `advertenciasAccesibilidad`.\n' +
    '- Suma 20 puntos al porcentaje de completitud del perfil (tope 100).',
  roles: ['candidato'],
  params: ids('idCandidato'),
  multipart: {
    archivo: { 
      campo: 'archivo', 
      descripcion: 'Archivo del CV' },
    campos: subirCvSchema,
  },
  exito: { 
    descripcion: 'CV subido', 
    schema: conDatos(CvSubido) 
  },
  errores: [404, 422],
})