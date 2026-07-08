import { 
  ContenidoInformativo, 
  ConfiguracionAccesibilidadGlobal, 
  EventoAuditoria 
} from '../../entities/administracion/AdministracionEntities.entity';

export interface FiltrosAuditoria {
  idUsuario?: number
  modulo?: string
  accion?: string
  fechaDesde?: Date
  fechaHasta?: Date
  resultado?: 'exitoso' | 'fallido'
  page?: number
  limit?: number
}

export interface IContenidoInformativoRepository {
  findById(id: number): Promise<ContenidoInformativo | null>
  findAll(soloVisibles?: boolean): Promise<ContenidoInformativo[]>
  save(contenido: ContenidoInformativo): Promise<ContenidoInformativo>
  update(contenido: ContenidoInformativo): Promise<void>
}

export interface IConfiguracionAccesibilidadGlobalRepository {
  findActual(): Promise<ConfiguracionAccesibilidadGlobal | null>
  save(config: ConfiguracionAccesibilidadGlobal): Promise<ConfiguracionAccesibilidadGlobal>
  update(config: ConfiguracionAccesibilidadGlobal): Promise<void>
}

export interface IEventoAuditoriaRepository {
  findAll(filtros: FiltrosAuditoria): Promise<{ eventos: EventoAuditoria[]; total: number }>
  findByIdUsuario(idUsuario: number): Promise<EventoAuditoria[]>
  save(evento: EventoAuditoria): Promise<EventoAuditoria>
  countIntentosFallidosRecientes(horas: number): Promise<number>
  countCuentasBloqueadasRecientes(horas: number): Promise<number>
  detectarPatronesAnomalos(): Promise<{ idUsuario: number; descripcion: string }[]>
  exportar(filtros: FiltrosAuditoria): Promise<EventoAuditoria[]>
}

export interface IMantenimientoRepository {
  findProgramado(): Promise<{ id: number; fechaInicio: Date; duracion: number; estado: string } | null>
  save(datos: { fechaInicio: Date; duracionEstimada: number; motivo: string }): Promise<{ id: number }>
  update(id: number, datos: Partial<{ duracionEstimada: number; estado: string }>): Promise<void>
}
