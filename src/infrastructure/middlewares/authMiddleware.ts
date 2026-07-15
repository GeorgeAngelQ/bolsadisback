import { Request, Response, NextFunction } from 'express'
import { ITokenGenerator, TokenPayload } from '../../domain/services/ITokenGenerator'
import { UnauthorizedError } from '../../domain/errors/DomainError'

export interface AuthRequest extends Request {
  usuario?: TokenPayload
}

export function createAuthMiddleware(tokenGenerator: ITokenGenerator) {
  return function authMiddleware(
    req: AuthRequest,
    _res: Response,
    next: NextFunction,
  ): void {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Token de autenticación requerido'))
    }

    const token = authHeader.split(' ')[1]

    try {
      const payload = tokenGenerator.verifyAccessToken(token)
      req.usuario = payload
      next()
    } catch {
      next(new UnauthorizedError('Token inválido o expirado'))
    }
  }
}
