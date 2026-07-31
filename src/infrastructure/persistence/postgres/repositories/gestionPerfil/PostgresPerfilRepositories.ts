import { CategoriaDiscapacidad, NivelEducativo, NivelHabilidad, PrioridadAjuste, TamanoEmpresa, TipoAjusteRazonable, TipoHabilidad } from '@domain/enums/PerfilEnums.enum';
import { AjusteRazonableRequerido } from "@domain/entities/gestionPerfil/AjusteRazonableRequerido.entity";
import { CertificadoDiscapacidad } from "@domain/entities/gestionPerfil/CertificadoDiscapacidad.entity";
import { CurriculumVitae } from "@domain/entities/gestionPerfil/CurriculumVitae.entity";
import { ExperienciaLaboral } from "@domain/entities/gestionPerfil/ExperienciaLaboral.entity";
import { FormacionAcademica } from "@domain/entities/gestionPerfil/FormacionAcademica.entity";
import { Habilidad } from "@domain/entities/gestionPerfil/Habilidad.entity";
import { PerfilCandidato } from "@domain/entities/gestionPerfil/PerfilCandidato.entity";
import { PerfilEmpresa, TipoEntidad } from "@domain/entities/gestionPerfil/PerfilEmpresa.entity";
import { TipoDiscapacidad } from "@domain/entities/gestionPerfil/TipoDiscapacidad.entity";
import { IPerfilCandidatoRepository } from "@domain/repositories/gestionPerfil/IPerfilCandidatoRepository";
import { 
   IAjusteRazonableRequeridoRepository, 
   ICertificadoDiscapacidadRepository, 
   ICurriculumVitaeRepository, 
   IExperienciaLaboralRepository, 
   IFormacionAcademicaRepository, 
   IHabilidadRepository, 
   IPerfilEmpresaRepository, 
   ITipoDiscapacidadRepository 
} from "@domain/repositories/gestionPerfil/PerfilRepositories";
import { execute, query, queryOne } from '../../connection/PostgresConnection';

export class PostgresPerfilCandidatoRepository implements IPerfilCandidatoRepository {
   private toEntity(row: any): PerfilCandidato {
      return new PerfilCandidato ({
         id: row.id,
         idCandidato: row.id_candidato,
         resumenProfesional: row.resumen_profesional,
         nivelEducativo: row.NivelEducativo ?? undefined,
         visible: row.visible,
         porcentajeCompletitud: row.porcentaje_completitud,
         fechaActualizacion: new Date(row.fecha_actualizacion) ?? undefined
      })
   }
   async findById(id: number): Promise<PerfilCandidato | null> {
      const row = await queryOne<any>(`
         SELECT 
            id_perfil,
            id_candidato,
            resumen_profesional,
            nivel_educativo,
            visible,
            porcentaje_completitud,
            fecha_actualizacion
         FROM perfil_candidato 
         WHERE id_perfil = $1 `, 
         [id],
      )
      return row ? this.toEntity(row) : null
   }

   async findByIdCandidato(idCandidato: number): Promise<PerfilCandidato | null> {
      const row = await queryOne<any>(`
         SELECT 
            id_perfil,
            id_candidato,
            resumen_profesional,
            nivel_educativo,
            visible,
            porcentaje_completitud,
            fecha_actualizacion
         FROM perfil_candidato 
         WHERE id_candidato = $1 `, 
         [idCandidato],
      )
      return row ? this.toEntity(row) : null
   }

   async existsByIdCandidato(idCandidato: number): Promise<boolean> {
      const row = await queryOne<{exists:boolean}>(`
         SELECT EXISTS (
            SELECT 1 FROM perfil_candidato WHERE id_candidato = $1
         )`, [idCandidato],)
      return row?.exists ?? false
   }

   async save(perfil: PerfilCandidato): Promise<PerfilCandidato> {
      const row = await queryOne<any>(`
         INSERT INTO perfil_candidato
         (id_candidato,resumen_profesional,nivel_educativo,visible,porcentaje_completitud,fecha_actualizacion)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
         [perfil.idCandidato, perfil.getResumenProfesional(), perfil.getNivelEducativo(),
         perfil.isVisible(), perfil.getPorcentajeCompletitud(), perfil.getFechaActualizacion()])
      return this.toEntity(row!)
   }

   async update(perfil: PerfilCandidato): Promise<void> {
      await execute(`
         UPDATE perfil_candidato SET
            resumen_profesional = $1,
            nivel_educativo = $2,
            visible = $3,
            porcentaje_completitud = $4,
            fecha_actualizacion = $5
         WHERE id_perfil = $6`,
      [perfil.getResumenProfesional(), perfil.getNivelEducativo(), perfil.isVisible(),
      perfil.getPorcentajeCompletitud(), perfil.getFechaActualizacion(), perfil.id])
   }
}

export class PostgresHabilidadRepository implements IHabilidadRepository{
   private toEntity(row:any): Habilidad {
      return new Habilidad({
         id: row.id_habilidad,
         idPerfil: row.id_perfil,
         nombre: row.nombre,
         nivel: row.nivel as NivelHabilidad,
         tipo: row.tipo as TipoHabilidad
      })
   }
   async findByIdPerfil(idPerfil: number): Promise<Habilidad[]> {
      const rows = await query<any>(`
         SELECT 
            id_habilidad,
            id_perfil,
            nombre,
            nivel,
            tipo
         FROM habilidad
         WHERE id_perfil = $1`,
      [idPerfil],
   )
      return rows.map(this.toEntity)
   }

   async save(habilidad: Habilidad): Promise<Habilidad> {
      const row = await queryOne<any>(`
         INSERT INTO habilidad
         (id_perfil, nombre, nivel, tipo)
         VALUES ($1, $2, $3, $4) RETURNING *`,
      [habilidad.idPerfil, habilidad.getNombre(), habilidad.getNivel(), habilidad.getTipo()],)
      return this.toEntity(row!)
   } 

   async update(habilidad: Habilidad): Promise<void> {
      await execute(`
         UPDATE habilidad SET
            nombre = $1,
            nivel = $2,
            tipo = $3
         WHERE id_habilidad = $4`, 
         [habilidad.getNombre(), habilidad.getNivel(), habilidad.getTipo(), habilidad.id]
      )
   }

   async deleteByIdPerfil(idPerfil: number): Promise<void> {
      await execute(`
         DELETE FROM habilidad
         WHERE id_perfil = $1`, 
         [idPerfil]
      )
   }

   async deleteById(id: number): Promise<void> {
      await execute(`
         DELETE FROM habilidad
         WHERE id_habilidad = $1`, 
         [id]
      )
   }
}

export class PostgresExperienciaLaboralRepository implements IExperienciaLaboralRepository {
   private toEntity(row:any): ExperienciaLaboral {
      return new ExperienciaLaboral ({
         id: row.id,
         idPerfil: row.id_perfil,
         cargo: row.cargo,
         empresa: row.empresa,
         fechaInicio: new Date(row.fecha_inicio),
         fechaFin: new Date(row.fecha_fin) ?? undefined,
         trabajoActual: row.trabajo_actual,
         descripcion: row.descripcion ?? undefined
      })
   }
   async findByIdPerfil(idPerfil: number): Promise<ExperienciaLaboral[]> {
      const rows = await query<any>(`
         SELECT
            id_experiencia,
            id_perfil,
            cargo,
            empresa,
            fecha_inicio,
            fecha_fin,
            trabajo_actual,
            descripcion
         FROM experiencia_laboral
         WHERE id_perfil = $1
         ORDER BY fecha_inicio
         DESC`, 
         [idPerfil]
      )
      return rows.map(this.toEntity)
   }

   async save(experiencia: ExperienciaLaboral): Promise<ExperienciaLaboral> {
      const row = await queryOne<any>(`
         INSERT INTO experiencia_laboral
         (id_perfil, cargo, empresa. fecha_inicio, fecha_fin, trabajo_actual, descripcion)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, 
         [experiencia.idPerfil, experiencia.getCargo(), experiencia.getEmpresa(), experiencia.getFechaInicio(), 
         experiencia.getFechaFin(), experiencia.isTrabajoActual(), experiencia.getDescripcion()]
      )
      return this.toEntity(row!)
   }

   async update(experiencia: ExperienciaLaboral): Promise<void> {
      await execute(`
         UPDATE experiencia_laboral SET
            cargo = $1,
            empresa = $2,
            fecha_inicio = $3,
            fecha_fin = $4,
            trabajo_actual = $5,
            descripcion = $6
         WHERE id_experiencia = $7`, 
         [experiencia.getCargo(), experiencia.getEmpresa(), experiencia.getFechaInicio(), experiencia.getFechaFin(), 
         experiencia.isTrabajoActual(), experiencia.getDescripcion(), experiencia.id])
   }

   async deleteById(id: number): Promise<void> {
      await execute(`
         DELETE FROM experiencia_laboral
         WHERE id_experiencia = $1`, [id])
   }
}

export class PostgresFormacionAcademicaRepository implements IFormacionAcademicaRepository {
   private toEntity(row:any): FormacionAcademica {
      return new FormacionAcademica({
         id: row.id,
         idPerfil: row.idPerfil,
         institucion: row.institucion,
         titulo: row.titulo,
         nivel: row.nivel as NivelEducativo,
         fechaInicio: row.fechaInicio,
         fechaFin: row.fecha_fin ?? undefined,
         enCurso: row.en_curso
      })
   }
   async findByIdPerfil(idPerfil: number): Promise<FormacionAcademica[]> {
      const rows = await query<any>(`
         SELECT
            id_formacion,
            id_perfil,
            institucion,
            titulo,
            nivel,
            fecha_inicio,
            fecha_fin,
            en_curso
         FROM formacion_academica
         WHERE id_perfil = $1`)
      return rows.map(this.toEntity)
   }

   async save(formacion: FormacionAcademica): Promise<FormacionAcademica> {
      const row = await queryOne<any>(`
         INSERT INTO formacion_laboral
         (id_perfil, institucion, titulo, nivel, fecha_inicio, fecha_fin, en_curso)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, 
         [formacion.idPerfil, formacion.getInstitucion(), formacion.getTitulo(), formacion.getNivel(),
         formacion.getFechaInicio(), formacion.getFechaFin(), formacion.isEnCurso()])
      return this.toEntity(row!)
   }

   async update(formacion: FormacionAcademica): Promise<void> {
      await execute(`
         UPDATE formacion_laboral SET
            institucion = $1,
            titulo = $2,
            nivel = $3,
            fecha_inicio = $4,
            fecha_fin = $5,
            en_curso = $6
         WHERE id_formacion = $7`, 
         [formacion.getInstitucion(), formacion.getTitulo(), formacion.getNivel(), formacion.getFechaInicio(), 
         formacion.getFechaFin(), formacion.isEnCurso()]
      )
   }

   async deleteById(id: number): Promise<void> {
      await execute(`
         DELETE FROM formacion_laboral
         WHERE id_formacion = $1`, 
         [id]
      )
   }
}

export class PostgresTipoDiscapacidadRepository implements ITipoDiscapacidadRepository {
   private toEntity(row:any) : TipoDiscapacidad {
      return new TipoDiscapacidad ({
         id: row.id,
         nombre: row.nombre,
         categoria: row.categoria_discapacidad as CategoriaDiscapacidad,
         descripcion: row.descripcion ?? undefined,
         codigoConadis: row.codigo_conadis
      })
   }
   async findById(id: number): Promise<TipoDiscapacidad | null> {
      const row = await queryOne<any>(`
         SELECT
            id_tipo_discapacidad,
            nombre,
            categoria,
            descripcion,
            codigo_conadis
         FROM tipo_discapacidad
         WHERE id_tipo_discapacidad = $1`, 
         [id]
      )
      return row ? this.toEntity(row) : null
   }

   async findAll(): Promise<TipoDiscapacidad[]> {
      const rows = await query<any>(`
         SELECT
            id_tipo_discapacidad,
            nombre,
            categoria,
            descripcion,
            codigo_conadis
         FROM tipo_discapacidad
         ORDER BY nombre`)
      return rows.map(this.toEntity)
   }

   async findByIds(ids: number[]): Promise<TipoDiscapacidad[]> {
      if (ids.length === 0) return []
      const ph = ids.map((_,i) => `$${i + 1}`).join(',')
      const rows = await query<any>(`
         SELECT
            id_tipo_discapacidad,
            nombre,
            categoria,
            descripcion,
            codigo_conadis
         FROM tipo_discapacidad
         WHERE id_tipo_discapacidad IN (${ph})`, 
         [ids]
      )
      return rows.map(this.toEntity)
   }

   async findByIdPerfil(idPerfil: number): Promise<TipoDiscapacidad[]> {
      const rows = await query<any>(`
         SELECT
            td.id_tipo_discapacidad,
            td.nombre,
            td.categoria,
            td.descripcion,
            td.codigo_conadis
         FROM tipo_discapacidad td
         INNER JOIN perfil_discapacidad pd ON pd.id_tipo_discapacidad = td.id_tipo_discapacidad
         WHERE pd.id_perfil = $1`)
      return rows.map(this.toEntity)
   }

   async syncPerfilDiscapacidades(idPerfil: number, idTipos: number[]): Promise<void> {
      await execute(`
         DELETE FROM perfil_discapacidad 
         WHERE id_perfil = $1`, 
         [idPerfil]
      )
      for (const idTipo of idTipos){
         await execute(`
            INSERT INTO perfil_discapacidad
            (id_perfil, id_tipo_discapacidad)
            VALUES ($1,$2)`, 
            [idPerfil, idTipo]
         )
      }
   }

   async countCandidatosActivosByTipo(idTipo: number): Promise<number> {
      const row = await queryOne<{ total: number }>(`
         SELECT 
            COUNT(*) AS total
         FROM perfil_discapacidad pd
         INNER JOIN perfil_candidato pc ON pc.id_perfil = pd.id_perfil
         INNER JOIN candidato c ON c.id_candidato = pc.id_candidato
         INNER JOIN usuario u ON u.id_usuario = c.id_usuario
         WHERE pd.id_tipo_discapacidad $1 AND u.estado = 'activo'`, 
         [idTipo]
      )
      return row?.total ?? 0
   }

   async save(tipo: TipoDiscapacidad): Promise<TipoDiscapacidad> {
      const row = await queryOne<any>(`
         INSERT INTO tipo_discapacidad
         (nombre, categoria, descripcion, codigo_conadis)
         VALUES ($1,$2,$3,$4) RETURNING *`, 
         [tipo.nombre, tipo.categoria, tipo.descripcion, tipo.codigoConadis]
      )
      return this.toEntity(row!)
   }

   async deleteById(id: number): Promise<void> {
      await execute(`
         DELETE FROM tipo_discapacidad
         WHERE id_tipo_discapacidad = $1`, 
         [id]
      )   
   } 
}

export class PostgresAjusteRazonableRequeridoRepository implements IAjusteRazonableRequeridoRepository{
   private toEntity(row: any) : AjusteRazonableRequerido {
      return new AjusteRazonableRequerido ({
         id: row.id_ajuste_requerido,
         idPerfil: row.id_perfil,
         descripcion: row.descripcion,
         tipo: row.tipo as TipoAjusteRazonable,
         prioridad: row.prioridad as PrioridadAjuste
      })
   }
   async findByIdPerfil(idPerfil: number): Promise<AjusteRazonableRequerido[]> {
      const rows = await query<any>(`
         SELECT
            id_ajuste_requerido,
            id_perfil,
            descripcion,
            tipo,
            prioridad
         FROM ajuste_razonable_requerido
         WHERE id_perfil = $1`, 
         [idPerfil]
      )
      return rows.map(this.toEntity)
   }

   async save(ajuste: AjusteRazonableRequerido): Promise<AjusteRazonableRequerido> {
      const row = await queryOne<any>(`
         INSERT INTO ajuste_razonable_requerido
         (id_perfil, descripcion, tipo, prioridad)
         VALUES ($1,$2,$3,$4) RETURNING *`, 
         [ajuste.idPerfil, ajuste.getDescripcion(), ajuste.getTipo(), ajuste.getPrioridad()]
      )
      return this.toEntity(row!)
   }

   async update(ajuste: AjusteRazonableRequerido): Promise<void> {
      await execute(`
         UPDATE ajuste_razonable_requerido SET
            descripcion = $1,
            tipo = $2,
            prioridad = $3
         WHERE id_ajuste_requerido = $4`, 
         [ajuste.getDescripcion(), ajuste.getTipo(), ajuste.getPrioridad(), ajuste.id]
      )
   }

   async deleteByIdPerfil(idPerfil: number): Promise<void> {
      await execute(`
         DELETE FROM ajuste_razonable_requerido
         WHERE id_perfil = $1`, 
         [idPerfil]
      )
   }

   async deleteById(id: number): Promise<void> {
      await execute(`
         DELETE FROM ajuste_razonable_requerido
         WHERE id_ajuste_requerido = $1`, 
         [id]
      )
   }
}

export class PostgresCurriculumVitaeRepository implements ICurriculumVitaeRepository {
   private toEntity(row: any): CurriculumVitae {
      return new CurriculumVitae({
         id: row.id_cv,
         idPerfil: row.id_perfil,
         urlArchivo: row.url_archivo ?? undefined,
         formatoArchivo: row.formato_archivo ?? undefined,
         fechaSubida: row.fecha_subida,
         generadoPorPlataforma: row.generado_por_plataforma,
         accesible: row.accesible
      })
   }
   async findByIdPerfil(idPerfil: number): Promise<CurriculumVitae | null> {
      const row = await queryOne<any>(`
         SELECT
            id_cv,
            id_perfil,
            url_archivo,
            formato_archivo,
            fecha_subida,
            generado_por_plataforma,
            accesible
         FROM curriculum_vitae
         WHERE id_perfil = $1`, 
         [idPerfil])
      return row ? this.toEntity(row) : null
   }

   async save(cv: CurriculumVitae): Promise<CurriculumVitae> {
      const row = await queryOne<any>(`
         INSERT INTO curriculum_vitae
         (id_perfil, url_archivo, formato_archivo, fecha_subida, generado_por_plataforma, accesible)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, 
         [cv.idPerfil, cv.getUrlArchivo(), cv.getFormatoArchivo(), cv.getFechaSubida(), 
         cv.isGeneradoPorPlataforma(), cv.isAccesible()]
      )
      return this.toEntity(row!)
   }

   async update(cv: CurriculumVitae): Promise<void> {
      await execute(`
         UPDATE curriculum_vitae SET
            url_archivo = $1,
            formato_archivo = $2,
            fecha_subida = $3,
            generado_por_plataforma = $4,
            accesible = $5
         WHERE id_cv = $6`, 
         [cv.getUrlArchivo(), cv.getFormatoArchivo(), cv.getFechaSubida(), cv.isGeneradoPorPlataforma(), 
         cv.isAccesible(), cv.id]
      )
   }
}

export class PostgresCertificadoDiscapacidadRepository implements ICertificadoDiscapacidadRepository {
   private toEntity(row: any): CertificadoDiscapacidad{
      return new CertificadoDiscapacidad({
         id: row.id_certificado,
         idPerfil: row.id_perfil,
         numeroCarne: row.numero_carne,
         fechaEmision: row.fecha_emision,
         fechaVencimiento: row.fecha_vencimiento ?? undefined,
         entidadEmisora: row.entidad_emisora,
         urlDocumento: row.url_documento ?? undefined,
         verificado: row.verificado
      })
   }
   async findByIdPerfil(idPerfil: number): Promise<CertificadoDiscapacidad | null> {
      const row = await queryOne<any>(`
         SELECT
            id_certificado,
            id_perfil,
            numero_carne,
            fecha_emision,
            fecha_vencimiento,
            entidad_emisora,
            url_documento,
            verificado
         FROM certificado_discapacidad
         WHERE id_perfil = $1`, 
         [idPerfil]
      )
      return row ? this.toEntity(row) : null
   }

   async existsByNumeroCarne(numeroCarne: string, excludeIdPerfil?: number): Promise<boolean> {
      const sql = excludeIdPerfil ? `
         SELECT EXISTS (
            SELECT 1
            FROM certificado_discapacidad
            WHERE numero_carne = $1 AND id_perfil<>$2
         )` : `
         SELECT EXISTS (
            SELECT 1
            FROM certificado_discapacidad
            WHERE numero_carne = $1
         )`
      const params = excludeIdPerfil ? [numeroCarne, excludeIdPerfil] : [numeroCarne]
      const row = await queryOne<{ exists : boolean }>(sql, params)

      return row?.exists ?? false
   }

   async save(certificado: CertificadoDiscapacidad): Promise<CertificadoDiscapacidad> {
      const row = await queryOne<any>(`
         INSERT INTO certificado_discapacidad
         (id_perfil, numero_carne, fecha_emision, fecha_vencimiento, entidad_emisora, url_documento, verificado)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, 
         [certificado.idPerfil, certificado.getNumeroCarne(), certificado.getFechaEmision(), 
         certificado.getFechaVencimiento(), certificado.getEntidadEmisora(), certificado.getUrlDocumento(),
         certificado.isVerificado()]
      )
      return this.toEntity(row!)
   }

   async update(certificado: CertificadoDiscapacidad): Promise<void> {
      await execute(`
         UPDATE certificado_discapacidad SET
            numero_carne = $1,
            fecha_emision = $2,
            fecha_vencimiento = $3,
            url_documento = $4,
            verificado = $5
         WHERE id_certificado = $6`,
         [certificado.getNumeroCarne(), certificado.getFechaEmision(), certificado.getFechaVencimiento(), 
         certificado.getEntidadEmisora(), certificado.isVerificado(), certificado.id]
      )
   }
}

export class PostgresPerfilEmpresaRepository implements IPerfilEmpresaRepository {
   private toEntity(row: any){
      return new PerfilEmpresa ({
         id: row.id_perfil_empresa,
         idEmpresa: row.id_empresa,
         descripcion: row.descripcion ?? undefined,
         sector: row.sector ?? undefined,
         tamano: row.tamano as TamanoEmpresa ?? undefined,
         tipoEntidad: row.tipo_entidad as TipoEntidad, // OBS
         urlLogo: row.url_logo ?? undefined,
         sitioWeb: row.sitio_web ?? undefined,
         politicaInclusion: row.politica_inclusion ?? undefined,
         totalTrabajadores: row.total_trabajadores,
         fechaActualizacion: row.fecha_actualizacion
      })
   }
   async findById(id: number): Promise<PerfilEmpresa | null> {
      const row = await queryOne<any>(`
         SELECT
            id_perfil_empresa,
            id_empresa,
            descripcion,
            sector,
            tamano,
            url_logo,
            sitio_web,
            politica_inclusion,
            total_trabajadores,
            fecha_actualizacion
         FROM perfil_empresa
         WHERE id_perfil_empresa = $1`, 
         [id]
      )
      return row ? this.toEntity(row) : null
   }

   async findByIdEmpresa(idEmpresa: number): Promise<PerfilEmpresa | null> {
      const row = await queryOne<any>(`
         SELECT
            id_perfil_empresa,
            id_empresa,
            descripcion,
            sector,
            tamano,
            url_logo,
            sitio_web,
            politica_inclusion,
            total_trabajadores,
            fecha_actualizacion
         FROM perfil_empresa
         WHERE id_empresa = $1`)
      return row ? this.toEntity(row) : null
   }

   async existsByIdEmpresa(idEmpresa: number): Promise<boolean> {
      const row = await queryOne<{ exists: boolean }>(`
         SELECT EXISTS(
            SELECT 1
            FROM perfil_empresa
            WHERE id_empresa = $1
         )`, 
         [idEmpresa]
      )
      return row?.exists ?? false
   }

   async save(perfil: PerfilEmpresa): Promise<PerfilEmpresa> {
      const row = await queryOne<any>(`
         INSERT INTO perfil_empresa
         (id_empresa, descripcion, sector, tamano, url_logo, sitio_web, politica_inclusion, total_trabajadores, 
         fecha_actualizacion)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, 
         [perfil.idEmpresa, perfil.getDescripcion(), perfil.getSector(), perfil.getTamano(), perfil.getUrlLogo(), 
         perfil.getSitioWeb(), perfil.getPoliticaInclusion(), perfil.getTotalTrabajadores(), perfil.getFechaActualizacion()]
      )
      return perfil
   }

   async update(perfil: PerfilEmpresa): Promise<void> {
      await execute(`
         UPDATE perfil_empresa SET
            descripcion = $1,
            sector = $2,
            tamano = $3,
            url_logo = $4,
            sitio_web = $5,
            politica_inclusion = $6,
            total_trabajadores = $7,
            fecha_actualizacion = $8
         WHERE id_perfil_empresa = $9`, 
         [perfil.getDescripcion(), perfil.getSector(), perfil.getTamano(), perfil.getUrlLogo(), 
         perfil.getSitioWeb(), perfil.getPoliticaInclusion(), perfil.getTotalTrabajadores(), 
         perfil.getFechaActualizacion(), perfil.id]
      )
   }
}