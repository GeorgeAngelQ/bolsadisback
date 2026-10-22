import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { FieldError } from '@shared/errors/AppError'
import { ValidationError } from '@shared/errors/ValidationError'
import '../validators/common/zodSpanish'

type Origen = 'params' | 'query' | 'body'

export interface EsquemasDeRuta {
  params?: ZodSchema
  query?: ZodSchema
  body?: ZodSchema
}
export function validate(esquemas: EsquemasDeRuta) {
  return function validationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const errores: FieldError[] = []
    const validados: Partial<Record<Origen, unknown>> = {}

    for (const origen of ['params', 'query', 'body'] as const) {
      const schema = esquemas[origen]
      
      if (!schema) continue

      const resultado = schema.safeParse(req[origen] ?? {})

      if (resultado.success) {
        validados[origen] = resultado.data
        continue
      }

      for (const issue of resultado.error.issues) {
        const ruta = [origen === 'body' ? '' : origen, ...issue.path].filter(p => p !== '').join('.')
        errores.push({
          campo: ruta,
          mensaje: issue.message
        })
      }
    }

    if (errores.length > 0) {
      return next(new ValidationError('Datos de entrada inválidos', {fields: errores}))
    }

    for (const origen of ['params', 'query', 'body'] as const) {
      if (!(origen in validados)) continue
      Object.defineProperty(req, origen, {
        value: validados[origen],
        writable: true,
        configurable: true
      })
    }
    next()
  }
}

export function validar(schema: ZodSchema, origen: Origen = 'body') {
  return validate({ [origen]: schema })
}
