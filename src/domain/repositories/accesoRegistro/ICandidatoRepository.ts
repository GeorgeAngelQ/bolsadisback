import { Candidato } from '../../entities/accesoRegistro/Candidato.entity'

export interface ICandidatoRepository {
  findById(id: number): Promise<Candidato | null>
  findByIdUsuario(idUsuario: number): Promise<Candidato | null>
  existsByDni(dni: string): Promise<boolean>
  save(candidato: Candidato): Promise<Candidato>
  update(candidato: Candidato): Promise<void>
}
