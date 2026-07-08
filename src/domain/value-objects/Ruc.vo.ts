import { BusinessRuleViolationError } from '../errors/DomainError'

export class Ruc {
  private readonly value: string

  constructor(ruc: string) {
    const regex = /^\d{11}$/
    if (!regex.test(ruc)) {
      throw new BusinessRuleViolationError('RUC', 'El RUC debe contener exactamente 11 dígitos')
    }
    this.value = ruc
  }

  getValue(): string {
    return this.value
  }

  equals(other: Ruc): boolean {
    return this.value === other.value
  }
}
