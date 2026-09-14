import { z } from 'zod'

export const crearPerfilCandidatoSchema = z.object({
  resumenProfesional: z.string().max(1000).optional(),
  nivelEducativo: z.enum(['secundaria', 'tecnico', 'universitario', 'posgrado']).optional(),
  idsTiposDiscapacidad: z.array(z.number().int().positive()).min(1, 'Al menos un tipo de discapacidad'),
  ajustesRequeridos: z.array(z.object({
    descripcion: z.string().min(1).max(500),
    tipo: z.enum(['infraestructura', 'tecnologico', 'organizacional', 'comunicacion']),
    prioridad: z.enum(['esencial', 'deseable']),
  })).optional(),
})

export const editarPerfilCandidatoSchema = z.object({
  resumenProfesional: z.string().max(1000).optional(),
  nivelEducativo: z.enum(['secundaria', 'tecnico', 'universitario', 'posgrado']).optional(),
})

export const habilidadSchema = z.object({
  nombre: z.string().min(1).max(100),
  nivel: z.enum(['basico', 'intermedio', 'avanzado']),
  tipo: z.enum(['tecnica', 'blanda']),
})

export const actualizarHabilidadesSchema = z.object({
  habilidades: z.array(habilidadSchema),
})

export const experienciaSchema = z.object({
  id: z.number().int().positive().optional(),
  cargo: z.string().min(1).max(150),
  empresa: z.string().min(1).max(150),
  fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  trabajoActual: z.boolean(),
  descripcion: z.string().max(1000).optional(),
})

export const actualizarExperienciasSchema = z.object({
  experiencias: z.array(experienciaSchema),
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
  formaciones: z.array(formacionSchema),
})

export const registrarCertificadoSchema = z.object({
  numeroCarne: z.string().min(1).max(50),
  fechaEmision: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fechaVencimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export const crearPerfilEmpresaSchema = z.object({
  descripcion: z.string().max(2000).optional(),
  sector: z.string().max(100).optional(),
  tamano: z.enum(['micro', 'pequena', 'mediana', 'grande']).optional(),
  tipoEntidad: z.enum(['privada', 'publica']),
  urlLogo: z.string().url().optional(),
  sitioWeb: z.string().url().optional(),
  politicaInclusion: z.string().max(2000).optional(),
  totalTrabajadores: z.number().int().positive('Debe ser mayor a cero'),
})

export const editarPerfilEmpresaSchema = crearPerfilEmpresaSchema.partial()
