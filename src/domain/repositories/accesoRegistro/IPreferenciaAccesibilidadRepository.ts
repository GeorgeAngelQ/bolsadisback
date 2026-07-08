import { PreferenciaAccesibilidad } from '../../entities/accesoRegistro/PreferenciaAccesibilidad.entity'

export interface IPreferenciaAccesibilidadRepository {
  findByIdUsuario(idUsuario: number): Promise<PreferenciaAccesibilidad | null>
  save(preferencia: PreferenciaAccesibilidad): Promise<PreferenciaAccesibilidad>
  update(preferencia: PreferenciaAccesibilidad): Promise<void>
}
