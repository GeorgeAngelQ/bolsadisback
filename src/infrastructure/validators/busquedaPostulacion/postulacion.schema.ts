import { z } from 'zod';

export const buscarVacantesSchema = z.object({
  palabrasClave: z.string().max(200).optional(),
  sector: z.string().max(100).optional(),
  modalidad: z.enum(['presencial', 'remoto', 'hibrido']).optional(),
  ubicacion: z.string().max(150).optional(),
  remuneracionMinima: z.coerce.number().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
})

export const postularVacanteSchema = z.object({
  cartaPresentacion: z.string().max(2000).optional(),
})

export const calificarPostulacionSchema = z.object({
  calificacion: z.number().int().min(1).max(5),
  comentario: z.string().max(1000).optional(),
})

export const crearAlertaSchema = z.object({
  palabrasClave: z.string().max(255).optional(),
  sectorEconomico: z.string().max(100).optional(),
  modalidad: z.enum(['presencial', 'remoto', 'hibrido', 'todas']).optional(),
  frecuencia: z.enum(['diaria', 'semanal']),
}).refine(d => d.palabrasClave || d.sectorEconomico, {
  message: 'Ingresa al menos una palabra clave o selecciona un sector',
})
