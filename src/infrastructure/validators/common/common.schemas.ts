import {z} from 'zod'

export const texto = (min: number, max: number) => z.string().trim().min(min).max(max)
export const correo = z.string().trim().email('Correo electrónico inválido').max(254)

export const contrasenaNueva = z.string().min(8, 'La contraseña debe contener al menos 8 caracteres').max(72, 'La contraseña no puede superar los 72 caracteres')

export const dni = z.string().trim().regex(/^\d{8}$/, 'El DNI debe tener al menos 8 dígitos')
export const ruc = z.string().trim().regex(/^\d{11}$/, 'El RUC debe tener al menos 11 dígitos')

export const telefono = z.string().trim().max(15).regex(/^[\d+\s()-]*$/, 'Teléfono inválido')


const esFechaReal = (s:string) => {
  const d = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10) === s
}

export const fechaISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').refine(esFechaReal, 'La fecha no existe en el calendario')

export const fechaPasada = fechaISO.refine(f => f <= new Date().toISOString().slice(0,10), 'La fecha no puede ser futura')

export const fechaHoraISO = z.string().datetime({
  offset: true,
  message: 'Formato inválido: emplea ISO 8601, por ejemplo: 2026-10-12T15:30:00-05:00'
})

export const periodo = z.string().regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, 'Formato YYYY o YYYY-MM')


export const idEnBody = z.number().int().positive()
export const idsEnBody = z.array(idEnBody)

export const idEnUrl = z.coerce.number().int().positive()

export const ids = <K extends string>(...nombres: K[]) =>
  z.object(Object.fromEntries(nombres.map(n => [n, idEnUrl])) as Record<K, typeof idEnUrl>)


export const paginacion = (limitePorDefecto = 20, limiteMaximo = 100) => ({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(limiteMaximo).default(limitePorDefecto)
})