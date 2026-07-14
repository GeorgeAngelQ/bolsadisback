import { IPreferenciaAccesibilidadRepository } from '../../../../domain/repositories/accesoRegistro/IPreferenciaAccesibilidadRepository'
import { EntityNotFoundError } from '../../../../domain/errors/DomainError'
import { PreferenciaAccesibilidadProps } from '../../../../domain/entities/accesoRegistro/PreferenciaAccesibilidad.entity'

export type ObtenerPreferenciasOutputDto = Omit<PreferenciaAccesibilidadProps, 'id' | 'idUsuario'>

export class ObtenerPreferenciasAccesibilidadUseCase {
  constructor(
    private readonly preferenciaRepository: IPreferenciaAccesibilidadRepository,
  ) {}

  async execute(idUsuario: number): Promise<ObtenerPreferenciasOutputDto> {
    const preferencia = await this.preferenciaRepository.findByIdUsuario(idUsuario)
    if (!preferencia) throw new EntityNotFoundError('PreferenciaAccesibilidad', idUsuario)

    return preferencia.toPlainObject()
  }
}
