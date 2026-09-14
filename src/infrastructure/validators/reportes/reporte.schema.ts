import { z } from 'zod';

export const generarReporteCuotaSchema = z.object({
  periodo: z.string().regex(/^\d{4}(-\d{2})?$/, 'Formato YYYY o YYYY-MM'),
})

export const generarReporteGlobalSchema = z.object({
  periodo: z.string().regex(/^\d{4}(-\d{2})?$/),
  idsTiposDiscapacidad: z.array(z.number().int().positive()).optional(),
  sector: z.string().optional(),
  distrito: z.string().optional(),
})

export const exportarReporteSchema = z.object({
  formato: z.enum(['pdf', 'excel']),
})