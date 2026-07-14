import bcrypt from 'bcryptjs'
import { IPasswordHasher } from '../../../domain/services/IPasswordHasher'

const SALT_ROUNDS = 12

export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, SALT_ROUNDS)
  }

  async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword)
  }
}
