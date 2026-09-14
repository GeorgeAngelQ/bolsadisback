import { z } from 'zod';

export const publicarContenidoSchema = z.object({
  titulo: z.string().min(2).max(255),
  cuerpo: z.string().min(10),
  tipo: z.enum(['guia', 'noticia', 'recurso', 'normativa']),
})

export const actualizarConfigAccesibilidadSchema = z.object({
  nivelWCAG: z.enum(['A', 'AA', 'AAA']).optional(),
  contrastesDisponibles: z.string().optional(),
  tamanosTextoDisponibles: z.string().optional(),
  soporteLSP: z.boolean().optional(),
  subtitulosAutomaticos: z.boolean().optional(),
})

export const programarMantenimientoSchema = z.object({
  fechaInicio: z.string().datetime('Formato datetime inválido'),
  duracionEstimadaMinutos: z.number().int().positive(),
  motivo: z.string().min(10).max(500),
})

export const filtrosAuditoriaSchema = z.object({
  idUsuario: z.coerce.number().int().positive().optional(),
  modulo: z.string().optional(),
  accion: z.string().optional(),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional(),
  resultado: z.enum(['exitoso', 'fallido']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})