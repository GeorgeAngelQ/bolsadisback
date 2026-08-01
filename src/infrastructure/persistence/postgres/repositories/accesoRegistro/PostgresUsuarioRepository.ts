import { queryOne, execute } from "../../connection/PostgresConnection"

import { Usuario } from "@domain/entities/accesoRegistro/Usuario.entity"
import { IUsuarioRepository } from "@domain/repositories/accesoRegistro/IUsuarioRepository"
import { Email } from "@domain/value-objects/Email.vo"

export class PostgresUsuarioRepository implements IUsuarioRepository {
   private toEntity(row:any): Usuario {
      return new Usuario({
         id: row.id_usuario,
         correo: new Email(row.correo),
         contrasenaHash: row.contrasena,
         estado: row.estado,
         intentosFallidos: row.intentos_fallidos,
         fechaRegistro: row.fecha_registro,
         ultimoAcceso: row.ultimo_acceso ?? undefined
      })
   }

   async findById(id: number): Promise<Usuario | null> {
      const row = await queryOne<any>(
         `SELECT 
            id_usuario, 
            correo, 
            contrasena, 
            fecha_registro, 
            ultimo_acceso, 
            estado, 
            intentos_fallidos
         FROM usuario 
         WHERE id_usuario = $1`, 
            [id],
      )
      return row ? this.toEntity(row) : null 
   } 

   async findByCorreo(correo: string): Promise<Usuario | null> {
      const row = await queryOne<any>(
         `SELECT 
            id_usuario, 
            correo, 
            contrasena, 
            fecha_registro, 
            ultimo_acceso, 
            estado, 
            intentos_fallidos
         FROM usuario 
         WHERE correo=$1`, 
            [correo.toLocaleLowerCase()],
      )
      return row ? this.toEntity(row) : null 
   }

   async existsByCorreo(correo: string): Promise<boolean> {
      const row = await queryOne<any>(
         `SELECT EXISTS (
            SELECT 1 
            FROM usuario 
            WHERE correo=$1
         )`, [correo.toLowerCase()],
      )
      return row?.exists ?? false
   }

   async save(usuario: Usuario): Promise<Usuario> {
      const row = await queryOne<any>(
         `INSERT INTO usuario
         (correo,contrasena,fecha_registro,estado,intentos_fallidos)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
         [usuario.getCorreo(), usuario.getContrasenaHash(), usuario.fechaRegistro, usuario.getEstado(),
         usuario.getIntentosFallidos()]
      )
      return this.toEntity(row!)
   }

   async update(usuario: Usuario): Promise<void> {
      await execute(
         `UPDATE usuario SET 
            contrasena = $1,
            ultimo_acceso = $2,
            estado = $3,
            intentos_fallidos = $4
         WHERE id_usuario = $5`, 
         [usuario.getContrasenaHash(), usuario.getUltimoAcceso(), usuario.getEstado(), 
         usuario.getIntentosFallidos(), usuario.id]
      )
   }

   async countAdministradoresActivos(): Promise<number> {
      const row = await queryOne<any>(`
         SELECT 
            COUNT(*) 
         FROM administrador a
         INNER JOIN usuario u ON u.id_usuario=a.id_usuario 
         WHERE u.estado='activo'`,
      )
      return row?.count ?? 0
   }
}