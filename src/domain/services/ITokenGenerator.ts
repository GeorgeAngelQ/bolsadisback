export interface TokenPayload {
  idUsuario: number
  rol: string
  correo: string
}

export interface ITokenGenerator {
  generateAccessToken(payload: TokenPayload): string
  generateRecoveryToken(): string
  verifyAccessToken(token: string): TokenPayload
}
