import { Request, Response, NextFunction } from 'express'
import { mapError } from '@infrastructure/errors/ErrorMapper'
import { AuthRequest } from './authMiddleware'

export function errorHandlerMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) return next(err)
  
  const { status, body } = mapError(err)
  const requestId: string | undefined = res.locals.requestId

  report(err, status, req as AuthRequest, requestId)

  if  (status>=500 && requestId) body.requestId = requestId
  res.status(status).json(body)

  function report(
    err: unknown, 
    status: number, 
    req: AuthRequest, 
    requestId?: string
  ): void {
    const head = `[${requestId ?? '-'}] ${req.method} ${req.originalUrl} -> ${status} (usuario: ${req.usuario?.idUsuario ?? ''})`
    if (status >= 500) {
      console.error(head, err)
    }
    else {
      const detalle = err instanceof Error ? `${err.name}: ${err.message}`: String(err)
      console.warn(`${head} ${detalle}`)
    }
  } 
}
