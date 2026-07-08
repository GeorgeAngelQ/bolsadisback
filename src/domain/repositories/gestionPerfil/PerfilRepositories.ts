import { Habilidad } from '../../entities/gestionPerfil/Habilidad.entity'
import { ExperienciaLaboral } from '../../entities/gestionPerfil/ExperienciaLaboral.entity'
import { FormacionAcademica } from '../../entities/gestionPerfil/FormacionAcademica.entity'
import { TipoDiscapacidad } from '../../entities/gestionPerfil/TipoDiscapacidad.entity'
import { AjusteRazonableRequerido } from '../../entities/gestionPerfil/AjusteRazonableRequerido.entity'
import { CurriculumVitae } from '../../entities/gestionPerfil/CurriculumVitae.entity'
import { CertificadoDiscapacidad } from '../../entities/gestionPerfil/CertificadoDiscapacidad.entity'
import { PerfilEmpresa } from '../../entities/gestionPerfil/PerfilEmpresa.entity'

export interface IHabilidadRepository {
  findByIdPerfil(idPerfil: number): Promise<Habilidad[]>
  save(habilidad: Habilidad): Promise<Habilidad>
  update(habilidad: Habilidad): Promise<void>
  deleteByIdPerfil(idPerfil: number): Promise<void>
  deleteById(id: number): Promise<void>
}

export interface IExperienciaLaboralRepository {
  findByIdPerfil(idPerfil: number): Promise<ExperienciaLaboral[]>
  save(experiencia: ExperienciaLaboral): Promise<ExperienciaLaboral>
  update(experiencia: ExperienciaLaboral): Promise<void>
  deleteById(id: number): Promise<void>
}

export interface IFormacionAcademicaRepository {
  findByIdPerfil(idPerfil: number): Promise<FormacionAcademica[]>
  save(formacion: FormacionAcademica): Promise<FormacionAcademica>
  update(formacion: FormacionAcademica): Promise<void>
  deleteById(id: number): Promise<void>
}

export interface ITipoDiscapacidadRepository {
  findById(id: number): Promise<TipoDiscapacidad | null>
  findAll(): Promise<TipoDiscapacidad[]>
  findByIds(ids: number[]): Promise<TipoDiscapacidad[]>
  findByIdPerfil(idPerfil: number): Promise<TipoDiscapacidad[]>
  syncPerfilDiscapacidades(idPerfil: number, idTipos: number[]): Promise<void>
  countCandidatosActivosByTipo(idTipo: number): Promise<number>
  save(tipo: TipoDiscapacidad): Promise<TipoDiscapacidad>
  deleteById(id: number): Promise<void>
}

export interface IAjusteRazonableRequeridoRepository {
  findByIdPerfil(idPerfil: number): Promise<AjusteRazonableRequerido[]>
  save(ajuste: AjusteRazonableRequerido): Promise<AjusteRazonableRequerido>
  update(ajuste: AjusteRazonableRequerido): Promise<void>
  deleteByIdPerfil(idPerfil: number): Promise<void>
  deleteById(id: number): Promise<void>
}

export interface ICurriculumVitaeRepository {
  findByIdPerfil(idPerfil: number): Promise<CurriculumVitae | null>
  save(cv: CurriculumVitae): Promise<CurriculumVitae>
  update(cv: CurriculumVitae): Promise<void>
}

export interface ICertificadoDiscapacidadRepository {
  findByIdPerfil(idPerfil: number): Promise<CertificadoDiscapacidad | null>
  existsByNumeroCarne(numeroCarne: string, excludeIdPerfil?: number): Promise<boolean>
  save(certificado: CertificadoDiscapacidad): Promise<CertificadoDiscapacidad>
  update(certificado: CertificadoDiscapacidad): Promise<void>
}

export interface IPerfilEmpresaRepository {
  findById(id: number): Promise<PerfilEmpresa | null>
  findByIdEmpresa(idEmpresa: number): Promise<PerfilEmpresa | null>
  existsByIdEmpresa(idEmpresa: number): Promise<boolean>
  save(perfil: PerfilEmpresa): Promise<PerfilEmpresa>
  update(perfil: PerfilEmpresa): Promise<void>
}
