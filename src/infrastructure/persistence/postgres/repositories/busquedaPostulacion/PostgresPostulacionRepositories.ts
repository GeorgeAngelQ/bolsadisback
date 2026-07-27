import { Postulacion } from "@domain/entities/busquedaPostulacion/Postulacion.entity";
import { AlertaEmpleo, RecomendacionVacante, VacanteGuardada } from "@domain/entities/busquedaPostulacion/PostulacionEntities.entity";
import { EstadoPostulacion, FrecuenciaAlerta, OrigenRecomendacion } from "@domain/enums/PostulacionEnums.enum";
import { 
   IAlertaEmpleoRepository, 
   IPostulacionRepository, 
   IRecomendacionVacanteRepository, 
   IVacanteGuardadaRepository 
} from "@domain/repositories/busquedaPostulacion/PostulacionRepositories";
import { execute, query, queryOne } from "../../connection/PostgresConnection";
import { ModalidadTrabajo } from "@domain/enums/VacanteEnums.enum";

export class PostgresPostulacionRepository implements IPostulacionRepository {
   private toEntity( row: any ) : Postulacion {
      return new Postulacion({
         id: row.id_postulacion,
         idCandidato: row.id_candidato,
         idVacante: row.id_vacante,
         fechaPostulacion: new Date(row.fecha_postulacion),
         estado: row.estado as EstadoPostulacion,
         cartaPresentacion: row.carta_presentacion ?? undefined,
         calificacion: row.calificacion ?? undefined,
         comentarioCalificacion: row.comentario_calificacion ?? undefined,
         fechaCalificacion: new Date(row.fecha_calificacion) ?? undefined
      })
   }
   async findById(id: number): Promise<Postulacion | null> {
      const row = await queryOne<any>(`
         SELECT
            id_postulacion,
            id_candidato,
            id_vacante,
            fecha_postulacion,
            estado,
            carta_presentacion,
            calificacion,
            comentario_calificacion,
            fecha_calificacion
         FROM postulacion
         WHERE id_postulacion = $1`, [id])
      return row ? this.toEntity(row) : null
   }

   async findByIdCandidato(idCandidato: number): Promise<Postulacion[]> {
      const rows = await query<any>(`
         SELECT
            id_postulacion,
            id_candidato,
            id_vacante,
            fecha_postulacion,
            estado,
            carta_presentacion,
            calificacion,
            comentario_calificacion,
            fecha_calificacion
         FROM postulacion
         WHERE id_candidato = $1
         ORDER BY fecha_postulacion
         DESC`, 
         [idCandidato]
      )
      return rows.map(this.toEntity)
   }

   async findByIdVacante(idVacante: number): Promise<Postulacion[]> {
      const rows = await query<any>(`
         SELECT
            id_postulacion,
            id_candidato,
            id_vacante,
            fecha_postulacion,
            estado,
            carta_presentacion,
            calificacion,
            comentario_calificacion,
            fecha_calificacion
         FROM postulacion
         WHERE id_vacante = $1
         ORDER BY fecha_postulacion
         DESC`, 
         [idVacante]
      )
      return rows.map(this.toEntity)
   }

   async existsByIdCandidatoAndIdVacante(idCandidato: number, idVacante: number): Promise<boolean> {
      const row = await queryOne<{ exists: boolean }>(`
         SELECT EXISTS (
            SELECT 1 
            FROM postulacion 
            WHERE id_candidato = $1 AND id_vacante = $2)`,
            [idCandidato, idVacante]
         )
      return row?.exists ?? false
   }

   async findSinCalificarPorEstado(estados: EstadoPostulacion[]): Promise<Postulacion[]> {
      if (!estados.length) {
         return []
      }
      const ph = estados.map((_,i) => `$${i+1}`).join(',');
      const rows = await query<any>(`
         SELECT
            id_postulacion,
            id_candidato,
            id_vacante,
            fecha_postulacion,
            estado,
            carta_presentacion,
            calificacion,
            comentario_calificacion,
            fecha_calificacion
         FROM postulacion
         WHERE estado IN (${ph}) AND calificacion IS NULL`, estados)
      return rows.map(this.toEntity)
   }

   async save(postulacion: Postulacion): Promise<Postulacion> {
      const row = await queryOne<any>(`
         INSERT INTO postulacion
         (id_candidato, id_vacante, fecha_postulacion, estado, carta_presentacion)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`, 
         [postulacion.idCandidato, postulacion.idVacante, postulacion.fechaPostulacion, 
         postulacion.getEstado(), postulacion.getCartaPresentacion()]
      )
      return this.toEntity(row!)
   }

   async update(postulacion: Postulacion): Promise<void> {
      await execute(`
         UPDATE postulacion SET
            estado = $1,
            calificacion = $2,
            comentario_calificacion = $3,
            fecha_calificacion = $4
         WHERE id_postulacion = $5`,
         [postulacion.getEstado(), postulacion.getCalificacion(), postulacion.getComentarioCalificacion(),
         postulacion.getFechaCalificacion(), postulacion.id]
      )
   }
}

export class PostgresRecomendacionVacanteRepository implements IRecomendacionVacanteRepository {
   private toEntity( row: any ) : RecomendacionVacante {
      return new RecomendacionVacante ({
         id: row.id_recomendacion,
         idCandidato: row.id_candidato,
         idVacante: row.id_vacante,
         idIntermediador: row.id_intermediador,
         origen: row.origen as OrigenRecomendacion,
         puntuacionCompatibilidad: parseFloat(row.puntuacion_compatibilidad ?? '0'),
         fechaGeneracion: new Date(row.fecha_generacion),
         leida: row.leida
      })
   }
   async findByIdCandidato(idCandidato: number): Promise<RecomendacionVacante[]> {
      const rows = await query<any>(`
         SELECT
            id_recomendacion,
            id_candidato,
            id_vacante,
            id_intermediador,
            origen,
            puntuacion_compatibilidad,
            fecha_generacion,
            leida
         FROM recomendacion_vacante
         WHERE id_candidato = $1`, 
         [idCandidato]
      )
      return rows.map(this.toEntity)
   }

   async existsByIdCandidatoAndIdVacante(idCandidato: number, idVacante: number): Promise<boolean> {
      const row = await queryOne<{ exists : boolean }>(`
         SELECT EXISTS (
            SELECT 1 
            FROM recomendacion_vacante 
            WHERE id_candidato = $1 AND id_vacante = $2
         )`, 
         [idCandidato, idVacante]
      )
      return row?.exists ?? false
   }

   async save(recomendacion: RecomendacionVacante): Promise<RecomendacionVacante> {
      const row = await queryOne(`
         INSERT INTO recomendacion_vacante
         (id_candidato, id_vacante, id_intermediador, origen, puntuacion_compatibilidad, fecha_generacion, leida)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, 
         [recomendacion.idCandidato, recomendacion.idVacante, recomendacion.idIntermediador, recomendacion.origen,
         recomendacion.getPuntuacion(), recomendacion.fechaGeneracion, recomendacion.isLeida()])
      return this.toEntity(row!)
   }

   async update(recomendacion: RecomendacionVacante): Promise<void> {
      await execute(`
         UPDATE recomendacion_vacante SET
            leida = $1,
            puntuacion_compatibilidad = $2
         WHERE id_recomendacion = $3`, 
         [recomendacion.isLeida(), recomendacion.getPuntuacion(), recomendacion.id]
      )
   }

   async deleteById(id: number): Promise<void> {
      await execute(`
         DELETE FROM recomendacion_vacante
         WHERE id_recomendacion = $1`, 
         [id]
      )
   }
}

export class PostgresAlertaEmpleoRepository implements IAlertaEmpleoRepository {
   private toEntity( row: any ) : AlertaEmpleo {
      return new AlertaEmpleo({
         id: row.id_alerta,
         idCandidato: row.id_candidato,
         palabrasClave: row.palabras_clave ?? undefined,
         sectorEconomico: row.sector_economico ?? undefined,
         modalidad: row.modalidad as ModalidadTrabajo ?? undefined,
         frecuencia: row.frecuencia as FrecuenciaAlerta,
         activa: row.activa,
         fechaCreacion: new Date(row.fecha_creacion)
      })
   }
   async findByIdCandidato(idCandidato: number): Promise<AlertaEmpleo[]> {
      const rows = await query<any>(`
         SELECT
            id_alerta,
            id_candidato,
            palabras_clave,
            sector_economico,
            modalidad,
            frecuencia,
            activa,
            fecha_creacion
         FROM alerta_empleo
         WHERE id_candidato = $1
         ORDER BY fecha_creacion
         DESC`, 
         [idCandidato]
      )
      return rows.map(this.toEntity)
   }

   async findById(id: number): Promise<AlertaEmpleo | null> {
      const row = await queryOne<any>(`
         SELECT
            id_alerta,
            id_candidato,
            palabras_clave,
            sector_economico,
            modalidad,
            frecuencia,
            activa,
            fecha_creacion
         FROM alerta_empleo
         WHERE id_alerta = $1`, 
         [id]
      )
      return row ? this.toEntity(row) : null
   }

   async findActivas(): Promise<AlertaEmpleo[]> {
      const rows = await query<any>(`
         SELECT
            id_alerta,
            id_candidato,
            palabras_clave,
            sector_economico,
            modalidad,
            frecuencia,
            activa,
            fecha_creacion
         FROM alerta_empleo
         WHERE activa = true`)
      return rows.map(this.toEntity)
   }

   async save(alerta: AlertaEmpleo): Promise<AlertaEmpleo> {
      const row = await queryOne<any>(`
         INSERT INTO alerta_empleo
         (id_candidato, palabras_clave, sector_economico, modalidad, frecuencia, activa, fecha_creacion) 
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, 
         [alerta.idCandidato, alerta.getPalabrasClave(), alerta.getSectorEconomico(), alerta.getModalidad(),
         alerta.getFrecuencia(), alerta.isActiva(), alerta.fechaCreacion])
      return this.toEntity(row!)
   }

   async update(alerta: AlertaEmpleo): Promise<void> {
      await execute(`
         UPDATE alerta_empleo SET
            palabras_clave = $1,
            sector_economico = $2,
            modalidad = $3,
            frecuencia = $4,
            activa = $5
         WHERE id_alerta = $6`, 
         [alerta.getPalabrasClave(), alerta.getSectorEconomico(), alerta.getModalidad(), 
         alerta.getFrecuencia(), alerta.isActiva(), alerta.id]
      )
   }
}

export class PostgresVacanteGuardadaRepository implements IVacanteGuardadaRepository {
   private toEntity( row: any ): VacanteGuardada {
      return new VacanteGuardada({
         id: row.id_vacante_guardada,
         idCandidato: row.id_candidato,
         idVacante: row.id_vacante,
         fechaGuardado: new Date(row.fecha_guardado)
      })
   }
   async findByIdCandidato(idCandidato: number): Promise<VacanteGuardada[]> {
      const rows = await query<any>(`
         SELECT
            id_vacante_guardada,
            id_candidato,
            id_vacante,
            fecha_guardado
         FROM vacante_guardada
         WHERE id_candidato = $1
         ORDER BY fecha_guardado
         DESC`, 
         [idCandidato]
      )
      return rows.map(this.toEntity)
   }

   async existsByIdCandidatoAndIdVacante(idCandidato: number, idVacante: number): Promise<boolean> {
      const row = await queryOne(`
         SELECT EXISTS (
            SELECT 1 
            FROM vacante_guardada
            WHERE id_candidato = $1 AND id_vacante = $2
         )`, 
         [idCandidato, idVacante]
      )
      return row?.exists ?? false
   }

   async countByIdCandidato(idCandidato: number): Promise<number> {
      const row = await queryOne<{ total: number }>(`
         SELECT COUNT(*) AS total 
         FROM vacante_guardada
         WHERE id_candidato = $1`, 
         [idCandidato]
      )
      return row?.total ?? 0
   }

   async save(favorito: VacanteGuardada): Promise<VacanteGuardada> {
      const row = await queryOne<any>(`
         INSERT INTO vacante_guardada
         (id_candidato, id_vacante, fecha_guardado)
         VALUES ($1,$2,$3) RETURNING *`, 
         [favorito.idCandidato, favorito.idVacante, favorito.fechaGuardado]
      )
      return this.toEntity(row!)
   }

   async deleteByIdCandidatoAndIdVacante(idCandidato: number, idVacante: number): Promise<void> {
      await execute(`
         DELETE FROM vacante_guardada
         WHERE id_candidato = $1 AND id_vacante = $2`, 
         [idCandidato, idVacante]
      )
   }
}