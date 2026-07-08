import { PerfilCandidato } from '../../entities/gestionPerfil/PerfilCandidato.entity'

export interface IPerfilCandidatoRepository {
  findById(id: number): Promise<PerfilCandidato | null>
  findByIdCandidato(idCandidato: number): Promise<PerfilCandidato | null>
  existsByIdCandidato(idCandidato: number): Promise<boolean>
  save(perfil: PerfilCandidato): Promise<PerfilCandidato>
  update(perfil: PerfilCandidato): Promise<void>
}
