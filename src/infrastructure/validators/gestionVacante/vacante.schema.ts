import { z } from 'zod'

export const publicarVacanteSchema = z.object({
  titulo: z.string().min(2).max(200),
  descripcion: z.string().min(10),
  requisitos: z.string().optional(),
  categoriaLaboral: z.string().max(100).optional(),
  sectorEconomico: z.string().max(100).optional(),
  modalidad: z.enum(['presencial', 'remoto', 'hibrido']),
  remuneracion: z.number().positive().optional(),
  ubicacion: z.string().max(150).optional(),
  fechaCierre: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  idsTiposDiscapacidad: z.array(z.number().int().positive()).min(1),
  ajustesDisponibles: z.array(z.object({
    descripcion: z.string().min(1).max(500),
    tipo: z.enum(['infraestructura', 'tecnologico', 'organizacional', 'comunicacion']),
  })).min(1),
})

export const editarVacanteSchema = publicarVacanteSchema.partial().omit({
  idsTiposDiscapacidad: true,
  ajustesDisponibles: true,
}).extend({
  idsTiposDiscapacidad: z.array(z.number().int().positive()).min(1).optional(),
  ajustesDisponibles: z.array(z.object({
    descripcion: z.string().min(1).max(500),
    tipo: z.enum(['infraestructura', 'tecnologico', 'organizacional', 'comunicacion']),
  })).min(1).optional(),
})

export const rechazarVacanteSchema = z.object({
  motivoRechazo: z.string().min(10, 'El motivo debe tener al menos 10 caracteres').max(1000),
})

export const registrarSancionSchema = z.object({
  motivo: z.string().min(10).max(1000),
  normativaInfringida: z.string().max(255).optional(),
})

export const reporteContenidoSchema = z.object({
  motivo: z.string().min(1).max(200),
  descripcion: z.string().min(10, 'Describe brevemente el problema').max(1000),
})
