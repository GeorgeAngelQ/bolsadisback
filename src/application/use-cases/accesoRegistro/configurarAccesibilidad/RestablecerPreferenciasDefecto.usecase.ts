import { IPreferenciaAccesibilidadRepository } from '../../../../domain/repositories/accesoRegistro/IPreferenciaAccesibilidadRepository'
import { EntityNotFoundError } from '../../../../domain/errors/DomainError'

export class RestablecerPreferenciasDefectoUseCase {
  constructor(
    private readonly preferenciaRepository: IPreferenciaAccesibilidadRepository,
  ) {}

  async execute(idUsuario: number): Promise<void> {
    const preferencia = await this.preferenciaRepository.findByIdUsuario(idUsuario)
    if (!preferencia) throw new EntityNotFoundError('PreferenciaAccesibilidad', idUsuario)

    preferencia.restablecerDefecto()
    await this.preferenciaRepository.update(preferencia)
  }
}
