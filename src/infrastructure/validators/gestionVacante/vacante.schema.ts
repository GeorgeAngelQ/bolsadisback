import { z } from 'zod'
import { texto, fechaISO, idEnBody } from '@infrastructure/validators/common/common.schemas'
import { TipoAjusteRazonable } from '@domain/enums/PerfilEnums.enum'
import { ModalidadTrabajo } from '@domain/enums/VacanteEnums.enum'

export const ajusteDisponibleSchema = z.object({
  descripcion: texto(1,500),
  tipo: z.nativeEnum(TipoAjusteRazonable),
})

export const vacanteBase = z.object({
  titulo: texto(2,200),
  descripcion: texto(10,10000),
  requisitos: texto(1,5000).optional(),
  categoriaLaboral: texto(1,100).optional(),
  sectorEconomico: texto(1,100).optional(),
  modalidad: z.nativeEnum(ModalidadTrabajo),
  remuneracion: z.number().positive().optional(),
  ubicacion: texto(1,150).optional(),
  fechaCierre: fechaISO.optional(),
  idsTiposDiscapacidad: z.array(idEnBody).min(1).max(20),
  ajustesDisponibles: z.array(ajusteDisponibleSchema).min(1).max(50),
})

export const publicarVacanteSchema = vacanteBase

export const editarVacanteSchema = vacanteBase.partial()


export const aprobarVacanteSchema = z.object({
  idUsuarioEmpresa: idEnBody.optional()
})

export const rechazarVacanteSchema = z.object({
  motivoRechazo: texto(10, 1000),
  idUsuarioEmpresa: idEnBody.optional(),
})

export const verificarAjustesSchema = z.object({
  idCandidato: idEnBody,
  idIntermediador: idEnBody,
  idsAjustesVerificados: z.array(idEnBody).min(1).max(100),
  idUsuarioEmpresa: idEnBody.optional(),
})

export const registrarSancionSchema = z.object({
  motivo: texto(10,1000),
  normativaInfringida: texto(1,255).optional(),
})

export const reporteContenidoSchema = z.object({
  motivo: texto(1,200),
  descripcion: texto(10, 1000),
})
