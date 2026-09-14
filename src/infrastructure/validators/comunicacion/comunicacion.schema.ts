import { z } from 'zod';

export const enviarMensajeSchema = z.object({
  contenido: z.string().min(1, 'El mensaje no puede estar vacío').max(5000),
})

export const enviarMasivo = z.object({
  idsCandidatos: z.array(z.number().int().positive()).min(1, 'Selecciona al menos un candidato'),
  contenido: z.string().min(1).max(5000),
})

export const crearPlantillaSchema = z.object({
  nombre: z.string().min(2).max(150),
  asunto: z.string().max(255).optional(),
  cuerpo: z.string().min(1, 'El cuerpo no puede estar vacío'),
  evento: z.string().min(1, 'Debe asociar la plantilla a un evento'),
  rolesDestino: z.string().max(255).optional(),
})