import { Vacante } from '../../entities/gestionVacante/Vacante.entity'
import { AjusteRazonableDisponible } from '../../entities/gestionVacante/AjusteRazonableDisponible.entity'
import { SancionEmpresa } from '../../entities/gestionVacante/SancionEmpresa.entity'
import { EstadoVacante } from '../../enums/VacanteEnums.enum'

export interface FiltrosVacante {
  idEmpresa?: number
  estado?: EstadoVacante
  modalidad?: string
  sector?: string
  idsTiposDiscapacidad?: number[]
  palabrasClave?: string
  ubicacion?: string
  page?: number
  limit?: number
}

export interface IVacanteRepository {
  findById(id: number): Promise<Vacante | null>
  findAll(filtros: FiltrosVacante): Promise<{ vacantes: Vacante[]; total: number }>
  findPendientes(): Promise<Vacante[]>
  countActivas(idEmpresa: number): Promise<number>
  existsPostulacion(idCandidato: number, idVacante: number): Promise<boolean>
  verificarCompatibilidadDiscapacidad(idCandidato: number, idVacante: number): Promise<boolean>
  findCompatiblesConAlerta(idVacante: number): Promise<number[]>
  findVigentesConAlertaDias(dias: number): Promise<Vacante[]>
  save(vacante: Vacante): Promise<Vacante>
  update(vacante: Vacante): Promise<void>
  syncDiscapacidades(idVacante: number, idsTipos: number[]): Promise<void>
}

export interface IAjusteRazonableDisponibleRepository {
  findByIdVacante(idVacante: number): Promise<AjusteRazonableDisponible[]>
  findById(id: number): Promise<AjusteRazonableDisponible | null>
  save(ajuste: AjusteRazonableDisponible): Promise<AjusteRazonableDisponible>
  update(ajuste: AjusteRazonableDisponible): Promise<void>
  deleteByIdVacante(idVacante: number): Promise<void>
}

export interface ISancionEmpresaRepository {
  findById(id: number): Promise<SancionEmpresa | null>
  findActivaByIdEmpresa(idEmpresa: number): Promise<SancionEmpresa | null>
  tieneActivaSancion(idEmpresa: number): Promise<boolean>
  save(sancion: SancionEmpresa): Promise<SancionEmpresa>
  update(sancion: SancionEmpresa): Promise<void>
}
