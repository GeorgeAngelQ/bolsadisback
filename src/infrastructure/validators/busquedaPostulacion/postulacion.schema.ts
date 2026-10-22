import { z } from 'zod';
import { texto, idEnBody, paginacion } from '@infrastructure/validators/common/common.schemas'
import { ModalidadTrabajo } from '@domain/enums/VacanteEnums.enum'
import { FrecuenciaAlerta } from '@domain/enums/PostulacionEnums.enum'

export const buscarVacantesSchema = z.object({
  palabrasClave: texto(1,200).optional(),
  sector: texto(1,100).optional(),
  modalidad: z.nativeEnum(ModalidadTrabajo).optional(),
  ubicacion: texto(1,150).optional(),
  remuneracionMinima: z.coerce.number().positive().optional(),
  ...paginacion(20,50),
})

export const postularVacanteSchema = z.object({
  cartaPresentacion: texto(1,2000).optional(),
})

export const calificarPostulacionSchema = z.object({
  calificacion: z.number().int().min(1).max(5),
  comentario: texto(1,1000).optional(),
})

const alertaBase = z.object({
  palabrasClave: texto(1,255).optional(),
  sectorEconomico: texto(1,100).optional(),
  modalidad: z.union([z.nativeEnum(ModalidadTrabajo), z.literal('todas')]).optional(),
  frecuencia: z.nativeEnum(FrecuenciaAlerta),
})

export const crearAlertaSchema = alertaBase.refine(d => d.palabrasClave || d.sectorEconomico, {
  message: 'Ingresa al menos una palabra clave o selecciona un sector',
})

export const editarAlertaSchema = alertaBase.partial()

export const crearRecomendacionManualSchema = z.object({
  idIntermediador: idEnBody.optional(),
})
