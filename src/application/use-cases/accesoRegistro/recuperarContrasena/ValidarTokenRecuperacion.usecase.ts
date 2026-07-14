import { ICredencialAccesoRepository } from '../../../../domain/repositories/accesoRegistro/ICredencialAccesoRepository'
import { EntityNotFoundError } from '../../../../domain/errors/DomainError'

export interface ValidarTokenInputDto {
  token: string
}

export interface ValidarTokenOutputDto {
  idUsuario: number
  tokenValido: boolean
}

export class ValidarTokenRecuperacionUseCase {
  constructor(
    private readonly credencialRepository: ICredencialAccesoRepository,
  ) {}

  async execute(input: ValidarTokenInputDto): Promise<ValidarTokenOutputDto> {
    const credencial = await this.credencialRepository.findByToken(input.token)

    if (!credencial) {
      throw new EntityNotFoundError('Token de recuperación', input.token)
    }

    // RN-06: la validación de expiración está encapsulada en la entidad
    credencial.validarToken(input.token)

    return {
      idUsuario: credencial.idUsuario,
      tokenValido: true,
    }
  }
}
