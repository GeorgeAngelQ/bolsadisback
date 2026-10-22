import { z } from 'zod';
import { texto, periodo, idEnBody, idEnUrl } from '@infrastructure/validators/common/common.schemas'

export const generarReporteCuotaSchema = z.object({
  periodo,
})

export const generarReporteGestionSchema = z.object({
  periodo,
})

export const generarReporteGlobalSchema = z.object({
  periodo,
  idsTiposDiscapacidad: z.array(idEnBody).max(20).optional(),
  sector: texto(1,100).optional(),
  distrito: texto(1,100).optional(),
})

export const compararReportesSchema = z.object({
  periodoActual: periodo,
  periodoAnterior: periodo,
})

export const consolidadoQuerySchema = z.object({ 
  periodo 
})

export const exportarParamsSchema = z.object({
  tipo: z.enum(['cuota', 'gestion', 'global']),
  id: idEnUrl,
})