import { z } from 'zod';
import { texto, fechaISO, fechaHoraISO, paginacion } from '@infrastructure/validators/common/common.schemas'

export const publicarContenidoSchema = z.object({
  titulo: texto(2,255),
  cuerpo: texto(10,50000),
  tipo: z.enum(['guia', 'noticia', 'recurso', 'normativa']),
})

export const editarContenidoSchema = publicarContenidoSchema.partial()

export const actualizarConfigAccesibilidadSchema = z.object({
  nivelWCAG: z.enum(['A', 'AA', 'AAA']).optional(),
  contrastesDisponibles: texto(1,500).optional(),
  tamanosTextoDisponibles: texto(1,500).optional(),
  soporteLSP: z.boolean().optional(),
  subtitulosAutomaticos: z.boolean().optional(),
})

export const programarMantenimientoSchema = z.object({
  fechaInicio: fechaHoraISO,
  duracionEstimadaMinutos: z.number().int().positive(),
  motivo: texto(10,500),
})

const fechaOFechaHora = z.union([fechaISO,fechaHoraISO])

export const filtrosAuditoriaSchema = z.object({
  idUsuario: z.coerce.number().int().positive().optional(),
  modulo: texto(1,50).optional(),
  accion: texto(1,100).optional(),
  fechaDesde: fechaOFechaHora.optional(),
  fechaHasta: fechaOFechaHora.optional(),
  resultado: z.enum(['exitoso', 'fallido']).optional(),
  ...paginacion(50,100),
})