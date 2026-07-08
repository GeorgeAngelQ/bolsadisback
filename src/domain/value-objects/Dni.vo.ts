import { BusinessRuleViolationError } from '../errors/DomainError'

export class Dni {
  private readonly value: string

  constructor(dni: string) {
    const regex = /^\d{8}$/
    if (!regex.test(dni)) {
      throw new BusinessRuleViolationError('DNI', 'El DNI debe contener exactamente 8 dígitos')
    }
    this.value = dni
  }

  getValue(): string {
    return this.value
  }

  equals(other: Dni): boolean {
    return this.value === other.value
  }
}
