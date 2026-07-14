import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { ITokenGenerator, TokenPayload } from '../../../domain/services/ITokenGenerator'
import { UnauthorizedError } from '../../../domain/errors/DomainError'

export class JwtTokenGenerator implements ITokenGenerator {
  private readonly secret: string
  private readonly expiresIn: string

  constructor() {
    this.secret = process.env.JWT_SECRET ?? '12h'
    this.expiresIn = process.env.JWT_EXPIRES_IN ?? '8h'
  }

  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as jwt.SignOptions)
  }

  generateRecoveryToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.secret) as TokenPayload
    } catch {
      throw new UnauthorizedError('Token inválido o expirado')
    }
  }
}
