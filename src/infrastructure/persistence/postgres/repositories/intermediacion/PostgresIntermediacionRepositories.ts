import { AsignacionIntermediador, CoordinacionEntrevista, DerivacionServicio, ObservacionCandidato, SeguimientoPostulacion } from "@domain/entities/intermediacion/IntermediacionEntities.entity";
import { EstadoAsignacion, EstadoDerivacion, EstadoEntrevista, EstadoSeguimiento, ModalidadEntrevista, ResultadoSeguimiento, TipoObservacion, TipoServicioExterno } from "@domain/enums/IntermediacionEnums.enum";
import { 
   IAsignacionIntermediadorRepository, 
   ICoordinacionEntrevistaRepository, 
   IDerivacionServicioRepository, 
   IObservacionCandidatoRepository, 
   ISeguimientoPostulacionRepository 
} from "@domain/repositories/intermediacion/IntermediacionRepositories";
import { execute, query, queryOne } from "../../connection/PostgresConnection";

export class PostgresAsignacionIntermediadorRepository implements IAsignacionIntermediadorRepository{
   private toEntity ( row: any ) : AsignacionIntermediador {
      return new AsignacionIntermediador ({
         id: row.id_asignacion,
         idIntermediador: row.id_intermediador,
         idCandidato: row.id_candidato,
         fechaAsignacion: new Date(row.fecha_asignacion),
         fechaFinalizacion: new Date(row.fecha_finalizacion) ?? undefined,
         estado: row.estado as EstadoAsignacion,
         motivoFinalizacion: row.motivo_finalizacion ?? undefined
      })
   }
   async findById(id: number): Promise<AsignacionIntermediador | null> {
      const row = await queryOne<any>(`
         SELECT
            id_asignacion,
            id_intermediador,
            id_candidato,
            fecha_asignacion,
            fecha_finalizacion,
            estado,
            motivo_finalizacion
         FROM asignacion_intermediador
         WHERE id_asignacion = $1`, 
         [id]
      )
      return row ? this.toEntity(row) : null
   }

   async findActivaByIdCandidato(idCandidato: number): Promise<AsignacionIntermediador | null> {
      const row = await queryOne<any>(`
         SELECT
            id_asignacion,
            id_intermediador,
            id_candidato,
            fecha_asignacion,
            fecha_finalizacion,
            estado,
            motivo_finalizacion
         FROM asignacion_intermediador
         WHERE id_candidato = $1 AND estado = 'activa' 
         LIMIT 1`, 
         [idCandidato]
      )
      return row ? this.toEntity(row) : null
   }

   async findByIdIntermediador(idIntermediador: number): Promise<AsignacionIntermediador[]> {
      const rows = await query<any>(`
         SELECT
            id_asignacion,
            id_intermediador,
            id_candidato,
            fecha_asignacion,
            fecha_finalizacion,
            estado,
            motivo_finalizacion
         FROM asignacion_intermediador
         WHERE id_intermediador = $1
         ORDER BY fecha_asignacion
         DESC`, 
         [idIntermediador]
      )
      return rows.map(this.toEntity)
   }

   async countActivasByIdIntermediador(idIntermediador: number): Promise<number> {
      const row = await queryOne<{ total: number }>(`
         SELECT COUNT(*) AS total
         FROM asignacion_intermediador 
         WHERE id_intermediador = $1 AND estado = 'activa'`, 
         [idIntermediador]
      )
      return row?.total ?? 0
   }

   async existsActivaByIdCandidato(idCandidato: number): Promise<boolean> {
      const row = await queryOne<{ exists: boolean }>(`
         SELECT EXISTS (
            SELECT 1
            FROM asignacion_intermediador
            WHERE id_candidato = $1 AND estado = 'activa'
         )`, 
         [idCandidato]
      )
      return row?.exists ?? false
   }

   async findCandidatosSinAsignar(): Promise<number[]> {
      const rows = await query<any>(`
         SELECT
            c.id_candidato
         FROM candidato c
         INNER JOIN usuario u ON u.id_usuario = c.id_usuario
         WHERE u.estado = 'activo' AND NOT EXISTS (
            SELECT 1
            FROM asignacion_intermediador ai
            WHERE ai.id_candidato = c.id_candidato AND ai.estado = 'activa'
         )`)
      return rows.map(r => r.id_candidato)
   }

   async save(asignacion: AsignacionIntermediador): Promise<AsignacionIntermediador> {
      const row = await queryOne<any>(`
         INSERT INTO asignacion_intermediador
         (id_intermediador, id_candidato, fecha_asignacion, estado)
         VALUES ($1,$2,$3,$4) RETURNING *`, 
         [asignacion.idIntermediador, asignacion.idCandidato, asignacion.fechaAsignacion, asignacion.getEstado()]
      )
      return this.toEntity(row!)
   }

   async update(asignacion: AsignacionIntermediador): Promise<void> {
      await execute(`
         UPDATE asignacion_intermediador SET
            estado = $1,
            fecha_finalizacion = $2,
            motivo_finalizacion = $3,
         WHERE id_asignacion = $4`, 
         [asignacion.getEstado(), (asignacion as any).fechaFinalizacion, 
         (asignacion as any).motivoFinalizacion, asignacion.id]
      )
   }
}

export class PostgresObservacionCandidatoRepository implements IObservacionCandidatoRepository {
   private toEntity ( row: any ) : ObservacionCandidato {
      return new ObservacionCandidato({
         id: row.id_observacion,
         idIntermediador: row.id_intermediador,
         idCandidato: row.id_candidato,
         contenido: row.contenido,
         fechaRegistro: new Date(row.fecha_registro),
         tipo: row.tipo as TipoObservacion,
         confidencial: row.confidencial
      })
   }
   async findByIdCandidato(idCandidato: number): Promise<ObservacionCandidato[]> {
      const rows = await query<any>(`
         SELECT
            id_observacion,
            id_intermediador,
            id_candidato,
            contenido,
            fecha_registro,
            tipo,
            confidencial
         FROM observacion_candidato
         WHERE id_candidato = $1
         ORDER BY fecha_registro
         DESC`, 
         [idCandidato]
      )
      return rows.map(this.toEntity)
   }

   async findById(id: number): Promise<ObservacionCandidato | null> {
      const row = await queryOne<any>(`
         SELECT
            id_observacion,
            id_intermediador,
            id_candidato,
            contenido,
            fecha_registro,
            tipo,
            confidencial
         FROM observacion_candidato
         WHERE id_observacion = $1
         ORDER BY fecha_registro
         DESC`, 
         [id]
      )
      return row ? this.toEntity(row) : null
   }

   async save(obs: ObservacionCandidato): Promise<ObservacionCandidato> {
      const row = await queryOne<any>(`
         INSERT INTO obervacion_candidato
         (id_intermediador, id_candidato, contenido, fecha_registro, tipo, confidencial)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNINIG *`, 
         [obs.idIntermediador, obs.idCandidato, obs.getContenido(), obs.fechaRegistro, 
         obs.getTipo(), obs.isConfidencial()]
      )
      return this.toEntity(row!)
   }

   async update(obs: ObservacionCandidato): Promise<void> {
      await execute(`
         UPDATE observacion_candidato SET
            contenido = $1
         WHERE id_observacion = $2`, 
         [obs.getContenido(), obs.id]
      )
   }

   async deleteById(id: number): Promise<void> {
      await execute(`
         DELETE FROM observacion_candidato
         WHERE id_observacion = $1`, 
         [id]
      )
   }
}

export class PostgresSeguimientoPostulacionRepository implements ISeguimientoPostulacionRepository {
   private toEntity ( row: any ) : SeguimientoPostulacion {
      return new SeguimientoPostulacion ({
         id: row.id_seguimiento,
         idIntermediador: row.id_intermediador,
         idPostulacion: row.id_postulacion,
         fechaInicio: new Date(row.fecha_inicio),
         fechaUltimaActualizacion: new Date(row.fecha_ultima_actualizacion) ?? undefined,
         estado: row.estado as EstadoSeguimiento,
         notas: row.notas ?? undefined,
         resultado: row.resultado as ResultadoSeguimiento ?? undefined
      })
   } 
   async findById(id: number): Promise<SeguimientoPostulacion | null> {
      const row = await queryOne<any>(`
         SELECT
            id_seguimiento,
            id_intermediador,
            id_postulacion,
            fecha_inicio,
            fecha_ultima_actualizacion,
            estado,
            notas,
            resultado
         FROM seguimiento_postulacion
         WHERE id_seguimiento = $1`, 
         [id]
      )
      return row ? this.toEntity(row) : null
   }

   async findActivoByIdPostulacion(idPostulacion: number): Promise<SeguimientoPostulacion | null> {
      const row = await queryOne<any>(`
         SELECT
            id_seguimiento,
            id_intermediador,
            id_postulacion,
            fecha_inicio,
            fecha_ultima_actualizacion,
            estado,
            notas,
            resultado
         FROM seguimiento_postulacion
         WHERE id_postulacion = $1 AND estado = 'activo'
         LIMIT 1`, 
         [idPostulacion]
      )
      return row ? this.toEntity(row) : null
   }

   async findByIdIntermediador(idIntermediador: number): Promise<SeguimientoPostulacion[]> {
      const rows = await query<any>(`
         SELECT
            id_seguimiento,
            id_intermediador,
            id_postulacion,
            fecha_inicio,
            fecha_ultima_actualizacion,
            estado,
            notas,
            resultado
         FROM seguimiento_postulacion
         WHERE id_intermediador = $1
         ORDER BY fecha_inicio
         DESC`, 
         [idIntermediador]
      )
      return rows.map(this.toEntity)
   }

   async save(seg: SeguimientoPostulacion): Promise<SeguimientoPostulacion> {
      const row = await queryOne<any>(`
         INSERT INTO seguimiento_postulacion
         (id_intermediador, id_postulacion, fecha_inicio, estado)
         VALUES ($1,$2,$3,$4) RETURNING *`, 
         [seg.idIntermediador, seg.idPostulacion, seg.fechaInicio, seg.getEstado()]
      )
      return this.toEntity(row!)
   }

   async update(seg: SeguimientoPostulacion): Promise<void> {
      await execute(`
         UPDATE seguimiento_postulacion SET
            estado = $1,
            notas = $2,
            resultado = $3
         WHERE id_seguimiento = $4`, 
         [seg.getEstado(), seg.getNotas(), seg.getResultado(), seg.id]
      )
   }
}

export class PostgresDerivacionServicioRepository implements IDerivacionServicioRepository {
   private toEntity ( row: any ): DerivacionServicio {
      return new DerivacionServicio ({
         id: row.id_derivacion,
         idSeguimiento: row.id_seguimiento,
         idCandidato: row.id_candidato,
         tipoServicio: row.tipo_servicio as TipoServicioExterno,
         entidadDestino: row.entidad_destino,
         motivo: row.motivo,
         fechaDerivacion: new Date(row.fecha_derivacion),
         estado: row.estado as EstadoDerivacion
      })
   }
   async findById(id: number): Promise<DerivacionServicio | null> {
      const row = await queryOne<any>(`
         SELECT
            id_derivacion,
            id_seguimiento,
            id_candidato,
            tipo_servicio,
            entidad_destino,
            motivo,
            fecha_derivacion,
            estado
         FROM derivacion_servicio
         WHERE id_derivacion = $1`, 
         [id]
      )
      return row ? this.toEntity(row) : null
   }

   async findByIdSeguimiento(idSeguimiento: number): Promise<DerivacionServicio | null> {
      const row = await queryOne<any>(`
         SELECT
            id_derivacion,
            id_seguimiento,
            id_candidato,
            tipo_servicio,
            entidad_destino,
            motivo,
            fecha_derivacion,
            estado
         FROM derivacion_servicio
         WHERE id_seguimiento = $1
         LIMIT 1`, 
         [idSeguimiento]
      )
      return row ? this.toEntity(row) : null
   }

   async findByIdIntermediador(idIntermediador: number): Promise<DerivacionServicio[]> {
      const rows = await query<any>(`
         SELECT
            ds.id_derivacion,
            ds.id_seguimiento,
            ds.id_candidato,
            ds.tipo_servicio,
            ds.entidad_destino,
            ds.motivo,
            ds.fecha_derivacion,
            ds.estado
         FROM derivacion_servicio ds
         INNER JOIN seguimiento_postulacion sp ON sp.id_seguimiento = ds.id_seguimiento
         WHERE sp.id_intermediador = $1
         ORDER BY ds.fecha_derivacion
         DESC`, 
         [idIntermediador]
      )
      return rows.map(this.toEntity)
   }

   async save(der: DerivacionServicio): Promise<DerivacionServicio> {
      const row = await queryOne<any>(`
         INSERT INTO derivacion_servicio
         (id_seguimiento, id_candidato, tipo_servicio, entidad_destino, motivo, fecha_derivacion, estado)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, 
         [der.idSeguimiento, der.idCandidato, der.getTipoServicio(), der.getEntidadDestino(), 
         der.getMotivo(), der.fechaDerivacion, der.getEstado()]
      )
      return this.toEntity(row!)
   }

   async update(der: DerivacionServicio): Promise<void> {
      await execute(`
         UPDATE derivacion_servicio SET
            estado = $1,
         WHERE id_derivacion = $2`, 
         [der.getEstado(), der.id]
      )
   }
}

export class PostgresCoordinacionEntrevistaRepository implements ICoordinacionEntrevistaRepository {
   private toEntity ( row: any ): CoordinacionEntrevista {
      return new CoordinacionEntrevista({
         id: row.id_coordinacion,
         idPostulacion: row.id_postulacion,
         idConversacion: row.id_conversacion ?? undefined,
         fechaEntrevista: new Date(row.fecha_entrevista),
         modalidad: row.modalidad as ModalidadEntrevista,
         lugar: row.lugar ?? undefined,
         urlReunion: row.url_reunion ?? undefined,
         ajustesNecesarios: row.ajustes_necesarios ?? undefined,
         estado: row.estado as EstadoEntrevista,
      })
   }
   async findByIdPostulacion(idPostulacion: number): Promise<CoordinacionEntrevista | null> {
      const row = await queryOne<any>(`
         SELECT
            id_coordinacion,
            id_postulacion,
            id_conversacion,
            fecha_entrevista,
            modalidad,
            lugar,
            url_reunion,
            ajustes_necesarios,
            estado
         FROM coordinacion_entrevista
         WHERE id_postulacion = $1
         LIMIT 1`, 
         [idPostulacion]
      )
      return row ? this.toEntity(row) : null
   }

   async save(coord: CoordinacionEntrevista): Promise<CoordinacionEntrevista> {
      const row = await queryOne<any>(`
         INSERT INTO coordinacion_entrevista
         (id_postulacion, id_conversacion, fecha_entrevista, modalidad, lugar, url_reunion, ajustes_necesarios, estado)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, 
         [coord.idPostulacion, (coord as any).idConversacion, coord.getFechaEntrevista(), coord.getModalidad(),
         coord.getLugar(), coord.getUrlReunion(), coord.getAjustesNecesarios(), coord.getEstado()]
      )
      return this.toEntity(row!)
   }

   async update(coord: CoordinacionEntrevista): Promise<void> {
      await execute(`
         UPDATE coordinacion_entrevista SET
            fecha_entrevista = $1,
            modalidad = $2,
            lugar = $3,
            url_reunion = $4,
            ajustes_necesarios = $5,
            estado = $6
         WHERE id_coordinacion = $7`, 
         [coord.getFechaEntrevista(), coord.getModalidad(), coord.getLugar(), coord.getUrlReunion(),
         coord.getAjustesNecesarios(), coord.getEstado(), coord.id]
      )
   }
}