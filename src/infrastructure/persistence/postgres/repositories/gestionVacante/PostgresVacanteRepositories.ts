import { EstadoSancion, SancionEmpresa } from "@domain/entities/gestionVacante/SancionEmpresa.entity";
import { Vacante } from "@domain/entities/gestionVacante/Vacante.entity";
import { EstadoVacante, ModalidadTrabajo } from '@domain/enums/VacanteEnums.enum';
import { FiltrosVacante, IAjusteRazonableDisponibleRepository, ISancionEmpresaRepository, IVacanteRepository } from "@domain/repositories/gestionVacante/VacanteRepositories";
import { execute, query, queryOne } from "../../connection/PostgresConnection";
import { TipoAjusteRazonable } from "@domain/enums/PerfilEnums.enum";
import { AjusteRazonableDisponible } from "@domain/entities/gestionVacante/AjusteRazonableDisponible.entity";

export class PostgresVacanteRepository implements IVacanteRepository{
   private toEntity(row:any): Vacante {
      return new Vacante ({
         id: row.id_vacante,
         idEmpresa: row.id_empresa,
         idAdministrador: row.id_administrador ?? undefined,
         titulo: row.titulo,
         descripcion: row.descripcion,
         requisitos: row.requisitos ?? undefined,
         categoriaLaboral: row.categoria_laboral ?? undefined,
         sectorEconomico: row.sector_economico ?? undefined,
         modalidad: row.modalidad_trabajo as ModalidadTrabajo,
         remuneracion: row.remuneracion ? parseFloat(row.remuneracion) : undefined,
         ubicacion: row.ubicacion ?? undefined,
         fechaPublicacion: new Date (row.fecha_publicacion) ?? undefined,
         fechaCierre: new Date (row.fecha_cierre) ?? undefined,
         estado: row.estado_vacante as EstadoVacante,
         motivoRechazo: row.motivo_rechazo ?? undefined
      })
   }
   async findById(id: number): Promise<Vacante | null> {
      const row = await queryOne<any>(`
         SELECT
            id_vacante,
            id_empresa,
            id_administrador,
            titulo,
            descripcion,
            requisitos,
            categoria_laboral,
            sector_economico,
            modalidad,
            remuneracion,
            ubicacion,
            fecha_publicacion,
            fecha_cierre,
            estado,
            motivo_rechazo
         FROM vacante
         WHERE id_vacante = $1`,
         [id]
      )
      return row ? this.toEntity(row) : null
   }

   async findAll(filtros: FiltrosVacante): Promise<{ vacantes: Vacante[]; total: number; }> {
      const conditions: string [] = ["v.estado='aprobada'"]
      const params: any[] = []
      let idx = 1
      if (filtros.modalidad) {
         conditions.push(`v.modalidad=$${idx++}`);
         params.push(filtros.modalidad);
      }
      if (filtros.sector) {
         conditions.push(`v.sector_economico ILIKE $${idx++}`);
         params.push(`%${filtros.sector}$%`);
      }
      if (filtros.palabrasClave){
         conditions.push(`(v.titulo LIKE $${idx} OR v.descripcion LIKE $${idx})`);
         params.push(`%${filtros.palabrasClave}%`);
         idx++;
      }
      if (filtros.ubicacion) {
         conditions.push(`v.ubicacion LIKE $${idx++}`);
         params.push(`%${filtros.ubicacion}%`);
      }
      if (filtros.idsTiposDiscapacidad?.length) {
         const ph = filtros.idsTiposDiscapacidad.map(() => `$${idx++}`).join(',')
         conditions.push(`EXISTS (
            SELECT 1 
            FROM vacante_discapacidad vd 
            WHERE vd.id_vacante = v.id_vacante AND vd.id_tipo_discapacidad IN (${ph}))`);
         params.push(...filtros.idsTiposDiscapacidad)
      }
      const where = `WHERE ${conditions.join(' AND ')}`;
      const page = filtros.page ?? 1;
      const limit = filtros.limit ?? 20;
      const offset = (page-1)*limit;

      const countRow = await queryOne<{total: string}>(`
         SELECT COUNT(*) AS total
         FROM vacante v
         ${where}`,
         [params]
      )
      const total = parseInt(countRow?.total ?? '0');

      const rows = await queryOne<any>(`
         SELECT 
            v.id_vacante,
            v.id_empresa,
            v.id_administrador,
            v.titulo,
            v.descripcion,
            v.requisitos,
            v.categoria_laboral,
            v.sector_economico,
            v.modalidad,
            v.remuneracion,
            v.ubicacion,
            v.fecha_publicacion,
            v.fecha_cierre,
            v.estado,
            v.motivo_rechazo
         FROM vacante v
         ${where}
         ORDER BY v.fecha_publicacion
         DESC LIMIT $${idx++}`, 
         [...params, limit, offset]
      )
      return {vacantes: rows.map(this.toEntity), total}
   }

   async findPendientes(): Promise<Vacante[]> {
      const rows = await query<any>(`
         SELECT
            id_vacante,
            id_empresa,
            id_administrador,
            titulo,
            descripcion,
            requisitos,
            categoria_laboral,
            sector_economico,
            modalidad,
            remuneracion,
            ubicacion,
            fecha_publicacion,
            fecha_cierre,
            estado,
            motivo_rechazo
         FROM vacante
         WHERE estado = 'pendiente'
         ORDER BY fecha_publicacion ASC`)
      return rows.map(this.toEntity)
   }

   async countActivas(idEmpresa: number): Promise<number> {
      const row = await queryOne<{ total: string }>(`
         SELECT COUNT(*) AS total
         FROM vacante
         WHERE id_empresa = $1 AND estado = 'aprobada'`,
         [idEmpresa]
      )
      return parseInt(row?.total ?? '0')
   }

   async existsPostulacion(idCandidato: number, idVacante: number): Promise<boolean> {
      const row = await queryOne<{ exists: boolean }>(`
         SELECT EXISTS(
            SELECT 1 
            FROM postulacion 
            WHERE id_candidato=$1 AND id_vacante=$2)`,
         [idCandidato, idVacante]
      )
      return row?.exists ?? false
   }

   async verificarCompatibilidadDiscapacidad(idCandidato: number, idVacante: number): Promise<boolean> {
      const row = await queryOne<{ compatible: boolean }>(`
         SELECT EXISTS (
            SELECT 1 
            FROM vacante_discapacidad vd 
            INNER JOIN perfil_discapacidad pd ON pd.id_tipo_discapacidad = v.id_tipo_discapacidad
            INNER JOIN perfil_candidato pc ON pc.id_perfil = pd.id_perfil
            WHERE vd.id_vacante = $1 AND pc.id_candidato = $2) AS compatible`,
         [idVacante, idCandidato]
      )
      return row?.compatible ?? false
   }

   async findCompatiblesConAlerta(idVacante: number): Promise<number[]> {
      const rows = await query<{ id_candidato: number }>(`
         SELECT DISTINCT 
            c.id_candidato 
         FROM candidato c
         INNER JOIN usuario u ON u.id_usuario = c.id_usuario
         INNER JOIN alerta_empleo ae ON ae.id_candidato = c.id_candidato AND ae.activa=true
         INNER JOIN vacante v ON v.id_vacante = $1
         WHERE u.estado = 'activo'
            AND (ae.sector_economico IS NULL OR ae.sector_economico = v.sector_economico)
            AND (ae.modalidad = 'todas' OR ae.modalidad = v.modalidad)`,
         [idVacante]
      )
      return rows.map(row => row.id_candidato)
   }

   async findVigentesConAlertaDias(dias: number): Promise<Vacante[]> {
      const rows = await query<any>(`
         SELECT
            id_vacante,
            id_empresa,
            id_administrador,
            titulo,
            descripcion,
            requisitos,
            categoria_laboral,
            sector_economico,
            modalidad,
            remuneracion,
            ubicacion,
            fecha_publicacion,
            fecha_cierre,
            estado,
            motivo_rechazo
         FROM vacante
         WHERE estado = 'aprobada' AND fecha_publicacion <= NOW() - INTERVAL '${dias} days'`)
      return rows.map(this.toEntity)
   }

   async save(vacante: Vacante): Promise<Vacante> {
      const row = await queryOne<any>(`
         INSERT INTO vacante
         (id_empresa, id_administrador, titulo, descripcion, requisitos, categoria_laboral, sector_economico, 
         modalidad, remuneracion, ubicacion, fecha_publicacion, fecha_cierre, estado, motivo_rechazo)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
         [vacante.getIdEmpresa(), vacante.getIdAdministrador(), vacante.getTitulo(), vacante.getDescripcion(),
         vacante.getDescripcion(), vacante.getRequisitos(), vacante.getCategoriaLaboral(), vacante.getSectorEconomico(),
         vacante.getModalidad(), vacante.getRemuneracion(), vacante.getUbicacion(), vacante.getFechaPublicacion(),
         vacante.getFechaCierre(), vacante.getEstado(), vacante.getMotivoRechazo()]
      )
      return this.toEntity(row!)
   }

   async update(vacante: Vacante): Promise<void> {
      await execute(`
         UPDATE vacante SET
            id_administrador = $1,
            titulo = $2,
            descripcion = $3,
            requisitos = $4,
            categoria_laboral = $5,
            sector_economico = $6,
            modalidad = $7,
            remuneracion = $8,
            ubicacion = $9,
            fecha_publicacion = $10,
            fecha_cierre = $11,
            estado = $12,
            motivo_rechazo = $13
         WHERE id_vacante = $14`,
         [vacante.getIdAdministrador(), vacante.getTitulo(), vacante.getDescripcion(), vacante.getRequisitos(),
         vacante.getCategoriaLaboral(), vacante.getSectorEconomico(), vacante.getModalidad(), vacante.getRemuneracion(),
         vacante.getUbicacion(), vacante.getFechaPublicacion(), vacante.getFechaCierre(), vacante.getEstado(),
         vacante.getMotivoRechazo(), vacante.id]
      )
   }

   async syncDiscapacidades(idVacante: number, idsTipos: number[]): Promise<void> {
      await execute(`
         DELETE FROM vacante_discapacidad 
         WHERE id_vacante = $1`, 
         [idVacante]
      )
      for (const id of idsTipos) await execute(`
         INSERT INTO vacante_discapacidad
         (id_vacante, id_tipo_discapacidad) 
         VALUES ($1, $2)`, 
         [idVacante, id]
      )
   }
}

export class PostgresAjusteRazonableDisponibleRepository implements IAjusteRazonableDisponibleRepository{
   private toEntity( row: any) : AjusteRazonableDisponible {
      return new AjusteRazonableDisponible ({
         id: row.id_ajuste_requerido,
         idVacante: row.id_perfil,
         descripcion: row.descripcion,
         tipo: row.tipo as TipoAjusteRazonable,
         verificadoPorIntermediador: row.verificado_por_intermediador
      })
   }
   async findByIdVacante(idVacante: number): Promise<AjusteRazonableDisponible[]> {
      const rows = await query<any>(`
         SELECT 
            id_ajuste_disponible,
            id_vacante,
            descripcion,
            tipo,
            verificado_por_intermediador
         FROM ajuste_razonable_disponible
         WHERE id_vacante = $1`, 
         [idVacante]
      )
      return rows.map(this.toEntity)
   }

   async findById(id: number): Promise<AjusteRazonableDisponible | null> {
      const row = await queryOne<any>(`
         SELECT
            id_ajuste_disponible,
            id_vacante,
            descripcion,
            tipo,
            verificado_por_intermediador
         FROM ajuste_razonable_disponible
         WHERE id_ajuste_disponible = $1`, 
         [id]
      )
      return row ? this.toEntity(row) : null
   }

   async save(ajuste: AjusteRazonableDisponible): Promise<AjusteRazonableDisponible> {
      const row = await queryOne<any>(`
         INSERT INTO ajuste_razonable_disponible
         (id_vacante, descripcion, tipo, verificado_por_intermediador)
         VALUES ($1,$2,$3,$4) RETURNING *`, 
         [ajuste.idVacante, ajuste.getDescripcion(), ajuste.getTipo(), ajuste.isVerificado()]
      )
      return this.toEntity(row!)
   }

   async update(ajuste: AjusteRazonableDisponible): Promise<void> {
      await execute(`
         UPDATE ajuste_razonable_disponible SET
            descripcion = $1,
            tipo = $2,
            verificado_por_intermediador = $3
         WHERE id_ajuste_razonable = $4`, 
         [ajuste.getDescripcion(), ajuste.getTipo(), ajuste.isVerificado(), ajuste.id]
      )
   }

   async deleteByIdVacante(idVacante: number): Promise<void> {
      await execute(`
         DELETE FROM ajuste_razonable_disponible
         WHERE id_vacante = $1`, 
         [idVacante]
      )
   }
}

export class PostgresSancionEmpresaRepository implements ISancionEmpresaRepository {
   private toEntity( row:any ): SancionEmpresa {
      return new SancionEmpresa ({
         id: row.id_sancion,
         idEmpresa: row.id_empresa,
         idAdministrador: row.id_administrador,
         motivo: row.motivo,
         fechaInicio: new Date(row.fecha_inicio),
         fechaFin: new Date(row.fecha_fin) ?? undefined,
         estado: row.estado as EstadoSancion,
         normativaInfringida: row.normativa_infringida ?? undefined
      })
   }
   async findById(id: number): Promise<SancionEmpresa | null> {
      const row = await queryOne<any>(`
         SELECT
            id_sancion,
            id_empresa,
            id_administrador,
            motivo,
            fecha_inicio,
            fecha_fin,
            estado,
            normativa_infringida
         FROM sancion_empresa
         WHERE id_sancion = $1`, 
         [id]
      )
      return row ? this.toEntity(row) : null
   }

   async findActivaByIdEmpresa(idEmpresa: number): Promise<SancionEmpresa | null> {
      const row = await queryOne<any>(`
         SELECT
            id_sancion,
            id_empresa,
            id_administrador,
            motivo,
            fecha_inicio,
            fecha_fin,
            estado,
            normativa_infringida
         FROM sancion_empresa
         WHERE id_empresa = $1 AND estado = 'activa' LIMIT 1`, 
         [idEmpresa]
      )
      return row ? this.toEntity(row) : null
   }

   async tieneActivaSancion(idEmpresa: number): Promise<boolean> {
      const row = await queryOne<{ exists: boolean }>(`
         SELECT EXISTS (
            SELECT 1 
            FROM sancion_empresa
            WHERE id_empresa = $1 AND estado='activa'
         )`, 
         [idEmpresa]
      )
      return row?.exists ?? false
   }

   async save(sancion: SancionEmpresa): Promise<SancionEmpresa> {
      const row = await queryOne<any>(`
         INSERT INTO sancion_empresa
         (id_empresa, id_administrador, motivo, fecha_inicio, fecha_fin, estado, normativa_infringida)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, 
         [sancion.idEmpresa, sancion.idAdministrador, sancion.getMotivo(), sancion.fechaInicio, sancion.getFechaFin(),
         sancion.getEstado(), sancion.getNormativaInfringida()]
      )
      return this.toEntity(row!)
   }

   async update(sancion: SancionEmpresa): Promise<void> {
      await execute(`
         UPDATE sancion_empresa SET
            estado = $1,
            fecha_fin = $2,
         WHERE id_sancion = $3`, 
         [sancion.getEstado(), sancion.getFechaFin(), sancion.id]
      )
   }
}