import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export function validar(schema: ZodSchema, origen: 'body' | 'query' | 'params' = 'body') {
  return function validationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const resultado = schema.safeParse(req[origen])

    if (!resultado.success) return next(resultado.error)
    if (origen === 'query') {
      Object.defineProperty(req, 'query', {
        value: resultado.data,
        writable: true,
        configurable: true
      })
    } else {
      req[origen] = resultado.data
    }
  }
}
