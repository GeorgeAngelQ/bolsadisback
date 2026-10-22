import { z } from 'zod';
import { texto, fechaHoraISO, idEnBody } from '@infrastructure/validators/common/common.schemas'
import {
  TipoObservacion, ResultadoSeguimiento, TipoServicioExterno, EstadoDerivacion, ModalidadEntrevista,
} from '@domain/enums/IntermediacionEnums.enum'


const legado = {
  idUsuarioCandidato: idEnBody.optional(),
  idUsuarioIntermediador: idEnBody.optional(),
}

export const registrarObservacionSchema = z.object({
  contenido: texto(1,2000),
  tipo: z.nativeEnum(TipoObservacion),
})

export const registrarNotasSchema = z.object({
  notas: texto(1,2000),
})

export const programarEntrevistaSchema = z.object({
  fechaEntrevista: fechaHoraISO,
  modalidad: z.nativeEnum(ModalidadEntrevista),
  lugar: texto(1,255).optional(),
  urlReunion: z.string().trim().url().max(500).optional(),
  ajustesNecesarios: texto(1,1000).optional(),
  ...legado
})

export const registrarResultadoSchema = z.object({
  resultado: z.nativeEnum(ResultadoSeguimiento),
  idPostulacion: idEnBody.optional(),
  idUsuarioCandidato: legado.idUsuarioCandidato,
})

export const registrarDerivacionSchema = z.object({
  tipoServicio: z.nativeEnum(TipoServicioExterno),
  entidadDestino: texto(1,200),
  motivo: texto(1,1000),
  idUsuarioCandidato: legado.idUsuarioCandidato,
})

export const actualizarEstadoDerivacionSchema = z.object({
  nuevoEstado: z.nativeEnum(EstadoDerivacion),
  idUsuarioCandidato: legado.idUsuarioCandidato,
})
