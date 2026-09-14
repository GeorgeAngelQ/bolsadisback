import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../middlewares/authMiddleware'
import { Modulo7Container } from '@di/administracion.container'

export class ContenidoInformativoController {
  constructor(private readonly c: Modulo7Container) {}

  publicar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.publicarContenido.execute({
        idAdministrador: req.usuario!.idUsuario,
        titulo: req.body.titulo,
        cuerpo: req.body.cuerpo,
        tipo: req.body.tipo,
      })
      res.status(201).json({ data: result })
    } catch (err) { next(err) }
  }

  editar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.editarContenido.execute(
        Number(req.params.id),
        req.usuario!.idUsuario,
        req.body,
      )
      res.status(200).json({ mensaje: 'Contenido actualizado correctamente' })
    } catch (err) { next(err) }
  }

  retirar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.retirarContenido.execute(
        Number(req.params.id),
        req.usuario!.idUsuario,
      )
      res.status(200).json({ mensaje: 'Contenido retirado de la vista pública' })
    } catch (err) { next(err) }
  }
}

export class CategoriaController {
  constructor(private readonly c: Modulo7Container) {}

  eliminarTipoDiscapacidad = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.eliminarTipoDiscapacidad.execute(
        Number(req.params.id),
        req.usuario!.idUsuario,
      )
      res.status(200).json({ mensaje: 'Categoría eliminada correctamente' })
    } catch (err) { next(err) }
  }
}

export class ConfiguracionAccesibilidadController {
  constructor(private readonly c: Modulo7Container) {}

  actualizar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.actualizarConfigAccesibilidad.execute({
        idAdministrador: req.usuario!.idUsuario,
        ...req.body,
      })
      res.status(200).json({ mensaje: 'Configuración de accesibilidad global actualizada' })
    } catch (err) { next(err) }
  }
}

export class AuditoriaController {
  constructor(private readonly c: Modulo7Container) {}

  buscar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.buscarEventosAuditoria.execute({
        idUsuario: req.query.idUsuario ? Number(req.query.idUsuario as string) : undefined,
        modulo: req.query.modulo as string | undefined,
        accion: req.query.accion as string | undefined,
        fechaDesde: req.query.fechaDesde ? new Date(req.query.fechaDesde as string) : undefined,
        fechaHasta: req.query.fechaHasta ? new Date(req.query.fechaHasta as string) : undefined,
        resultado: req.query.resultado as 'exitoso' | 'fallido' | undefined,
        page: req.query.page ? Number(req.query.page as string) : 1,
        limit: req.query.limit ? Number(req.query.limit as string) : 50,
      })
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }

  detectarPatrones = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.detectarPatrones.execute(req.usuario!.idUsuario)
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }

  exportar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.exportarAuditoria.execute(
        {
          idUsuario: req.query.idUsuario ? Number(req.query.idUsuario as string) : undefined,
          modulo: req.query.modulo as string | undefined,
          fechaDesde: req.query.fechaDesde ? new Date(req.query.fechaDesde as string) : undefined,
          fechaHasta: req.query.fechaHasta ? new Date(req.query.fechaHasta as string) : undefined,
        },
        req.usuario!.idUsuario,
      )
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }
}
// Implementar a futuro
// export class MantenimientoController {
//   constructor(private readonly c: Modulo7Container) {}

//   programar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       await this.c.programarMantenimiento.execute({
//         idAdministrador: req.usuario!.idUsuario,
//         fechaInicio: req.body.fechaInicio,
//         duracionEstimadaMinutos: req.body.duracionEstimadaMinutos,
//         motivo: req.body.motivo,
//       })
//       res.status(201).json({ mensaje: 'Mantenimiento programado. Usuarios notificados.' })
//     } catch (err) { next(err) }
//   }

//   finalizar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       await this.c.finalizarMantenimiento.execute(req.usuario!.idUsuario)
//       res.status(200).json({ mensaje: 'Mantenimiento finalizado. Portal restaurado.' })
//     } catch (err) { next(err) }
//   }
// }