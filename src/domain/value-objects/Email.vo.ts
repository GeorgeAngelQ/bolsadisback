import { BusinessRuleViolationError } from '../errors/DomainError'

export class Email {
  private readonly value: string

  constructor(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(email)) {
      throw new BusinessRuleViolationError('Email', 'El formato del correo electrónico no es válido')
    }
    this.value = email.toLowerCase().trim()
  }

  getValue(): string {
    return this.value
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }
}
