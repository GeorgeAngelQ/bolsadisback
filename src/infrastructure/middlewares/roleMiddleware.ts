import { Response, NextFunction } from 'express'
import { AuthRequest } from './authMiddleware'
import { ForbiddenError, UnauthorizedError } from '../../domain/errors/DomainError'

export function requireRol(...rolesPermitidos: string[]) {
  return function roleMiddleware(
    req: AuthRequest,
    _res: Response,
    next: NextFunction,
  ): void {
    if (!req.usuario) {
      return next(new UnauthorizedError('No autenticado'))
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return next(
        new ForbiddenError(
          `Acceso denegado. Se requiere uno de los roles: ${rolesPermitidos.join(', ')}`,
        ),
      )
    }

    next()
  }
}

export function requireCandidato() {
  return requireRol('candidato')
}

export function requireEmpresa() {
  return requireRol('empresa')
}

export function requireIntermediador() {
  return requireRol('intermediador')
}

export function requireAdministrador() {
  return requireRol('admin', 'superadmin')
}

export function requireIntermediadorOAdministrador() {
  return requireRol('intermediador', 'admin', 'superadmin')
}

export function requireEmpresaOAdministrador() {
  return requireRol('empresa', 'admin', 'superadmin')
}
