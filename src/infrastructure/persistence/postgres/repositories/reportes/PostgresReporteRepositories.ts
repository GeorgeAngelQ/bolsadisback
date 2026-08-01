import { DashboardIndicadores, ReporteCuotaInclusion, ReporteGestionIntermediador, ReporteInclusionLaboral } from "@domain/entities/reportes/ReporteEntities.entity";
import { 
   FiltrosReporteGlobal,
   IDashboardIndicadoresRepository, 
   IReporteCuotaInclusionRepository, 
   IReporteGestionIntermediadorRepository, 
   IReporteInclusionLaboralRepository,
   MetricasDashboard, 
   
} from "@domain/repositories/reportes/ReporteRepositories";
import { execute, query, queryOne } from "../../connection/PostgresConnection";

export class PostgresReporteCuotaInclusionRepository implements IReporteCuotaInclusionRepository {
   private toEntity(row: any): ReporteCuotaInclusion {
      return new ReporteCuotaInclusion ({
         id: row.id_reporte,
         idEmpresa: row.id_empresa,
         periodo: row.periodo,
         totalTrabajadores: row.total_trabajadores,
         trabajadoresConDiscapacidad: row.trabajadores_con_discapacidad,
         cuotaObligada: row.cuota_obligada,
         porcentajeCumplimiento: row.porcentaje_cumplimiento,
         cumpleLey: row.cumple_ley,
         fechaGeneracion: row.fecha_generacion
      })
   }
   async findById(id: number): Promise<ReporteCuotaInclusion | null> {
      const row = await queryOne(`
         SELECT
            id_reporte,
            id_empresa,
            periodo,
            total_trabajadores,
            trabajadores_con_discapacidad,
            cuota_obligada,
            porcentaje_cumplimiento,
            cumple_ley,
            fecha_generacion
         FROM reporte_cuota_inclusion
         WHERE id_reporte = $1`, 
         [id]
      )
      return row ? this.toEntity(row) : null
   }

   async findByIdEmpresa(idEmpresa: number): Promise<ReporteCuotaInclusion[]> {
      const rows = await query(`
         SELECT
            id_reporte,
            id_empresa,
            periodo,
            total_trabajadores,
            trabajadores_con_discapacidad,
            cuota_obligada,
            porcentaje_cumplimiento,
            cumple_ley,
            fecha_generacion
         FROM reporte_cuota_inclusion
         WHERE id_empresa = $1
         ORDER BY fecha_generacion
         DESC`, 
         [idEmpresa]
      )
      return rows.map(this.toEntity)
   }

   async countContratacionesConDiscapacidad(idEmpresa: number, periodo: string): Promise<number> {
      const esMes = periodo.includes('-')
      const fmt = esMes ? 'YYYY-MM' : 'YYYY'
      const row = await queryOne<{ total: number }>(`
         SELECT
            COUNT(DISTINCT p.id_candidato) AS total
         FROM postulacion p
         INNER JOIN vacante v ON v.id_vacante = p.id_vacante
         INNER JOIN perfil_candidato pc ON pc.id_candidato = p.id_candidato
         WHERE v.id_empresa = $1 AND p.estado = 'aceptada' AND TO_CHAR(p.fecha_postulacion, '${fmt}')  =$2`,
         [idEmpresa, periodo]
      )
      return row?.total ?? 0
   }
   async save(reporte: ReporteCuotaInclusion): Promise<ReporteCuotaInclusion> {
      const row = await queryOne<any>(`
         INSERT INTO reporte_cuota_inclusion
         (id_empresa, periodo, total_trabajadores, trabajadores_con_discapacidad, cuota_obligada, 
         porcentaje_cumplimiento, cumple_ley, fecha_generacion)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, 
         [reporte.idEmpresa, reporte.periodo, reporte.totalTrabajadores, reporte.trabajadoresConDiscapacidad,
         reporte.cuotaObligada, reporte.porcentajeCumplimiento, reporte.cumpleLey, reporte.fechaGeneracion]
      )
      return this.toEntity(row!)
   }
}

export class PostgresReporteGestionIntermediadorRepository implements IReporteGestionIntermediadorRepository {
   private toEntity(row: any): ReporteGestionIntermediador {
      return new ReporteGestionIntermediador ({
         id: row.id_reporte,
         idIntermediador: row.id_intermediador,
         periodo: row.periodo,
         totalCandidatosAtendidos: row.total_candidatos_atendidos,
         totalPostulacionesGestionadas: row.total_postulaciones_gestionadas,
         totalContrataciones: row.total_contrataciones,
         totalDerivaciones: row.total_derivaciones,
         fechaGeneracion: row.fecha_generacion
      })
   }
   async findById(id: number): Promise<ReporteGestionIntermediador | null> {
      const row = await queryOne<any>(`
         SELECT
            id_reporte,
            id_intermediador,
            periodo,
            total_candidatos_atendidos,
            total_postulaciones_gestionadas,
            total_contrataciones,
            total_derivaciones,
            fecha_generacion
         FROM reporte_gestion_intermediador
         WHERE id_reporte = $1`, 
         [id]
      )
      return row ? this.toEntity(row) : null
   }

   async findByIdIntermediador(idIntermediador: number): Promise<ReporteGestionIntermediador[]> {
      const rows = await query<any>(`
         SELECT
            id_reporte,
            id_intermediador,
            periodo,
            total_candidatos_atendidos,
            total_postulaciones_gestionadas,
            total_contrataciones,
            total_derivaciones,
            fecha_generacion
         FROM reporte_gestion_intermediador
         WHERE id_intermediador = $1
         ORDER BY fecha_generacion
         DESC`, 
         [idIntermediador]
      )
      return rows.map(this.toEntity)
   }

   async contarCandidatosAtendidos(idIntermediador: number, periodo: string): Promise<number> {
      const fmt = periodo.includes('-') ? 'YYYY-MM' : 'YYYY'
      const row = await queryOne<{ total: number }>(`
         SELECT
            COUNT(DISTINCT id_candidato) AS total
         FROM asignacion_intermediador
         WHERE id_intermediador = $1 AND TO_CHAR(fecha_asignacion, '${fmt}') = $2`, 
         [idIntermediador, periodo]
      )
      return row?.total ?? 0
   }

   async contarPostulacionesGestionadas(idIntermediador: number, periodo: string): Promise<number> {
      const fmt = periodo.includes('-') ? 'YYYY-MM' : 'YYYY'
      const row = await queryOne<{ total: number }>(`
         SELECT
            COUNT(*) AS total
         FROM seguimiento_postulacion
         WHERE id_intermediador = $1 AND TO_CHAR(fecha_inicio, '${fmt}') = $2`, 
         [idIntermediador, periodo]
      )
      return row?.total ?? 0
   }

   async contarContrataciones(idIntermediador: number, periodo: string): Promise<number> {
      const fmt = periodo.includes('-') ? 'YYYY-MM' : 'YYYY'
      const row = await queryOne<{ total: number }>(`
         SELECT
            COUNT(*) AS total
         FROM seguimiento_postulacion
         WHERE id_intermediador = $1 AND resultado = 'contratado' AND TO_CHAR(fecha_inicio, '${fmt}') = $2`, 
         [idIntermediador, periodo]
      )
      return row?.total ?? 0
   }

   async contarDerivaciones(idIntermediador: number, periodo: string): Promise<number> {
      const fmt = periodo.includes('-') ? 'YYYY-MM' : 'YYYY'
      const row = await queryOne<{ total: number }>(`
         SELECT
            COUNT(*) AS total
         FROM derivacion_servicio ds
         INNER JOIN seguimiento_postulacion sp ON sp.id_seguimiento = ds.id_seguimiento
         WHERE sp.id_intermediador = $1 AND TO_CHAR(ds.fecha_derivacion, '${fmt}') = $2`, 
         [idIntermediador, periodo]
      )
      return row?.total ?? 0
   }

   async save(reporte: ReporteGestionIntermediador): Promise<ReporteGestionIntermediador> {
      const row = await queryOne<any>(`
         INSERT INTO reporte_gestion_intermediador
         (id_intermediador, periodo, total_candidatos_atendidos, total_postulaciones_gestionadas, 
         total_contrataciones, total_derivaciones, fecha_generacion)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, 
         [reporte.idIntermediador, reporte.periodo, reporte.totalCandidatosAtendidos, reporte.totalPostulacionesGestionadas, 
         reporte.totalContrataciones, reporte.totalDerivaciones, reporte.fechaGeneracion]
      )
      return this.toEntity(row!)
   }
}

export class PostgresReporteInclusionLaboralRepository implements IReporteInclusionLaboralRepository {
   private toEntity(row: any): ReporteInclusionLaboral {
      return new ReporteInclusionLaboral ({
         id: row.id_reporte,
         idAdministrador: row.id_administrador,
         periodo: row.periodo,
         totalCandidatosActivos: row.total_candidatos_activos,
         totalVacantesPublicadas: row.total_vacantes_publicadas,
         totalPostulaciones: row.total_postulaciones,
         totalContrataciones: row.total_contrataciones,
         distribucionPorDiscapacidad: row.distribucion_por_discapacidad,
         distribucionPorSector: row.distribucion_por_sector,
         distribucionPorDistrito: row.distribucion_por_distrito,
         fechaGeneracion: row.fecha_generacion
      })
   }
   async findById(id: number): Promise<ReporteInclusionLaboral | null> {
      const row = await queryOne<any>(`
         SELECT
            id_reporte,
            id_administrador,
            periodo,
            total_candidatos_activos,
            total_vacantes_publicadas,
            total_postulaciones,
            total_contrataciones,
            distribucion_por_discapacidad,
            distribucion_por_sector,
            distribucion_por_distrito,
            fecha_generacion
         FROM reporte_inclusion_laboral
         WHERE id_reporte = $1`, 
         [id]
      )
      return row ? this.toEntity(row) : null
   }

   async findByPeriodo(periodo: string): Promise<ReporteInclusionLaboral | null> {
      const row = await queryOne<any>(`
         SELECT
            id_reporte,
            id_administrador,
            periodo,
            total_candidatos_activos,
            total_vacantes_publicadas,
            total_postulaciones,
            total_contrataciones,
            distribucion_por_discapacidad,
            distribucion_por_sector,
            distribucion_por_distrito,
            fecha_generacion
         FROM reporte_inclusion_laboral
         WHERE periodo = $1
         ORDER BY fecha_generacion
         DESC
         LIMIT 1`, 
         [periodo]
      )
      return row ? this.toEntity(row) : null
   }

   async contarCandidatosActivos(filtros: FiltrosReporteGlobal): Promise<number> {
      const row = await queryOne<{ total:number }>(`
         SELECT
            COUNT(*) AS total
         FROM candidato c
         INNER JOIN usuario u ON u.id_usuario = c.id_usuario
         WHERE u.estado = 'activo'`, 
         )
      return row?.total ?? 0
   }

   async contarVacantesPublicadas(filtros: FiltrosReporteGlobal): Promise<number> {
      const sql = filtros.sector 
                  ? 
                  `SELECT 
                     COUNT(*) AS total 
                  FROM vacante 
                  WHERE estado = 'aprobada' AND sector_economico = $1` 
                  : 
                  `SELECT
                     COUNT(*) AS total
                  FROM vacante
                  WHERE estado = 'aprobada'`
      const row = await queryOne<{ total: number}>(sql, filtros.sector ? [filtros.sector]: [])
      return row?.total ?? 0
   }

   async contarPostulaciones(filtros: FiltrosReporteGlobal): Promise<number> {
      const row = await queryOne<{ total: number }>(`
         SELECT 
            COUNT(*) AS total 
         FROM postulacion`)
      return row?.total ?? 0
   }

   async contarContrataciones(filtros: FiltrosReporteGlobal): Promise<number> {
      const row = await queryOne<{ total: number }>(`
         SELECT 
            COUNT(*) AS total 
         FROM postulacion
         WHERE estado = 'aceptada'`)
      return row?.total ?? 0
   }

   async calcularDistribucionDiscapacidad(filtros: FiltrosReporteGlobal): Promise<Record<string, number>> {
      const rows = await query<any>(`
         SELECT
            td.categoria,
            COUNT(DISTINCT pd.id_perfil) AS total,
         FROM tipo_discapacidad tp
         INNER JOIN perfil_discapacidad pd ON pd.id_tipo_discapacidad = td.id_tipo_discapacidad
         GROUP BY td.categoria`)
      return Object.fromEntries(rows.map(r => [r.categoria, parseInt(r.total)]))
   }

   async calcularDistribucionSector(filtros: FiltrosReporteGlobal): Promise<Record<string, number>> {
      const rows = await query<any>(`
         SELECT
            sector_economico AS sector,
            COUNT(*) AS total
         FROM vacante
         WHERE estado = 'aprobada' AND sector_economico IS NOT NULL
         GROUP BY sector_economico`)
      return Object.fromEntries(rows.map(r => [r.sector, parseInt(r.total)]))
   }

   async calcularDistribucionDistrito(filtros: FiltrosReporteGlobal): Promise<Record<string, number>> {
      const rows = await query<any>(`
         SELECT
            distrito,
            COUNT(*) AS total
         FROM candidato
         GROUP BY distrito`)
      return Object.fromEntries(rows.map(r => [r.distrito, parseInt(r.total)]))
   }

   async save(reporte: ReporteInclusionLaboral): Promise<ReporteInclusionLaboral> {
      const row = await queryOne<any>(`
         INSERT INTO reporte_inclusion_laboral
         (id_administrador, periodo, total_candidatos_activos, total_vacantes_publicadas, total_postulaciones,
         total_contrataciones, distribucion_por_discapacidad, distribucion_por_sector, distribucion_por_distrito,
         fecha_generacion)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`, 
         [reporte.idAdministrador, reporte.periodo, reporte.totalCandidatosActivos, reporte.totalVacantesPublicadas,
         reporte.totalPostulaciones, reporte.totalContrataciones, JSON.stringify(reporte.distribucionPorDiscapacidad),
         JSON.stringify(reporte.distribucionPorSector), JSON.stringify(reporte.distribucionPorDistrito), 
         reporte.fechaGeneracion]
      )
      return this.toEntity(row!)
   }
}

export class PostgresDashboardIndicadoresRepository implements IDashboardIndicadoresRepository {
   private toEntity(row: any): DashboardIndicadores {
      return new DashboardIndicadores ({
         id: row.id_dashboard,
         idAdministrador: row.id_administrador,
         fechaUltimaActualizacion: row.fecha_ultima_actualizacion,
         totalUsuariosActivos: row.total_usuarios_activos,
         totalVacantesActivas: row.total_vacantes_activas,
         totalPostulacionesMes: row.total_postulaciones_mes,
         totalContratacionesMes: row.total_contrataciones_mes,
         tasaIntermediacion: row.tasa_intermediacion
      })
   }
   async findByIdAdministrador(idAdministrador: number): Promise<DashboardIndicadores | null> {
      const row = await queryOne<any>(`
         SELECT
            id_dashboard,
            id_administrador,
            fecha_ultima_actualizacion,
            total_usuarios_activos,
            total_vacantes_activas,
            total_postulaciones_mes,
            total_contrataciones_mes,
            tasa_intermediacion
         FROM dashboard_indicadores
         WHERE id_administrador = $1
         LIMIT 1`)
      return row ? this.toEntity(row) : null
   }

   async calcularMetricas(): Promise<MetricasDashboard> {
      const [usuarios , vacantes, postulaciones, contrataciones] = await Promise.all([
         queryOne<{ total: number }>(`SELECT 
                                       COUNT(*) AS total 
                                      FROM usuario 
                                      WHERE estado = 'activo'`),
         queryOne<{ total: number }>(`SELECT 
                                       COUNT(*) AS total 
                                      FROM vacante 
                                      WHERE estado = 'aprobada'`),
         queryOne<{ total: number }>(`SELECT 
                                       COUNT(*) AS total 
                                      FROM postulacion 
                                      WHERE DATE_TRUNC('month', fecha_postulacion) = DATE_TRUNC('month', NOW())'`),
         queryOne<{ total: number }>(`SELECT 
                                       COUNT(*) AS total 
                                      FROM postulacion 
                                      WHERE estado = 'aceptada AND DATE_TRUNC('month', fecha_postulacion) = DATE_TRUNC('month', NOW())'`),
      ])
      return { 
         totalUsuariosActivos: usuarios?.total ?? 0,
         totalVacantesActivas: vacantes?.total ?? 0,
         totalPostulacionesMes: postulaciones?.total ?? 0,
         totalContratacionesMes: contrataciones?.total ?? 0
      }
   }

   async calcularMetricasPorPeriodo(fechaDesde: Date, fechaHasta: Date): Promise<MetricasDashboard> {
            const [postulaciones, contrataciones] = await Promise.all([
         queryOne<{ total: number }>(`SELECT 
                                       COUNT(*) AS total 
                                      FROM postulacion 
                                      WHERE fecha_postulacion BETWEEN $1 AND $2`, 
                                      [fechaDesde, fechaHasta]
                                    ),
         queryOne<{ total: number }>(`SELECT 
                                       COUNT(*) AS total 
                                      FROM postulacion 
                                      WHERE estado = 'aceptada' AND fecha_postulacion BETWEEN $1 AND $2`, 
                                      [fechaDesde, fechaHasta]
                                    ),
      ])
      return { 
         totalUsuariosActivos: 0,
         totalVacantesActivas: 0,
         totalPostulacionesMes: postulaciones?.total ?? 0,
         totalContratacionesMes: contrataciones?.total ?? 0
      }
   }

   async save(dashboard: DashboardIndicadores): Promise<DashboardIndicadores> {
      const row = await queryOne<any>(`
         INSERT INTO dashboard_indicadores
         (id_administrador, fecha_ultima_actualizacion, total_usuarios_activos, total_vacantes_activas, 
         total_postulaciones_mes, total_contrataciones_mes, tasa_intermediacion)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, 
         [dashboard.idAdministrador, dashboard.getFechaUltimaActualizacion(), dashboard.getTotalUsuariosActivos(),
         dashboard.getTotalVacantesActivas(), dashboard.getTotalPostulacionesMes(), dashboard.getTotalContratacionesMes(),
         dashboard.getTasaIntermediacion()]
      )
      return this.toEntity(row!)
   }

   async update(dashboard: DashboardIndicadores): Promise<void> {
      await execute(`
         UPDATE dashboard_indicadores SET
            fecha_ultima_actualizacion = $1,
            total_usuarios_activos = $2,
            total_vacantes_activas = $3,
            total_postulaciones_mes = $4,
            total_contrataciones_mes = $5,
            tasa_intermediacion = $6
         WHERE id_dashboard = $7`, 
         [dashboard.getFechaUltimaActualizacion(), dashboard.getTotalUsuariosActivos(), 
         dashboard.getTotalVacantesActivas(), dashboard.getTotalPostulacionesMes(), 
         dashboard.getTotalContratacionesMes(), dashboard.getTasaIntermediacion(), dashboard.id]
      )  
   }
}