import { ComoJson } from './../helpers/tipos';
import { z } from 'zod'
import { registry } from '@docs/openapiRegistry'
import { VacantePendienteOutputDto } from '@application/use-cases/gestionVacante/aprobarRechazarVacante/AprobarRechazarVacante.usecase';
import { EstadoVacante } from '@domain/enums/VacanteEnums.enum';
import { PublicarVacanteOutputDto } from '@application/use-cases/gestionVacante/publicarVacante/PublicarVacante.usecase';
import { VerificarAjustesOutputDto } from '@application/use-cases/gestionVacante/verificarAjustesRazonables/VerificarAjustesRazonablesVacante.usecase';

export const VacantePublicada = registry.register('VacantePublicada', z.object({
  idVacante: z.number().int().openapi({
    example: 31
  }),
  titulo: z.string().openapi({
    example: 'Analista de datos'
  }),
  estado: z.nativeEnum(EstadoVacante).openapi({
    description: 'Siempre `pendiente` al crear',
    example: EstadoVacante.PENDIENTE 
  }),
  mensaje: z.string().openapi({
    example: 'Vacante enviada para revisión. Será publicada una vez aprobada por el administrador'
  })
}))

export const _vacantePublicada: z.ZodType<PublicarVacanteOutputDto> = VacantePublicada


export const VacantePendiente = registry.register('VacantePendiente', z.object({
  idVacante: z.number().int().openapi({
    example: 31
  }),
  titulo: z.string().openapi({
    example: 'Analista de datos'
  }),
  idEmpresa: z.number().int().openapi({
    example: 8
  }),
  fechaPublicacion: z.string().datetime().optional().openapi({
    description: 'Fecha en la que la empresa la envió a revisión'
  }),
  horasTranscurridas: z.number().int().openapi({
    example: 52
  }),
  superaPlazo: z.boolean().openapi({
    description: 'true si pasaron 48 horas o más sin revisarla',
    example: true
  })
}))

export const _vacantePendiente:z.ZodType<ComoJson<VacantePendienteOutputDto>> = VacantePendiente 


export const AjustesVerificados = registry.register('AjustesVerificados', z.object({
  ajustesVerificados: z.number().int().openapi({
    description: 'Cuantos de los ids enviados pertenecían a la vacante y quedaron verificados',
    example: 2
  }),
  brechasDetectadas: z.array(z.string()).openapi({
    description: 'Ajustes esenciales que requiere el candidato y la vacante no cubre',
    example: ['Ajuste esencial "Intérprete de lengua de señas" no cubierto por la vacante']
  }),
  todosVerificados: z.boolean().openapi({
    description: 'true si quedaron verificados todos los ajustes de la vacante'
  })
}))

export const _ajustesVerificados: z.ZodType<VerificarAjustesOutputDto> = AjustesVerificados