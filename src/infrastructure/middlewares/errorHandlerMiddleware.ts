import { Request, Response, NextFunction } from 'express'
import {
  DomainError,
  EntityNotFoundError,
  BusinessRuleViolationError,
  DuplicateEntityError,
  InvalidEntityStateError,
  UnauthorizedError,
} from '../../domain/errors/DomainError'

export function errorHandlerMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(`[Error] ${err.name}: ${err.message}`)

  if (err instanceof UnauthorizedError) {
    res.status(401).json({ error: err.message, code: 'UNAUTHORIZED' })
    return
  }

  if (err instanceof EntityNotFoundError) {
    res.status(404).json({ error: err.message, code: 'NOT_FOUND' })
    return
  }

  if (err instanceof DuplicateEntityError) {
    res.status(409).json({ error: err.message, code: 'DUPLICATE' })
    return
  }

  if (err instanceof BusinessRuleViolationError) {
    res.status(422).json({ error: err.message, code: 'BUSINESS_RULE_VIOLATION' })
    return
  }

  if (err instanceof InvalidEntityStateError) {
    res.status(422).json({ error: err.message, code: 'INVALID_STATE' })
    return
  }

  if (err instanceof DomainError) {
    res.status(400).json({ error: err.message, code: 'DOMAIN_ERROR' })
    return
  }

  // Error no controlado
  res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
  })
}
