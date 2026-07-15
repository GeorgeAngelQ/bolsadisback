import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export function validar(schema: ZodSchema, origen: 'body' | 'query' | 'params' = 'body') {
  return function validationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    try {
      const datos = req[origen]
      const resultado = schema.parse(datos)
      req[origen] = resultado
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: 'Datos de entrada inválidos',
          code: 'VALIDATION_ERROR',
          detalles: err.errors.map(e => ({
            campo: e.path.join('.'),
            mensaje: e.message,
          })),
        })
        return
      }
      next(err)
    }
  }
}
