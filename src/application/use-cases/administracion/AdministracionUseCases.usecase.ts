import {
  IContenidoInformativoRepository,
  IConfiguracionAccesibilidadGlobalRepository,
  IEventoAuditoriaRepository,
  IMantenimientoRepository,
  FiltrosAuditoria,
} from '@domain/repositories/administracion/AdministracionRepositories'
import { ITipoDiscapacidadRepository } from '@domain/repositories/gestionPerfil/PerfilRepositories'
import { IAuditLoggerService } from '@application/ports/IAuditLoggerService'
import { INotificationService } from '@application/ports/INotificationService'
import { IAccessibilityCheckerService } from '@application/ports/IAccessibilityCheckerService'
import {
  ContenidoInformativo,
  ConfiguracionAccesibilidadGlobal,
  NivelWCAG,
  TipoContenido,
} from '@domain/entities/administracion/AdministracionEntities.entity'
import { EntityNotFoundError, BusinessRuleViolationError } from '@domain/errors/DomainError'

// ============================================================
// GESTIONAR CONTENIDO INFORMATIVO
// ============================================================

export interface PublicarContenidoInputDto {
  idAdministrador: number
  titulo: string
  cuerpo: string
  tipo: TipoContenido
}

export class PublicarContenidoInformativoUseCase {
  constructor(
    private readonly contenidoRepository: IContenidoInformativoRepository,
    private readonly accessibilityChecker: IAccessibilityCheckerService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: PublicarContenidoInputDto): Promise<{ idContenido: number; advertencias: string[] }> {
    // RN-64: verificar accesibilidad del contenido
    const resultadoAccesibilidad = await this.accessibilityChecker.verificarContenidoHtml(input.cuerpo)

    const contenido = await this.contenidoRepository.save(
      new ContenidoInformativo({
        id: 0,
        idAdministrador: input.idAdministrador,
        titulo: input.titulo,
        cuerpo: input.cuerpo,
        tipo: input.tipo,
        formatoAccesible: resultadoAccesibilidad.esAccesible,
        visible: true,
        fechaPublicacion: new Date(),
      }),
    )

    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: 'contenido_informativo_publicado',
      modulo: 'administracion',
      objetoAfectado: 'ContenidoInformativo',
      idObjetoAfectado: contenido.id,
      resultado: 'exitoso',
    })

    return {
      idContenido: contenido.id,
      advertencias: resultadoAccesibilidad.advertencias,
    }
  }
}

export class EditarContenidoInformativoUseCase {
  constructor(
    private readonly contenidoRepository: IContenidoInformativoRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(
    idContenido: number,
    idAdministrador: number,
    datos: Partial<Pick<PublicarContenidoInputDto, 'titulo' | 'cuerpo' | 'tipo'>>,
  ): Promise<void> {
    const contenido = await this.contenidoRepository.findById(idContenido)
    if (!contenido) throw new EntityNotFoundError('ContenidoInformativo', idContenido)

    contenido.actualizar(datos)
    await this.contenidoRepository.update(contenido)

    await this.auditLogger.log({
      idUsuario: idAdministrador,
      accion: 'contenido_informativo_editado',
      modulo: 'administracion',
      objetoAfectado: 'ContenidoInformativo',
      idObjetoAfectado: idContenido,
      resultado: 'exitoso',
    })
  }
}

export class RetirarContenidoInformativoUseCase {
  constructor(
    private readonly contenidoRepository: IContenidoInformativoRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(idContenido: number, idAdministrador: number): Promise<void> {
    const contenido = await this.contenidoRepository.findById(idContenido)
    if (!contenido) throw new EntityNotFoundError('ContenidoInformativo', idContenido)

    contenido.retirar()
    await this.contenidoRepository.update(contenido)

    await this.auditLogger.log({
      idUsuario: idAdministrador,
      accion: 'contenido_informativo_retirado',
      modulo: 'administracion',
      objetoAfectado: 'ContenidoInformativo',
      idObjetoAfectado: idContenido,
      resultado: 'exitoso',
    })
  }
}

// ============================================================
// GESTIONAR CATEGORÍAS DE DISCAPACIDAD
// ============================================================

export class EliminarTipoDiscapacidadUseCase {
  constructor(
    private readonly tipoDiscapacidadRepository: ITipoDiscapacidadRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(idTipo: number, idAdministrador: number): Promise<void> {
    // RN-61: no eliminar si hay candidatos activos usándola
    const totalUsando = await this.tipoDiscapacidadRepository.countCandidatosActivosByTipo(idTipo)
    if (totalUsando > 0) {
      throw new BusinessRuleViolationError(
        'RN-61',
        `No puedes eliminar esta categoría: ${totalUsando} candidatos activos la utilizan`,
      )
    }

    await this.tipoDiscapacidadRepository.deleteById(idTipo)

    await this.auditLogger.log({
      idUsuario: idAdministrador,
      accion: 'tipo_discapacidad_eliminado',
      modulo: 'administracion',
      objetoAfectado: 'TipoDiscapacidad',
      idObjetoAfectado: idTipo,
      resultado: 'exitoso',
    })
  }
}

// ============================================================
// CONFIGURAR ACCESIBILIDAD GLOBAL
// ============================================================

export interface ActualizarConfigAccesibilidadInputDto {
  idAdministrador: number
  nivelWCAG?: NivelWCAG
  contrastesDisponibles?: string
  tamanosTextoDisponibles?: string
  soporteLSP?: boolean
  subtitulosAutomaticos?: boolean
}

export class ActualizarConfiguracionAccesibilidadGlobalUseCase {
  constructor(
    private readonly configRepository: IConfiguracionAccesibilidadGlobalRepository,
    private readonly notificationService: INotificationService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: ActualizarConfigAccesibilidadInputDto): Promise<void> {
    let config = await this.configRepository.findActual()

    if (config) {
      config.actualizar({
        nivelWCAG: input.nivelWCAG,
        contrastesDisponibles: input.contrastesDisponibles,
        tamanosTextoDisponibles: input.tamanosTextoDisponibles,
        soporteLSP: input.soporteLSP,
        subtitulosAutomaticos: input.subtitulosAutomaticos,
      })
      await this.configRepository.update(config)
    } else {
      config = await this.configRepository.save(
        new ConfiguracionAccesibilidadGlobal({
          id: 0,
          idAdministrador: input.idAdministrador,
          nivelWCAG: input.nivelWCAG ?? 'AA',
          contrastesDisponibles: input.contrastesDisponibles ?? 'normal,alto,oscuro',
          tamanosTextoDisponibles: input.tamanosTextoDisponibles ?? 'pequeno,mediano,grande',
          soporteLSP: input.soporteLSP ?? true,
          subtitulosAutomaticos: input.subtitulosAutomaticos ?? true,
          fechaActualizacion: new Date(),
        }),
      )
    }

    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: 'configuracion_accesibilidad_actualizada',
      modulo: 'administracion',
      objetoAfectado: 'ConfiguracionAccesibilidadGlobal',
      idObjetoAfectado: config.id,
      resultado: 'exitoso',
    })
  }
}

// ============================================================
// MONITOREAR AUDITORÍA
// ============================================================

export class BuscarEventosAuditoriaUseCase {
  constructor(
    private readonly auditoriaRepository: IEventoAuditoriaRepository,
  ) {}

  async execute(filtros: FiltrosAuditoria): Promise<{ eventos: object[]; total: number }> {
    const { eventos, total } = await this.auditoriaRepository.findAll(filtros)
    return {
      eventos: eventos.map(e => ({
        id: e.id,
        idUsuario: e.idUsuario,
        accion: e.accion,
        modulo: e.modulo,
        objetoAfectado: e.objetoAfectado,
        idObjetoAfectado: e.idObjetoAfectado,
        fechaHora: e.fechaHora,
        ipOrigen: e.ipOrigen,
        resultado: e.resultado,
        detalle: e.detalle,
      })),
      total,
    }
  }
}

export class DetectarPatronesAnomaloUseCase {
  constructor(
    private readonly auditoriaRepository: IEventoAuditoriaRepository,
    private readonly notificationService: INotificationService,
  ) {}

  async execute(idAdministrador: number): Promise<{ alertas: { idUsuario: number; descripcion: string }[] }> {
    const intentosFallidos = await this.auditoriaRepository.countIntentosFallidosRecientes(24)
    const cuentasBloqueadas = await this.auditoriaRepository.countCuentasBloqueadasRecientes(24)
    const patrones = await this.auditoriaRepository.detectarPatronesAnomalos()

    if (patrones.length > 0) {
      await this.notificationService.notificar(
        idAdministrador,
        'Actividad sospechosa detectada',
        `Se detectaron ${patrones.length} patrones de comportamiento irregular.`,
      )
    }

    return { alertas: patrones }
  }
}

export class ExportarRegistroAuditoriaUseCase {
  constructor(
    private readonly auditoriaRepository: IEventoAuditoriaRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(filtros: FiltrosAuditoria, idAdministrador: number): Promise<object[]> {
    const eventos = await this.auditoriaRepository.exportar(filtros)

    await this.auditLogger.log({
      idUsuario: idAdministrador,
      accion: 'auditoria_exportada',
      modulo: 'administracion',
      resultado: 'exitoso',
      detalle: JSON.stringify(filtros),
    })

    return eventos.map(e => ({
      id: e.id,
      idUsuario: e.idUsuario,
      accion: e.accion,
      modulo: e.modulo,
      fechaHora: e.fechaHora,
      resultado: e.resultado,
    }))
  }
}

// ============================================================
// GESTIONAR MANTENIMIENTO
// ============================================================

export interface ProgramarMantenimientoInputDto {
  idAdministrador: number
  fechaInicio: string
  duracionEstimadaMinutos: number
  motivo: string
}

const HORAS_MINIMAS_ANTICIPACION = 24

export class ProgramarMantenimientoUseCase {
  constructor(
    private readonly mantenimientoRepository: IMantenimientoRepository,
    private readonly notificationService: INotificationService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: ProgramarMantenimientoInputDto): Promise<void> {
    const fechaInicio = new Date(input.fechaInicio)
    const ahora = new Date()
    const horasDiferencia = (fechaInicio.getTime() - ahora.getTime()) / (1000 * 60 * 60)

    if (horasDiferencia < HORAS_MINIMAS_ANTICIPACION) {
      throw new BusinessRuleViolationError(
        'RN-63',
        `El mantenimiento debe programarse con al menos ${HORAS_MINIMAS_ANTICIPACION} horas de anticipación`,
      )
    }

    const mantenimiento = await this.mantenimientoRepository.save({
      fechaInicio,
      duracionEstimada: input.duracionEstimadaMinutos,
      motivo: input.motivo,
    })

    // Notificar a todos los usuarios
    await this.notificationService.notificarMasivo(
      [],  
      'Mantenimiento programado',
      `El portal estará en mantenimiento el ${fechaInicio.toISOString()} por aproximadamente ${input.duracionEstimadaMinutos} minutos.`,
    )

    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: 'mantenimiento_programado',
      modulo: 'administracion',
      resultado: 'exitoso',
      detalle: input.motivo,
    })
  }
}

export class FinalizarMantenimientoUseCase {
  constructor(
    private readonly mantenimientoRepository: IMantenimientoRepository,
    private readonly notificationService: INotificationService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(idAdministrador: number): Promise<void> {
    const mantenimiento = await this.mantenimientoRepository.findProgramado()
    if (!mantenimiento) throw new EntityNotFoundError('Mantenimiento', 0)

    await this.mantenimientoRepository.update(mantenimiento.id, { estado: 'concluido' })

    await this.notificationService.notificarMasivo(
      [],
      'Portal disponible',
      'El mantenimiento ha concluido. El portal está disponible nuevamente.',
    )

    await this.auditLogger.log({
      idUsuario: idAdministrador,
      accion: 'mantenimiento_finalizado',
      modulo: 'administracion',
      resultado: 'exitoso',
    })
  }
}
