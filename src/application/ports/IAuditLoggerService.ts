export interface AuditEvent {
  idUsuario: number
  accion: string
  modulo: string
  objetoAfectado?: string
  idObjetoAfectado?: number
  ipOrigen?: string
  resultado: 'exitoso' | 'fallido'
  detalle?: string
}

export interface IAuditLoggerService {
  log(event: AuditEvent): Promise<void>
}
