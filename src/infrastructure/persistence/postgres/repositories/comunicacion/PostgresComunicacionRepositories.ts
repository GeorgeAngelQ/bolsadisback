import { 
   Conversacion, 
   MensajeInterno, 
   Notificacion, 
   PlantillaNotificacion 
} from "@domain/entities/comunicacion/ComunicacionEntities.entity";
import { CanalNotificacion, EstadoConversacion, TipoConversacion } from "@domain/enums/ComunicacionEnums.enum";

import { 
   IConversacionRepository, 
   IMensajeInternoRepository, 
   INotificacionRepository, 
   IPlantillaNotificacionRepository 
} from "@domain/repositories/comunicacion/ComunicacionRepositories";
import { execute, query, queryOne } from "../../connection/PostgresConnection";

export class PostgresConversacionRepository implements IConversacionRepository{
   private toEntity ( row: any) : Conversacion {
      return new Conversacion ({
         id: row.id_conversacion,
         idPostulacion: row.id_postulacion ?? undefined,
         fechaCreacion: row.fecha_creacion,
         fechaUltimoMensaje: row.fecha_ultimo_mensaje ?? undefined,
         estado: row.estado as EstadoConversacion,
         tipo: row.tipo as TipoConversacion
      })
   }
   async findById(id: number): Promise<Conversacion | null> {
      const row = await queryOne<any>(`
         SELECT
            id_conversacion,
            id_postulacion,
            fecha_creacion,
            fecha_ultimo_mensaje,
            estado,
            tipo
         FROM conversacion
         WHERE id_conversacion = $1`, 
         [id]
      )
      return row ? this.toEntity(row) : null
   }

   async findByIdPostulacion(idPostulacion: number): Promise<Conversacion | null> {
      const row = await queryOne<any>(`
         SELECT
            id_conversacion,
            id_postulacion,
            fecha_creacion,
            fecha_ultimo_mensaje,
            estado,
            tipo
         FROM conversacion
         WHERE id_postulacion = $1
         LIMIT 1`, 
         [idPostulacion]
      )
      return row ? this.toEntity(row) : null
   }

   async findByParticipantes(idUsuario1: number, idUsuario2: number): Promise<Conversacion | null> {
      const row = await queryOne<any>(`
         SELECT
            c,id_conversacion,
            c.id_postulacion,
            c.fecha_creacion,
            c.fecha_ultimo_mensaje,
            c.estado,
            c.tipo
         FROM conversacion c
         INNER JOIN conversacion_participante cp1 ON cp1.id_conversacion = c.id_conversacion AND cp1.id_usuario = $1
         INNER JOIN conversacion_participante cp2 ON cp2.id_conversacion = c.id_conversacion AND cp2.id_usuario = $2
         WHERE c.estado = 'activa'
         LIMIT 1`, 
         [idUsuario1, idUsuario2]
      )
      return row ? this.toEntity(row) : null
   }

   async findByIdUsuario(idUsuario: number): Promise<Conversacion[]> {
      const rows = await query<any>(`
          SELECT
            c,id_conversacion,
            c.id_postulacion,
            c.fecha_creacion,
            c.fecha_ultimo_mensaje,
            c.estado,
            c.tipo
         FROM conversacion c
         INNER JOIN conversacion_participante cp ON cp.id_conversacion = c.id_conversacion
         WHERE cp.id_usuario = $1
         ORDER BY fecha_ultimo_mensaje
         DESC NULL LAST`, 
         [idUsuario]
      )
      return rows.map(this.toEntity)
   }

   async save(conv: Conversacion): Promise<Conversacion> {
      const row = await queryOne<any>(`
         INSERT INTO conversacion
         (id_postulacion, fecha_creacion, estado, tipo)
         VALUES ($1,$2,$3,$4) RETURNING *`, 
         [conv.idPostulacion, conv.fechaCreacion, conv.getEstado(), conv.getEstado()]
      )
      return this.toEntity(row!)
   }

   async update(conv: Conversacion): Promise<void> {
      await execute(`
         UPDATE conversacion SET
            estado = $1.
            fecha_ultimo_mensaje = $2
         WHERE id_conversacion = $3`, 
         [conv.getEstado(), conv.getFechaUltimoMensaje(), conv.id]
      )
   }

   async addParticipante(idConversacion: number, idUsuario: number): Promise<void> {
      await execute(`
         INSERT INTO conversacion_participante
         (id_conversacion, id_usuario)
         VALUES ($1,$2) ON CONFLICT DO NOTHING`, 
         [idConversacion, idUsuario]
      )
   }

   async getParticipantes(idConversacion: number): Promise<number[]> {
      const rows = await query<{ id_usuario: number }>(`
         SELECT
            id_usuario
         FROM conversacion_participante
         WHERE id_conversacion = $1`, 
         [idConversacion]
      )
      return rows.map(r => r.id_usuario)
   }
}

export class PostgresMensajeInternoRepository implements IMensajeInternoRepository {
   private toEntity(row:any): MensajeInterno {
      return new MensajeInterno ({
         id: row.id_mensaje,
         idConversacion: row.id_conversacion,
         idEmisor: row.id_emisor,
         contenido: row.contenido,
         fechaEnvio: row.fecha_envio,
         leido: row.leido,
         fechaLectura: row.fecha_lectura ?? undefined
      })
   }
   async findByIdConversacion(idConversacion: number): Promise<MensajeInterno[]> {
      const rows = await query<any>(`
         SELECT
            id_mensaje,
            id_conversacion,
            id_emisor,
            contenido,
            fecha_envio,
            leido,
            fecha_lectura
         FROM mensaje_interno
         WHERE id_conversacion = $1
         ORDER BY fecha_envio
         ASC`, 
         [idConversacion]
      )
      return rows.map(this.toEntity)
   }

   async findNoLeidosPorConversacionYUsuario(idConversacion: number, idUsuario: number): Promise<MensajeInterno[]> {
      const rows = await query<any>(`
         SELECT
            mi.id_mensaje,
            mi.id_conversacion,
            mi.id_emisor,
            mi.contenido,
            mi.fecha_envio,
            mi.leido,
            mi.fecha_lectura
         FROM mensaje_interno mi
         WHERE id_conversacion = $1 AND id_emisor<>$2 AND leido = false`, 
         [idConversacion, idUsuario]
      )
      return rows.map(this.toEntity)
   }

   async findSinRespuestaMasDe(diasHabiles: number): Promise<{ idConversacion: number; idUsuarioEmpresa: number; }[]> {
      const rows = await query<any>(`
         SELECT DISTINCT 
            m.id_conversacion, 
            cp.id_usuario AS id_usuario_empresa
         FROM mensaje_interno mi
         INNER JOIN conversacion_participante cp ON cp.id_conversacion = m.id_conversacion
         INNER JOIN empresa_empleadora e ON e.id_usuario = cp.id_usuario
         WHERE m.fecha_envio < NOW() - INTERVAL '${diasHabiles} days' AND m.leido = false`
      )
      return rows.map(r => ({
         idConversacion: r.id_conversacion,
         idUsuarioEmpresa: r.id_usuario_empresa
      }))
   }

   async save(msg: MensajeInterno): Promise<MensajeInterno> {
      const row = await queryOne<any>(`
         INSERT INTO mensaje_interno
         (id_conversacion, id_emisor, contenido, fecha_envio, leido)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`, 
         [msg.idConversacion, msg.idEmisor, msg.getContenido(), msg.fechaEnvio, msg.isLeido()]
      )
      return this.toEntity(row!)
   }

   async updateLeidos(idConversacion: number, idUsuario: number): Promise<void> {
      await execute(`
         UPDATE mensaje_interno SET
            leido = true,
            fecha_lectura = NOW()
         WHERE id_conversacion $1 AND id_emisor<>$2 AND leido = false`, 
         [idConversacion, idUsuario]
      )
   }
}

export class PostgresNotificacionRepository implements INotificacionRepository{
   private toEntity(row:any): Notificacion {
      return new Notificacion ({
         id: row.id_notificacion,
         idUsuario: row.id_usuario,
         idPlantilla: row.id_plantilla ?? undefined,
         idAlerta: row.id_alerta ?? undefined,
         titulo: row.titulo,
         contenido: row.contenido,
         fechaEnvio: row.fecha_envio,
         leida: row.leida,
         canal: row.canal as CanalNotificacion,
         formatoAccesible: row.formato_accesible
      })
   }
   async findByIdUsuario(idUsuario: number): Promise<Notificacion[]> {
      const rows = await query<any>(`
         SELECT
            id_notificacion,
            id_usuario,
            id_plantilla,
            id_alerta,
            titulo,
            contenido,
            fecha_envio,
            leida,
            canal,
            formato_accesible
         FROM notificacion
         WHERE id_usuario = $1
         ORDER BY fecha_envio
         DESC`, 
         [idUsuario]
      )
      return rows.map(this.toEntity)
   }

   async findNoLeidasByIdUsuario(idUsuario: number): Promise<Notificacion[]> {
      const rows = await query<any>(`
         SELECT
            id_notificacion,
            id_usuario,
            id_plantilla,
            id_alerta,
            titulo,
            contenido,
            fecha_envio,
            leida,
            canal,
            formato_accesible
         FROM notificacion
         WHERE id_usuario = $1 AND leida = false
         ORDER BY fecha_envio
         DESC`, 
         [idUsuario]
      )
      return rows.map(this.toEntity)
   }

   async save(notif: Notificacion): Promise<Notificacion> {
      const row = await queryOne<any>(`
         INSERT INTO notificacion
         (id_usuario, id_plantilla, id_alerta, titulo, contenido, fecha_envio, leida, canal, formato_accesible)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, 
         [notif.idUsuario, notif.idPlantilla, notif.idAlerta, notif.titulo, notif.contenido, notif.fechaEnvio,
         notif.isLeida(), notif.canal, notif.formatoAccesible]
      )
      return this.toEntity(row!)
   }

   async saveMasivo(notifs: Notificacion[]): Promise<void> {
      if(notifs.length == 0) return
      const values: any[] = []
      const placeholders = notifs.map((n, i) => {
         const b = i * 9
         values.push(n.idUsuario, n.idPlantilla, n.idAlerta, n.titulo, n.contenido, 
                     n.fechaEnvio, n.isLeida(), n.canal, n.formatoAccesible)
         return `($${b+1}, $${b+2}, $${b+3}, $${b+4}, $${b+5}, $${b+6}, $${b+7}, $${b+8}, $${b+9})`
      }).join(',')
      await execute(
         `INSERT INTO notificacion
         (id_usuario, id_plantilla, id_alerta, titulo, contenido, fecha_envio, leida, canal, formato_accesible)
         VALUES ${placeholders}`, values
      )
   }

   async update(notif: Notificacion): Promise<void> {
      await execute(`
         UPDATE notificacion SET
            leida = $1
         WHERE id_notificacion = $2`, 
         [notif.isLeida(), notif.id]
      )
   }
}

export class PostgresPlantillaNotificacionRepository implements IPlantillaNotificacionRepository{
   private toEntity(row:any): PlantillaNotificacion {
      return new PlantillaNotificacion({
         id: row.id_plantilla,
         idAdministrador: row.id_administrador,
         nombre: row.nombre,
         asunto: row.asunto ?? undefined,
         cuerpo: row.cuerpo,
         evento: row.evento,
         rolesDestino: row.roles_destino ?? undefined,
         activa: row.activa,
         fechaCreacion: row.fecha_creacion
      })
   }
   async findById(id: number): Promise<PlantillaNotificacion | null> {
      const row = await queryOne<any>(`
         SELECT
            id_plantilla,
            id_administrador,
            nombre,
            asunto,
            cuerpo,
            evento,
            roles_destino,
            activa,
            fecha_creacion
         FROM plantilla_notificacion
         WHERE id_plantilla = $1`, 
         [id]
      )
      return row ? this.toEntity(row) : null
   }

   async findAll(): Promise<PlantillaNotificacion[]> {
      const rows = await query<any>(`
         SELECT
            id_plantilla,
            id_administrador,
            nombre,
            asunto,
            cuerpo,
            evento,
            roles_destino,
            activa,
            fecha_creacion
         FROM plantilla_notificacion
         ORDER BY nombre`)
      return rows.map(this.toEntity)
   }

   async findActivaPorEvento(evento: string): Promise<PlantillaNotificacion | null> {
      const row = await queryOne<any>(`
         SELECT
            id_plantilla,
            id_administrador,
            nombre,
            asunto,
            cuerpo,
            evento,
            roles_destino,
            activa,
            fecha_creacion
         FROM plantilla_notificacion
         WHERE evento = $1 AND activa = true
         LIMIT 1`, 
         [evento]
      )
      return row ? this.toEntity(row) : null
   }

   async existsActivaPorEvento(evento: string, excludeId?: number): Promise<boolean> {
      const sql = excludeId ? `
         SELECT EXISTS (
            SELECT 1
            FROM plantilla_notificacion
            WHERE evento = $1 AND activa = true AND id_plantilla<>$2
         )` : `
         SELECT EXISTS (
            SELECT 1
            FROM plantilla_notificacion
            WHERE evento = $1 AND activa = true
         )`
      const row = await queryOne<{ exists : boolean }>(sql, excludeId ? [evento, excludeId] : [evento])

      return row?.exists ?? false
   }

   async save(plantilla: PlantillaNotificacion): Promise<PlantillaNotificacion> {
      const row = await queryOne<any>(`
         INSERT INTO plantilla_notificacion
         (id_administrador, nombre, asunto, cuerpo, evento, roles_destino, activa, fecha_creacion)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, 
         [plantilla.idAdministrador, plantilla.getNombre(), plantilla.getAsunto(), plantilla.getCuerpo(),
         plantilla.getEvento(), plantilla.getRolesDestino(), plantilla.isActiva(), plantilla.fechaCreacion]
      )
      return this.toEntity(row!)
   }

   async update(plantilla: PlantillaNotificacion): Promise<void> {
      await execute(`
         UPDATE platnilla_notificacion SET
            nombre = $1,
            asunto = $2.
            cuerpo = $3,
            roles_destino = $4,
            activa = $5
         WHERE id_plantilla = $6`, 
         [plantilla.getNombre(), plantilla.getAsunto(), plantilla.getCuerpo(), plantilla.getRolesDestino(),
         plantilla.isActiva(), plantilla.id]
      )
   }
}