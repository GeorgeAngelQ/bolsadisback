import { z } from 'zod'
import { registry } from '@docs/openapiRegistry'
import type { CrearPerfilCandidatoOutputDto } from '@application/use-cases/gestionPerfil/crearPerfilCandidato/CrearPerfilCandidato.usecase'
import type { SubirCVOutputDto, GenerarCVOutputDto } from '@application/use-cases/gestionPerfil/gestionarCV/GestionarCV.usecase'
import type { RegistrarCertificadoOutputDto } from '@application/use-cases/gestionPerfil/gestionarCertificado/GestionarCertificado.usecase'
import type { CrearPerfilEmpresaOutputDto } from '@application/use-cases/gestionPerfil/gestionarPerfilEmpresa/GestionarPerfilEmpresa.usecase'

export const PerfilCandidatoCreado = registry.register('PerfilCandidatoCreado',z.object({
  idPerfil: z.number().int().openapi({
    example: 12
  }),
  porcentajeCompletitud: z.number().min(0).max(100).openapi({
    description: 'Máximo 80 al crear: el 20% restante lo aporta el CV',
    example: 70
  }),
  mensajeSiguientePaso: z.string().openapi({
    example: 'Perfil creado. Ahora sube tu CV para completarlo'
  }),
}))

export const _perfilCandidatoCreado: z.ZodType<CrearPerfilCandidatoOutputDto> = PerfilCandidatoCreado


export const CvSubido = registry.register('CvSubido', z.object({
  urlCV: z.string().openapi({ 
    example: 'cv/15/3f9a1c-mi-cv.pdf' 
  }),
  accesible: z.boolean().openapi({ 
    description: 'Resultado de la verificación básica de accesibilidad' 
  }),
  advertenciasAccesibilidad: z.array(z.string()).openapi({
    example: ['El PDF podría no ser accesible para lectores de pantalla (sin texto seleccionable)'],
  }),
  porcentajeCompletitud: z.number().int().min(0).max(100).openapi({ 
    example: 100 
  }),
}))

export const _cvSubido: z.ZodType<SubirCVOutputDto> = CvSubido


export const CvGenerado = registry.register('CvGenerado', z.object({
  urlCV: z.string().openapi({
    example: 'cv/12/cv-generado.pdf'
  }),
  porcentajeCompletitud: z.number().int().min(0).max(100).openapi({
    example: 100
  }),
}))


export const CvDescarga = registry.register('CvDescargado', z.object({
  urlDescarga: z.string().url().openapi({
    example: 'http:localhost:5000/uploads/cv/3f9a1c-mi-cv.pdf'
  }),
}))


export const CertificadoRegistrado = registry.register('CertificadoRegistrado', z.object({
  idCertificado: z.number().int().openapi({
    example: 4
  }),
  numeroCarne: z.string().openapi({
    example: 'CONADIS-123456'
  }),
  verificado: z.boolean().openapi({
    description: 'Lo debe verificar un administrador para ser modificado',
    example: false
  }),
  estaVigente: z.boolean().openapi({
    example: true
  }),
  urlDocumento: z.string().optional().openapi({
    description: 'Solo si se adjuntó el archivo'
  }),
}))

export const _certificadoRegistrado: z.ZodType<RegistrarCertificadoOutputDto> = CertificadoRegistrado


export const PerfilEmpresaCreado = registry.register('PerfilEmpresaCreado', z.object({
  idPerfilEmpresa: z.number().int().openapi({
    example: 8
  }),
  cuotaObligada: z.number().int().openapi({
    description: 'Trabajadores con discapacidad que debe tener: 3% en entidad privada y 5% en entidad pública del total',
    example: 6
  }),
  cumpleLey: z.boolean().openapi({
    description: 'Por defecto false al crear el perfil',
    example: false
  }),
}))

export const _perfilEmpresaCreado: z.ZodType<CrearPerfilEmpresaOutputDto> = PerfilEmpresaCreado


export const PerfilEmpresaEditado = registry.register('PerfilEmpresaEditado',z.object({
  cuotaObligada: z.number().int().openapi({
    description: 'Recalculado con los datos actualizados',
    example: 6
  }),
}))

