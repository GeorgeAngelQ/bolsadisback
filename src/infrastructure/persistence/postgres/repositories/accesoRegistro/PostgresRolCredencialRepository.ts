import { CredencialAcceso } from '@domain/entities/accesoRegistro/CredencialAcceso.entity';
import { Permiso, Rol } from '@domain/entities/accesoRegistro/Rol.entity';
import { ICredencialAccesoRepository } from '@domain/repositories/accesoRegistro/ICredencialAccesoRepository';
import { IPreferenciaAccesibilidadRepository } from '@domain/repositories/accesoRegistro/IPreferenciaAccesibilidadRepository';
import { IRolRepository } from '@domain/repositories/accesoRegistro/IRolRepository';
import { PreferenciaAccesibilidad, TamanoTexto, TipoContraste } from '@domain/entities/accesoRegistro/PreferenciaAccesibilidad.entity';
import { execute, query, queryOne } from '../../connection/PostgresConnection';
import { AccionPermiso } from '@domain/enums/AccionPermiso.enum';

export class PostgresRolRepository implements IRolRepository {
   private toEntityRol(row:any): Rol {
      return new Rol({
         id: row.id_rol,
         nombre: row.nombre,
         descripcion: row.descripcion ?? undefined,
         fechaCreacion: new Date (row.fecha_descripcion),
         permisos: row.permisos
      })
   }

   async findById(id: number): Promise<Rol | null> {
      const row = await queryOne<any>(
         `SELECT 
            id_rol,
            nombre,
            descripcion,
            fecha_creacion
         FROM rol
         WHERE id_rol = $1`,
         [id]
      )
      return row ? this.toEntityRol(row) : null
   }

   async findByNombre(nombre: string): Promise<Rol | null> {
      const row = await queryOne<any>(
         `SELECT
            id_rol,
            nombre,
            descripcion,
            fecha_creacion
         FROM rol
         WHERE nombre = $1`,
         [nombre]
      )
      return row ? this.toEntityRol(row) : null
   }

   async findAll(): Promise<Rol[]> {
      const rows = await query<any>(`
         SELECT
            id_rol,
            nombre,
            descripcion,
            fecha_creacion
         FROM rol
         ORDER BY nombre
         DESC`)
      return rows.map(this.toEntityRol)
   }

   async existsByNombre(nombre: string): Promise<boolean> {
      const row = await queryOne<{ exists: boolean }>(
         `SELECT EXISTS (
            SELECT 1 FROM rol WHERE nombre = $1
         )`, [nombre],
      )
      return row?.exists ?? false
   }

   async save(rol: Rol): Promise<Rol> {
      const row = await queryOne<any>(`
         INSERT INTO rol
         (nombre, descripcion, fecha_creacion)
         VALUES ($1,$2,$3) RETURNING *`, 
         [rol.getNombre(), rol.getDescripcion(), rol.fechaCreacion]
      )
      return this.toEntityRol(row!)
   }

   async update(rol: Rol): Promise<void> {
      await execute(`
         UPDATE rol SET
            descripcion = $1,
         WHERE id_rol = $2`, 
         [rol.getDescripcion(), rol.id]
      )
   }

   private toEntityPermiso(row: any): Permiso {
      return new Permiso ({
         id: row.id_permiso,
         nombre: row.nombre,
         modulo: row.modulo,
         accion: row.accion as AccionPermiso
      })
   }

   async findPermisosByRolId(idRol: number): Promise<Permiso[]> {
      const rows = await query<any>(`
         SELECT
            p.id_permiso,
            p.nombre,
            p.modulo,
            p.accion
         FROM permiso p
         INNER JOIN rol_permiso rp ON rp.id_permiso = p.id_permiso
         WHERE rp.id_rol = $1`, 
         [idRol]
      )
      return rows.map(this.toEntityPermiso)
   }

   async findAllPermisos(): Promise<Permiso[]> {
      const rows = await query<any>(`
         SELECT
            id_permiso,
            nombre,
            modulo,
            accion
         FROM permiso
         ORDER BY modulo, accion`,
      )
      return rows.map(this.toEntityPermiso)
   }

   async syncPermisos(idRol: number, permisoIds: number[]): Promise<void> {
      await execute(`
         DELETE FROM rol_permiso
         WHERE id_rol = $1`, 
         [idRol]
      )      
      for (const idPermiso of permisoIds) {
         await execute(`
            INSERT INTO rol_permiso
            (id_rol, id_permiso)
            VALUES ($1,$2) ON CONFLICT DO NOTHING`, 
            [idRol, idPermiso]
         )
      }
   }

   async assignRolToUsuario(idUsuario: number, idRol: number): Promise<void> {
      await execute(`
         INSERT INTO usuario_rol
         (id_usuario, id_rol)
         VALUES ($1,$2) ON CONFLICT DO NOTHING`, 
         [idUsuario, idRol]
      )
   }

   async findRolesByUsuarioId(idUsuario: number): Promise<Rol[]> {
      const rows = await query<any>(`
         SELECT
            r.id_rol,
            r.nombre,
            r.descripcion,
            r.fecha_creacion
         FROM rol r
         INNER JOIN usuario_rol ur ON ur.id_rol = r.id_rol
         WHERE ur.id_usuario = $1`, 
         [idUsuario]
      )
      return rows.map(this.toEntityRol)
   }
}

export class PostgresCredencialAccesoRepository implements ICredencialAccesoRepository {
   private toEntity(row:any): CredencialAcceso{
      return new CredencialAcceso ({
         id: row.id_credencial,
         idUsuario: row.id_usuario,
         tokenRecuperacion: row.token_recuperacion ?? undefined,
         fechaExpiracionToken: row.fecha_expiracion_token ?? undefined,
         fechaUltimoCambio: row.fecha_ultimo_cambio ?? undefined
      })
   }
   async findByIdUsuario(idUsuario: number): Promise<CredencialAcceso | null> {
      const row = await queryOne<any>(
         `SELECT 
            id_credencial,
            id_usuario,
            token_recuperacion,
            fecha_expiracion_token,
            fecha_ultimo_cambio
         FROM credencial_acceso
         WHERE id_usuario = $1`,
         [idUsuario],
      )
      return row ? this.toEntity(row) : null
   }

   async findByToken(token: string): Promise<CredencialAcceso | null> {
      const row = await queryOne<any>(
         `SELECT 
            id_credencial,
            id_usuario,
            token_recuperacion,
            fecha_expiracion_token,
            fecha_ultimo_cambio
         FROM credencial_acceso
         WHERE token_recuperacion = $1`,
         [token],
      )
      return row ? this.toEntity(row) : null
   }

   async save(credencial: CredencialAcceso): Promise<CredencialAcceso> {
      const row = await queryOne<any>(`
         INSERT INTO credencial_acceso
         (id_usuario, token_recuperacion, fecha_expiracion_token, fecha_ultimo_cambio)
         VALUES ($1,$2,$3,$4) RETURNING *`, 
         [credencial.idUsuario, credencial.getTokenRecuperacion(), credencial.getFechaExpiracionToken(), 
         credencial.getFechaUltimoCambio()]
      )
      return this.toEntity(row!)
   }

   async update(credencial: CredencialAcceso): Promise<void> {
      await execute(`
         UPDATE credencial_acceso SET
            token_recuperacion = $1,
            fecha_expiracion_token = $2,
            fecha_ultimo_cambio = $3
         WHERE id_credencial = $4`, 
         [credencial.getTokenRecuperacion(), credencial.getFechaExpiracionToken(), 
         credencial.getFechaUltimoCambio(), credencial.id]
      )
   }
}

export class PostgresPreferenciaAccesibilidadRepository implements IPreferenciaAccesibilidadRepository {
   private toEntity(row:any): PreferenciaAccesibilidad{
      return new PreferenciaAccesibilidad ({
         id: row.id_preferencia,
         idUsuario: row.id_usuario,
         tipoContraste: row.tipo_contraste as TipoContraste,
         tamanoTexto: row.tamano_texto as TamanoTexto,
         subtitulosActivos: row.subtitulos_activos,
         lenguaSenas: row.lengua_senas,
         lectorPantalla: row.lector_pantalla,
         lenguajeSencillo: row.lenguaje_sencillo
      })
   }
   async findByIdUsuario(idUsuario: number): Promise<PreferenciaAccesibilidad | null> {
      const row = await queryOne<any>(
         `SELECT
            id_preferencia,
            id_usuario,
            tipo_contraste,
            tamano_texto,
            subtitulos_activos,
            lengua_senas,
            lector_pantalla,
            lenguaje_sencillo 
         FROM preferencia_accesibilidad
         WHERE id_usuario = $1`,
         [idUsuario]
      )
      return row ? this.toEntity(row) : null
   }

   async save(preferencia: PreferenciaAccesibilidad): Promise<PreferenciaAccesibilidad> {
      const row = await queryOne<any>(`
         INSERT INTO preferencia_accesibilidad
         (id_usuario, tipo_contraste, tamano_texto, subtitulos_activos, lengua_senas, lector_pantalla, lenguaje_sencillo)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, 
         [preferencia.idUsuario, preferencia.getTipoContraste(), preferencia.getTamanoTexto(), 
         preferencia.isSubtitulosActivos(), preferencia.isLenguaSenas(), preferencia.isLectorPantalla(), 
         preferencia.isLenguajeSencillo()]
      )
      return this.toEntity(row!)
   }

   async update(preferencia: PreferenciaAccesibilidad): Promise<void> {
      await execute(`
         UPDATE preferencia_accesibilidad SET
            tipo_contraste = $1,
            tamano_texto = $2,
            subtitulos_activos = $3,
            lengua_senas = $4,
            lector_pantalla = $5,
            lenguaje_sencillo = $6
         WHERE id_preferencia = $7`, 
         [preferencia.getTipoContraste(), preferencia.getTamanoTexto(), preferencia.isSubtitulosActivos(), 
         preferencia.isLenguaSenas(), preferencia.isLectorPantalla(), preferencia.isLenguajeSencillo(), preferencia.id]
      )
   }
}