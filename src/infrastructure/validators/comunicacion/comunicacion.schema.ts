import { z } from 'zod';
import { texto, idEnBody } from '@infrastructure/validators/common/common.schemas'

export const iniciarConversacionSchema = z.object({
  idPostulacion: idEnBody,
  tipoEmisor: z.enum(['candidato', 'empresa', 'intermediador']),
  idUsuarioReceptor: idEnBody,
})

export const enviarMensajeSchema = z.object({
  contenido: texto(1,5000),
  idDestinatario: idEnBody,
})

export const enviarMasivoSchema = z.object({
  idsCandidatos: z.array(idEnBody).min(1, 'Selecciona al menos un candidato').max(500),
  contenido: texto(1,5000),
})

export const crearPlantillaSchema = z.object({
  nombre: texto(2,150),
  asunto: texto(2,255).optional(),
  cuerpo: texto(1,10000),
  evento: texto(1,100),
  rolesDestino: texto(1,255).optional(),
})

export const editarPlantillaSchema = crearPlantillaSchema.partial()