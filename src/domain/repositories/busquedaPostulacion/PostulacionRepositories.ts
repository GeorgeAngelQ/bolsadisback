import { Postulacion } from '../../entities/busquedaPostulacion/Postulacion.entity'
import { 
  RecomendacionVacante, 
  AlertaEmpleo, 
  VacanteGuardada 
} from '../../entities/busquedaPostulacion/PostulacionEntities.entity'
import { EstadoPostulacion } from '../../enums/PostulacionEnums.enum'

export interface IPostulacionRepository {
  findById(id: number): Promise<Postulacion | null>
  findByIdCandidato(idCandidato: number): Promise<Postulacion[]>
  findByIdVacante(idVacante: number): Promise<Postulacion[]>
  existsByIdCandidatoAndIdVacante(idCandidato: number, idVacante: number): Promise<boolean>
  findSinCalificarPorEstado(estados: EstadoPostulacion[]): Promise<Postulacion[]>
  save(postulacion: Postulacion): Promise<Postulacion>
  update(postulacion: Postulacion): Promise<void>
}

export interface IRecomendacionVacanteRepository {
  findByIdCandidato(idCandidato: number): Promise<RecomendacionVacante[]>
  existsByIdCandidatoAndIdVacante(idCandidato: number, idVacante: number): Promise<boolean>
  save(recomendacion: RecomendacionVacante): Promise<RecomendacionVacante>
  update(recomendacion: RecomendacionVacante): Promise<void>
  deleteById(id: number): Promise<void>
}

export interface IAlertaEmpleoRepository {
  findByIdCandidato(idCandidato: number): Promise<AlertaEmpleo[]>
  findById(id: number): Promise<AlertaEmpleo | null>
  findActivas(): Promise<AlertaEmpleo[]>
  save(alerta: AlertaEmpleo): Promise<AlertaEmpleo>
  update(alerta: AlertaEmpleo): Promise<void>
}

export interface IVacanteGuardadaRepository {
  findByIdCandidato(idCandidato: number): Promise<VacanteGuardada[]>
  existsByIdCandidatoAndIdVacante(idCandidato: number, idVacante: number): Promise<boolean>
  countByIdCandidato(idCandidato: number): Promise<number>
  save(favorito: VacanteGuardada): Promise<VacanteGuardada>
  deleteByIdCandidatoAndIdVacante(idCandidato: number, idVacante: number): Promise<void>
}
