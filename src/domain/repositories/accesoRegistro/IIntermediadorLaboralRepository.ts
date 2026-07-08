import { IntermediadorLaboral } from '../../entities/accesoRegistro/IntermediadorLaboral.entity'

export interface IIntermediadorLaboralRepository {
  findById(id: number): Promise<IntermediadorLaboral | null>
  findByIdUsuario(idUsuario: number): Promise<IntermediadorLaboral | null>
  existsByDni(dni: string): Promise<boolean>
  save(intermediador: IntermediadorLaboral): Promise<IntermediadorLaboral>
  update(intermediador: IntermediadorLaboral): Promise<void>
}
