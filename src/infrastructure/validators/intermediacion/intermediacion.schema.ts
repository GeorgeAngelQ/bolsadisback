import { z } from 'zod';

export const registrarObservacionSchema = z.object({
  contenido: z.string().min(1, 'El contenido no puede estar vacío').max(2000),
  tipo: z.enum(['habilidad', 'necesidad', 'seguimiento', 'alerta']),
})

export const programarEntrevistaSchema = z.object({
  fechaEntrevista: z.string().datetime('Formato de fecha inválido'),
  modalidad: z.enum(['presencial', 'virtual']),
  lugar: z.string().max(255).optional(),
  urlReunion: z.string().url().optional(),
  ajustesNecesarios: z.string().max(1000).optional(),
})

export const registrarResultadoSchema = z.object({
  resultado: z.enum(['contratado', 'rechazado', 'retirado', 'derivado', 'en_proceso']),
})

export const registrarDerivacionSchema = z.object({
  tipoServicio: z.enum(['capacitacion', 'salud', 'legal', 'psicologico', 'otro']),
  entidadDestino: z.string().min(1, 'Entidad destino requerida').max(200),
  motivo: z.string().min(1, 'Motivo requerido').max(1000),
})
