import { 
   ConfiguracionAccesibilidadGlobal, 
   ContenidoInformativo, 
   EventoAuditoria } from "@domain/entities/administracion/AdministracionEntities.entity";

import { 
   FiltrosAuditoria, 
   IConfiguracionAccesibilidadGlobalRepository, 
   IContenidoInformativoRepository, 
   IEventoAuditoriaRepository, 
   IMantenimientoRepository 
} from "@domain/repositories/administracion/AdministracionRepositories";
import { execute, query, queryOne } from "../../connection/PostgresConnection";

export class PostgresContenidoInformativoRepository implements IContenidoInformativoRepository {
   private toEntity(row: any): ContenidoInformativo {
      return new ContenidoInformativo({
         id: row.id_contenido,
         idAdministrador: row.id_administrador,
         titulo: row.titulo,
         cuerpo: row.cuerpo,
         tipo: row.tipo,
         formatoAccesible: row.formato_accesible,
         fechaPublicacion: row.fecha_publicacion ?? undefined,
         fechaActualizacion: row.fecha_actualizacion ?? undefined,
         visible: row.visible
      })
   }
   async findById(id: number): Promise<ContenidoInformativo | null> {
      const row = await queryOne<any>(`
         SELECT
            id_contenido,
            id_administrador,
            titulo,
            cuerpo,
            tipo,
            formato_accesible,
            fecha_publicacion,
            fecha_actualizacion,
            visible
         FROM contenido_informativo
         WHERE id_contenido = $1`, 
         [id]
      )
      return row ? this.toEntity(row) : null
   }

   async findAll(soloVisibles?: boolean): Promise<ContenidoInformativo[]> {
      const where = soloVisibles ? `WHEREEE visible = true` : ``
      const rows = await query<any>(`
         SELECT
            id_contenido,
            id_administrador,
            titulo,
            cuerpo,
            tipo,
            formato_accesible,
            fecha_publicacion,
            fecha_actualizacion,
            visible
         FROM contenido_informativo
         ${where}
         ORDER BY fecha_publicacion
         DESC`
      )
      return rows.map(this.toEntity)
   }

   async save(contenido: ContenidoInformativo): Promise<ContenidoInformativo> {
      const row = await queryOne<any>(`
         INSERT INTO contenido_informativo
         (id_administrador, titulo, cuerpo, tipo, formato_accesible, fecha_publicacion, fecha_actualizacion, visible)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, 
         [contenido.idAdministrador, contenido.getTitulo(), contenido.getCuerpo(), contenido.getTipo(), 
         contenido.isFormatoAccesible(), contenido.getFechaPublicacion(), new Date(), contenido.isVisible()]
      )
      return this.toEntity(row!)
   }

   async update(contenido: ContenidoInformativo): Promise<void> {
      await execute(`
         UPDATE contenido_informativo SET
            titulo = $1,
            cuerpo = $2,
            tipo = $3,
            formato_accesible = $4,
            fecha_actualizacion = NOW(),
            visible = $5
         WHERE id_contenido = $6`, 
         [contenido.getTitulo(), contenido.getCuerpo(), contenido.getTipo(), contenido.isFormatoAccesible(), 
         contenido.isVisible(), contenido.id]
      )
   }
}

export class PostgresConfiguracionAccesibilidadRepository implements IConfiguracionAccesibilidadGlobalRepository {
   private toEntity(row: any): ConfiguracionAccesibilidadGlobal {
      return new ConfiguracionAccesibilidadGlobal({
         id: row.id_configuracion,
         idAdministrador: row.id_administrador,
         nivelWCAG: row.nivel_wcag,
         contrastesDisponibles: row.contrastes_disponibles,
         tamanosTextoDisponibles: row.tamanos_texto_disponibles,
         soporteLSP: row.soporte_lsp,
         subtitulosAutomaticos: row.subtitulos_automaticos,
         fechaActualizacion: row.fecha_actualizacion
      })
   }
   async findActual(): Promise<ConfiguracionAccesibilidadGlobal | null> {
      const row = await queryOne<any>(`
         SELECT
            id_configuracion,
            id_administrador,
            nivel_wcag,
            contrastes_disponibles,
            tamanos_texto_disponibles,
            soporte_lsp,
            subtitulos_automaticos,
            fecha_actualizacion
         FROM configuracion_accesibilidad_global
         ORDER BY fecha_actualizacion
         DESC
         LIMIT 1`)
      return row ? this.toEntity(row) : null
   }

   async save(config: ConfiguracionAccesibilidadGlobal): Promise<ConfiguracionAccesibilidadGlobal> {
      const row = await queryOne<any>(`
         INSERT INTO configuracion_accesibilidad_global
         (id_administrador, nivel_wcag, contrastes_disponibles, tamanos_texto_disponibles, 
         soporte_lsp, subtitulos_automaticos, fecha_actualizacion)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, 
         [config.idAdministrador, config.getNivelWCAG(), config.getContrastesDisponibles(), config.getTamanosTextoDisponibles(), 
         config.isSoporteLSP(), config.isSubtitulosAutomaticos(), config.getFechaActualizacion()]
      )
      return this.toEntity(row!)
   }

   async update(config: ConfiguracionAccesibilidadGlobal): Promise<void> {
      await execute(`
         UPDATE configuracion_accesibilidad_global SET
            nivel_wcag = $1,
            contrastes_disponibles = $2,
            tamanos_texto_disponibles = $3,
            soporte_lsp = $4,
            subtitulos_automaticos = $5,
            fecha_actualizacion = $6
         WHERE id_configuracion = $7`, 
         [config.getNivelWCAG(), config.getContrastesDisponibles(), config.getTamanosTextoDisponibles(), config.isSoporteLSP(), 
         config.isSubtitulosAutomaticos(), config.isSubtitulosAutomaticos(), config.getFechaActualizacion(), config.id]
      )
   }
}

export class PostgresEventoAuditoriaRepository implements IEventoAuditoriaRepository {
   private toEntity(row:any): EventoAuditoria {
      return new EventoAuditoria({
         id: row.id_evento,
         idUsuario: row.id_usuario,
         accion: row.accion,
         modulo: row.modulo,
         objetoAfectado: row.objeto_afectado ?? undefined,
         idObjetoAfectado: row.id_objeto_afectado ?? undefined,
         fechaHora: row.fecha_hora,
         ipOrigen: row.ip_origen ?? undefined,
         resultado: row.resultado,
         detalle: row.detalle ?? undefined
      })
   }
   async findAll(filtros: FiltrosAuditoria): Promise<{ eventos: EventoAuditoria[]; total: number; }> {
      const conds: string[] = [];
      const params: any[] = [];
      let idx = 1
      if (filtros.idUsuario){
         conds.push(`id_usuario = $${idx++}`);
         params.push(filtros.idUsuario)
      }
      if (filtros.modulo) {
         conds.push(`modulo = $${idx++}`);
         params.push(filtros.modulo)
      }
      if (filtros.accion) {
         conds.push(`accion ILIKE $${idx++}`);
         params.push(`%${filtros.accion}%`)
      }
      if (filtros.fechaDesde) {
         conds.push(`fecha_hora >= $${idx++}`);
         params.push(filtros.fechaDesde)
      }
      if (filtros.fechaHasta) {
         conds.push(`fecha_hora <= $${idx++}`);
         params.push(filtros.fechaHasta)
      }
      if (filtros.resultado) {
         conds.push(`resultado = $${idx++}`);
         params.push(filtros.resultado)
      }
      const where = conds.length > 0 ? `WHERE ${conds.join(' AND ')}` : ``
      const page = filtros.page ?? 1;
      const limit = filtros.limit ?? 50;
      const offset = ( page - 1 ) * limit

      const countRow = await queryOne<{ total: number }>(`
         SELECT
            COUNT(*) AS total
         FROM evento_auditoria
         ${where}`, 
         [params]
      )
      const total = countRow?.total ?? 0
      const rows = await queryOne<any>(`
         SELECT
            id_evento,
            id_usuario,
            accion,
            modulo,
            objeto_afectado,
            id_objeto_afectado,
            fecha_hora,
            ip_origen,
            resultado,
            detalle
         FROM evento_auditoria
         ${where}
         ORDER BY fecha_hora
         DESC
         LIMIT $${idx++}
         OFFSET $${idx++}`, 
         [...params, limit, offset]
      )
      return {
         eventos: rows.map(this.toEntity),       
         total
      }
   }

   async findByIdUsuario(idUsuario: number): Promise<EventoAuditoria[]> {
      const rows = await query<any>(`
         SELECT
            id_evento,
            id_usuario,
            accion,
            modulo,
            objeto_afectado,
            id_objeto_afectado,
            fecha_hora,
            ip_origen,
            resultado,
            detalle
         FROM evento_auditoria
         WHERE id_usuario = $1
         ORDER BY fecha_hora
         LIMIT 100`)
      return rows.map(this.toEntity)
   }

   async save(evento: EventoAuditoria): Promise<EventoAuditoria> {
      const row = await queryOne<any>(`
         INSERT INTO evento_auditoria
         (id_usuario, accion, modulo, objeto_afectado, id_objeto_afectado, fecha_hora, ip_origen, resultado, detalle)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, 
         [evento.idUsuario, evento.accion, evento.modulo, evento.objetoAfectado, evento.idObjetoAfectado, 
         evento.fechaHora, evento.ipOrigen, evento.resultado, evento.detalle]
      )
      return this.toEntity(row!)
   }

   async countIntentosFallidosRecientes(horas: number): Promise<number> {
      const row = await queryOne<{ total: number }>(`
         SELECT COUNT(*) AS total
         FROM evento_auditoria
         WHERE accion = 'login_fallido_cuenta_suspendida' AND fecha_hora >= NOW() - INTERVAL'${horas} hours'`)
      return row?.total ?? 0
   }

   async countCuentasBloqueadasRecientes(horas: number): Promise<number> {
      const row = await queryOne<{ total: number }>(`
         SELECT 
            COUNT(*) AS total
         FROM evento_auditoria
         WHERE accion = 'cuenta_bloqueada_por_intentos' AND fecha_hora >= NOW() - INTERVAL '${horas} hours'`)
      return row?.total ?? 0
   }

   async detectarPatronesAnomalos(): Promise<{ idUsuario: number; descripcion: string; }[]> {
      const rows = await query<any>(`
         SELECT
            id_usuario,
            COUNT(*) AS total_fallos
         FROM evento_auditoria
         WHERE resultado = 'fallido' AND fecha_hora >= NOW() - INTERVAL '24 hours'
         GROUP BY id_usuario
         HAVING COUNT(*) >= 10`
      )
      return rows.map(r => ({
         idUsuario: r.id_usuario,
         descripcion: `${r.total_fallos} acciones fallidas en 24h`
      }))
   }

   async exportar(filtros: FiltrosAuditoria): Promise<EventoAuditoria[]> {
      const { eventos } = await this.findAll({
         ...filtros, 
         page: 1,
         limit: 10000
       })
      return eventos
   }
}

//A futuro - Falta implementar Mantenimiento
/*
export class PostgresMantenimientoRepository implements IMantenimientoRepository {
   async findProgramado(): Promise<{ id: number; fechaInicio: Date; duracion: number; estado: string; } | null> {
      const row = await queryOne<any>(`
         SELECT
            id_programacion,
            fecha_inicio,
            duracion_estimada,
            estado
         FROM programacion_mantenimiento
         WHERE estado IN ('programado', 'activo')
         ORDER BY fecha_inicio
         DESC
         LIMIT 1`
      )
      return null
   }

   async save(datos: { fechaInicio: Date; duracionEstimada: number; motivo: string; }): Promise<{ id: number; }> {
      const row = await queryOne<any>(`
         INSERT INTO programacion_mantenimiento
         (fecha_inicio, duracion_estimada, motivo, estado)
         VALUES ($1,$2,$3,'programado') RETURNING id`, 
         [datos.fechaInicio, datos.duracionEstimada, datos.motivo]
      )
      return { id: row!.id }
   }

   async update(id: number, datos: Partial<{ duracionEstimada: number; estado: string; }>): Promise<void> {
      const sets: string[] = [];
      const params: any[] = [];
      let idx = 1
      if (datos.duracionEstimada !== undefined) {
         sets.push(`duracion_estimada = $${idx++}`);
         params.push(datos.duracionEstimada)
      }
      if (datos.estado !== undefined) {
         sets.push(`estado = $${idx++}`);
         params.push(datos.estado)
      }
      if (sets.length === 0 ) return
      params.push(id)

      await execute(`
         UPDATE programacion_mantenimiento SET
            ${sets.join(',')}
         WHERE id = $${idx}`, 
         params
      )
   }
}
 */  