import { Ruc } from './../../../../../domain/value-objects/Ruc.vo';
import { Dni } from '@domain/value-objects/Dni.vo';
import { queryOne, execute } from '../../connection/PostgresConnection';

import { ICandidatoRepository } from '@domain/repositories/accesoRegistro/ICandidatoRepository';
import { IEmpresaEmpleadoraRepository } from '@domain/repositories/accesoRegistro/IEmpresaEmpleadoraRepository';
import { IIntermediadorLaboralRepository } from '@domain/repositories/accesoRegistro/IIntermediadorLaboralRepository';
import { IAdministradorRepository } from '@domain/repositories/accesoRegistro/IAdministradorRepository';


import { Candidato } from '@domain/entities/accesoRegistro/Candidato.entity';
import { EmpresaEmpleadora } from '@domain/entities/accesoRegistro/EmpresaEmpleadora.entity';
import { IntermediadorLaboral } from '@domain/entities/accesoRegistro/IntermediadorLaboral.entity';
import { Administrador } from '@domain/entities/accesoRegistro/Administrador.entity';

export class PostgresCandidatoRepository implements ICandidatoRepository {
   private toEntity(row:any): Candidato {
      return new Candidato({
         id: row.id_candidato,
         idUsuario: row.id_usuario,
         nombres: row.nombres,
         apellidos: row.apellidos,
         dni: new Dni (row.dni),
         fechaNacimiento: new Date (row.fecha_nacimiento),
         telefono: row.telefono ?? undefined,
         distrito: row.distrito,
      })
   }
   async findById(id: number): Promise<Candidato | null> {
      const row = await queryOne<any>(
         `SELECT 
            id_candidato, 
            id_usuario, 
            nombres, 
            apellidos, 
            dni, 
            fecha_nacimiento, 
            telefono, 
            distrito 
            FROM candidato WHERE id_candidato = $1`, 
            [id],
      )
      return row ? this.toEntity(row) : null 
   } 

   async findByIdUsuario(idUsuario: number): Promise<Candidato | null> {
      const row = await queryOne<any>(
         `SELECT 
            id_candidato, 
            id_usuario, 
            nombres, 
            apellidos, 
            dni, 
            fecha_nacimiento, 
            telefono, 
            distrito 
            FROM candidato WHERE id_usuario = $1`, 
            [idUsuario],
      )
      return row ? this.toEntity(row) : null 
   }

   async existsByDni(dni: string): Promise<boolean> {
      const row = await queryOne<any>(
         `SELECT EXISTS (
            SELECT 1 FROM candidato WHERE dni=$1
         )`, [dni],
      )
      return row?.exists ?? false
   }

   async save(candidato: Candidato): Promise<Candidato> {
      const row = await queryOne<any>(
         `INSERT INTO candidato
         (id_usuario,nombres,apellidos,dni,fecha_nacimiento,telefono,distrito)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
         [candidato.idUsuario, candidato.getNombres, candidato.getApellidos, candidato.getDni, 
         candidato.fechaNacimiento, candidato.getTelefono, candidato.getDistrito]
      )
      return this.toEntity(row!)
   }

   async update(candidato: Candidato): Promise<void> {
      await execute(
         `UPDATE candidato SET 
            telefono = $1,
            distrito = $2
            WHERE id_candidato = $3`, 
         [candidato.getTelefono, candidato.getDistrito, candidato.id]
      )
   }
}

export class PostgresEmpresaEmpleadoraRepository implements IEmpresaEmpleadoraRepository {
   private toEntity(row:any): EmpresaEmpleadora {
      return new EmpresaEmpleadora({
         id: row.id_empresa,
         idUsuario: row.id_usuario,
         razonSocial: row.razon_social,
         ruc: new Ruc (row.ruc),
         representanteLegal: row.representante_legal ?? undefined,
         telefonoEmpresa: row.telefono_empresa ?? undefined,
         correoEmpresa: row.correo_empresa ?? undefined,
      })
   }

   async findById(id: number): Promise<EmpresaEmpleadora | null> {
      const row = await queryOne<any>(
         `SELECT 
            id_empresa, 
            id_usuario, 
            razon_social, 
            ruc, 
            representante_legal, 
            telefono_empresa, 
            correo_empresa
            FROM empresa_empleadora WHERE id_empresa = $1`, 
            [id],
      )
      return row ? this.toEntity(row) : null 
   }

   async findByIdUsuario(idUsuario: number): Promise<EmpresaEmpleadora | null> {
      const row = await queryOne<any>(
         `SELECT 
            id_empresa, 
            id_usuario, 
            razon_social, 
            ruc, 
            representante_legal, 
            telefono_empresa, 
            correo_empresa
            FROM empresa_empleadora WHERE id_usuario = $1`, 
            [idUsuario],
      )
      return row ? this.toEntity(row) : null 
   }

   async existsByRuc(ruc: string): Promise<boolean> {
      const row = await queryOne<any>(
         `SELECT EXISTS (
            SELECT 1 FROM empresa_empleadora WHERE ruc=$1
         )`, [ruc],
      )
      return row?.exists ?? false
   }

   async save(empresa: EmpresaEmpleadora): Promise<EmpresaEmpleadora> {
      const row = await queryOne<any>(
         `INSERT INTO empresa_empleadora
         (id_usuario,razon_social,ruc,representante_legal,telefono_empresa,correo_empresa)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
         [empresa.idUsuario, empresa.getRazonSocial(), empresa.getRuc(), empresa.getRepresentanteLegal(),
         empresa.getTelefonoEmpresa(), empresa.getCorreoEmpresa()]
      )
      return this.toEntity(row!)
   }

   async update(empresa: EmpresaEmpleadora): Promise<void> {
      await execute(
         `UPDATE empresa_empleadora SET 
            razon_social = $1,
            representante_legal = $2,
            telefono_empresa = $3,
            correo_empresa = $4,
            WHERE id_empresa = $5`, 
         [empresa.getRazonSocial(), empresa.getRepresentanteLegal(), empresa.getTelefonoEmpresa(), 
         empresa.getTelefonoEmpresa(), empresa.getCorreoEmpresa(), empresa.id]
      )
   }
}

export class PostgresIntermediadorRepository implements IIntermediadorLaboralRepository {
   private toEntity(row:any): IntermediadorLaboral {
      return new IntermediadorLaboral({
         id: row.id_intermediador,
         idUsuario: row.id_usuario,
         nombres: row.nombres,
         apellidos: row.apellidos,
         dni: row.dni,
         entidadOrigen: row.entidad_origen ?? undefined,
         telefono: row.telefono ?? undefined,
      })
   }

   async findById(id: number): Promise<IntermediadorLaboral | null> {
      const row = await queryOne<any>(
         `SELECT 
            id_intermediador, 
            id_usuario, 
            nombres, 
            apellidos, 
            dni, 
            entidad_origen, 
            telefono
            FROM intermediador_laboral WHERE id_intermediador = $1`, 
            [id],
      )
      return row ? this.toEntity(row) : null 
   }

   async findByIdUsuario(idUsuario: number): Promise<IntermediadorLaboral | null> {
      const row = await queryOne<any>(
         `SELECT 
            id_intermediador, 
            id_usuario, 
            nombres, 
            apellidos, 
            dni, 
            entidad_origen, 
            telefono
            FROM intermediador_laboral WHERE id_usuario = $1`, 
            [idUsuario],
      )
      return row ? this.toEntity(row) : null 
   }

   async existsByDni(dni: string): Promise<boolean> {
      const row = await queryOne<any>(
         `SELECT EXISTS (
            SELECT 1 FROM intermediador_laboral WHERE dni=$1
         )`, [dni],
      )
      return row?.exists ?? false
   }

   async save(intermediador: IntermediadorLaboral): Promise<IntermediadorLaboral> {
      const row = await queryOne<any>(
         `INSERT INTO intermediador_laboral
         (id_usuario,nombres,apellidos,dni,entidad_origen,telefono)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
         [intermediador.idUsuario, intermediador.getNombres(), intermediador.getApellidos(),
         intermediador.getDni(), intermediador.getEntidadOrigen(), intermediador.getTelefono()]
      )
      return this.toEntity(row!)
   }

   async update(intermediador: IntermediadorLaboral): Promise<void> {
      await execute(
         `UPDATE intermediador_laboral SET 
            entidad_origen = $1,
            telefono = $2
            WHERE id_intermediador = $3`, 
         [intermediador.getEntidadOrigen(), intermediador.getTelefono(), intermediador.id]
      )
   }
}

export class PostgresAdministradorRepository implements IAdministradorRepository {
   private toEntity(row:any): Administrador {
      return new Administrador({
         id: row.id_administrador,
         idUsuario: row.id_usuario,
         nombres: row.nombres,
         apellidos: row.apellidos,
         nivel: row.nivel
      })
   }
   async findById(id: number): Promise<Administrador | null> {
      const row = await queryOne<any>(
         `SELECT 
            id_administrador, 
            id_usuario, 
            nombres, 
            apellidos, 
            nivel 
            FROM administrador WHERE id_intermediador = $1`, 
            [id],
      )
      return row ? this.toEntity(row) : null 
   }

   async findByIdUsuario(idUsuario: number): Promise<Administrador | null> {
      const row = await queryOne<any>(
         `SELECT 
            id_administrador, 
            id_usuario, 
            nombres, 
            apellidos, 
            nivel 
            FROM administrador WHERE id_usuario = $1`, 
            [idUsuario],
      )
      return row ? this.toEntity(row) : null 
   }

   async save(administrador: Administrador): Promise<Administrador> {
      const row = await queryOne<any>(
         `INSERT INTO intermediador_laboral
         (id_usuario,nombres,apellidos,nivel)
         VALUES ($1,$2,$3,$4) RETURNING *`,
         [administrador.idUsuario, administrador.getNombres(), 
         administrador.getApellidos(), administrador.getNivel()]
      )
      return this.toEntity(row!)
   }
}