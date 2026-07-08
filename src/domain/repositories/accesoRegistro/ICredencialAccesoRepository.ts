import { CredencialAcceso } from '../../entities/accesoRegistro/CredencialAcceso.entity'

export interface ICredencialAccesoRepository {
  findByIdUsuario(idUsuario: number): Promise<CredencialAcceso | null>
  findByToken(token: string): Promise<CredencialAcceso | null>
  save(credencial: CredencialAcceso): Promise<CredencialAcceso>
  update(credencial: CredencialAcceso): Promise<void>
}
