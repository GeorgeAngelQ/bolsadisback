import { z } from 'zod'
import { texto, fechaISO, idEnBody } from '@infrastructure/validators/common/common.schemas'
import {
  NivelEducativo, NivelHabilidad, TipoHabilidad, TipoAjusteRazonable, PrioridadAjuste, TamanoEmpresa,
} from '@domain/enums/PerfilEnums.enum'

const MAX_ITEMS = 50

export const ajusteRequeridoSchema = z.object({
  descripcion: texto(1,500),
  tipo: z.nativeEnum(TipoAjusteRazonable),
  priordad: z.nativeEnum(PrioridadAjuste),
})

export const crearPerfilCandidatoSchema = z.object({
  resumenProfesional: texto(1,1000).optional(),
  nivelEducativo: z.nativeEnum(NivelEducativo).optional(),
  idsTiposDiscapacidad: z.array(idEnBody).min(1, 'Al menos un tipo de discapacidad'),
  ajustesRequeridos: z.array(ajusteRequeridoSchema).max(MAX_ITEMS).optional(),
})

export const editarPerfilCandidatoSchema = z.object({
  resumenProfesional: texto(1,1000).optional(),
  nivelEducativo: z.nativeEnum(NivelEducativo).optional(),
})

export const habilidadSchema = z.object({
  nombre: texto(1,100),
  nivel: z.nativeEnum(NivelHabilidad),
  tipo: z.nativeEnum(TipoHabilidad),
})

export const actualizarHabilidadesSchema = z.object({
  habilidades: z.array(habilidadSchema).max(MAX_ITEMS),
})

export const experienciaSchema = z.object({
  id: idEnBody.optional(),
  cargo: texto(1,150),
  empresa: texto(1,150),
  fechaInicio: fechaISO,
  fechaFin: fechaISO.optional(),
  trabajoActual: z.boolean(),
  descripcion: texto(1,1000).optional(),
}).refine(e => !e.fechaFin || e.fechaFin >= e.fechaInicio, {
  message: 'La fecha de fin no puede ser anterior a la de inicio',
  path: ['fechaFin'],
})

export const actualizarExperienciasSchema = z.object({
  experiencias: z.array(experienciaSchema).max(MAX_ITEMS),
})

export const formacionSchema = z.object({
  id: z.number().int().positive().optional(),
  institucion: z.string().min(1).max(200),
  titulo: z.string().min(1).max(200),
  nivel: z.enum(['secundaria', 'tecnico', 'universitario', 'posgrado']),
  fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  enCurso: z.boolean(),
})

export const actualizarFormacionesSchema = z.object({
  formaciones: z.array(formacionSchema).max(MAX_ITEMS),
})

export const subirCvSchema = z.object({
  formato: z.enum(['pdf','docx'])
})

export const certificadoCampos = z.object({
  numeroCarne: texto(1, 50),
  fechaEmision: fechaISO,
  fechaVencimiento: fechaISO.optional(),
})

export const registrarCertificadoSchema = certificadoCampos
  .refine(c => !c.fechaVencimiento || c.fechaVencimiento >= c.fechaEmision, {
    message: 'La fecha de vencimiento no puede ser anterior a la de emisión',
    path: ['fechaVencimiento'],
  })

const perfilEmpresaBase = z.object({
  descripcion: texto(1,2000).optional(),
  sector: texto(1,100).optional(),
  tamano: z.nativeEnum(TamanoEmpresa).optional(),
  tipoEntidad: z.enum(['privada', 'publica']),
  urlLogo: z.string().trim().url().max(500).optional(),
  sitioWeb: z.string().trim().url().max(500).optional(),
  politicaInclusion: texto(1,200).optional(),
  totalTrabajadores: z.number().int().positive('Debe ser mayor a cero')
})


export const crearPerfilEmpresaSchema = perfilEmpresaBase
export const editarPerfilEmpresaSchema = perfilEmpresaBase.partial()
