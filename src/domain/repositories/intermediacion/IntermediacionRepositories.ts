import { 
  AsignacionIntermediador, 
  ObservacionCandidato, 
  SeguimientoPostulacion, 
  DerivacionServicio, 
  CoordinacionEntrevista 
} from '../../entities/intermediacion/IntermediacionEntities.entity'


export interface IAsignacionIntermediadorRepository {
  findById(id: number): Promise<AsignacionIntermediador | null>
  findActivaByIdCandidato(idCandidato: number): Promise<AsignacionIntermediador | null>
  findByIdIntermediador(idIntermediador: number): Promise<AsignacionIntermediador[]>
  countActivasByIdIntermediador(idIntermediador: number): Promise<number>
  existsActivaByIdCandidato(idCandidato: number): Promise<boolean>
  findCandidatosSinAsignar(): Promise<number[]>
  save(asignacion: AsignacionIntermediador): Promise<AsignacionIntermediador>
  update(asignacion: AsignacionIntermediador): Promise<void>
}

export interface IObservacionCandidatoRepository {
  findByIdCandidato(idCandidato: number): Promise<ObservacionCandidato[]>
  findById(id: number): Promise<ObservacionCandidato | null>
  save(obs: ObservacionCandidato): Promise<ObservacionCandidato>
  update(obs: ObservacionCandidato): Promise<void>
  deleteById(id: number): Promise<void>
}

export interface ISeguimientoPostulacionRepository {
  findById(id: number): Promise<SeguimientoPostulacion | null>
  findActivoByIdPostulacion(idPostulacion: number): Promise<SeguimientoPostulacion | null>
  findByIdIntermediador(idIntermediador: number): Promise<SeguimientoPostulacion[]>
  save(seg: SeguimientoPostulacion): Promise<SeguimientoPostulacion>
  update(seg: SeguimientoPostulacion): Promise<void>
}

export interface IDerivacionServicioRepository {
  findById(id: number): Promise<DerivacionServicio | null>
  findByIdSeguimiento(idSeguimiento: number): Promise<DerivacionServicio | null>
  findByIdIntermediador(idIntermediador: number): Promise<DerivacionServicio[]>
  save(der: DerivacionServicio): Promise<DerivacionServicio>
  update(der: DerivacionServicio): Promise<void>
}

export interface ICoordinacionEntrevistaRepository {
  findByIdPostulacion(idPostulacion: number): Promise<CoordinacionEntrevista | null>
  save(coord: CoordinacionEntrevista): Promise<CoordinacionEntrevista>
  update(coord: CoordinacionEntrevista): Promise<void>
}
