import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../middlewares/authMiddleware'
import { Modulo3Container } from '@di/gestionVacante.container'

export class VacanteController {
  constructor(private readonly c: Modulo3Container) {}

  publicar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.publicarVacante.execute({
        idEmpresa: Number(req.params.idEmpresa),
        idUsuario: req.usuario!.idUsuario,
        ...req.body,
      })
      res.status(201).json({ data: result })
    } catch (err) { next(err) }
  }

  editar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.editarVacante.execute({
        idVacante: Number(req.params.id),
        idEmpresa: Number(req.params.idEmpresa),
        idUsuario: req.usuario!.idUsuario,
        ...req.body,
      })
      res.status(200).json({ mensaje: 'Vacante actualizada y enviada a revisión' })
    } catch (err) { next(err) }
  }

  cerrar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.cerrarVacante.execute({
        idVacante: Number(req.params.id),
        idEmpresa: Number(req.params.idEmpresa),
        idUsuario: req.usuario!.idUsuario,
      })
      res.status(200).json({ mensaje: 'Vacante cerrada correctamente' })
    } catch (err) { next(err) }
  }

  verificarAjustes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.verificarAjustes.execute({
        idVacante: Number(req.params.id),
        idCandidato: Number(req.body.idCandidato),
        idIntermediador: Number(req.body.idIntermediador),
        idUsuarioIntermediador: req.usuario!.idUsuario,
        idsAjustesVerificados: req.body.idsAjustesVerificados,
        idUsuarioEmpresa: req.body.idUsuarioEmpresa,
      })
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }
}

export class AprobacionVacanteController {
  constructor(private readonly c: Modulo3Container) {}

  listarPendientes = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.listarPendientes.execute()
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }

  aprobar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.aprobarVacante.execute({
        idVacante: Number(req.params.id),
        idAdministrador: req.usuario!.idUsuario,
        idUsuarioEmpresa: req.body.idUsuarioEmpresa,
      })
      res.status(200).json({ mensaje: 'Vacante aprobada y publicada' })
    } catch (err) { next(err) }
  }

  rechazar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.rechazarVacante.execute({
        idVacante: Number(req.params.id),
        idAdministrador: req.usuario!.idUsuario,
        idUsuarioEmpresa: req.body.idUsuarioEmpresa,
        motivoRechazo: req.body.motivoRechazo,
      })
      res.status(200).json({ mensaje: 'Vacante rechazada. Empresa notificada.' })
    } catch (err) { next(err) }
  }
}

export class ReporteContenidoController {
  constructor(private readonly c: Modulo3Container) {}

  registrar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.registrarReporte.execute({
        idUsuario: req.usuario!.idUsuario,
        idContenido: Number(req.params.idContenido),
        tipoContenido: req.params.tipo as 'vacante' | 'empresa',
        motivo: req.body.motivo,
        descripcion: req.body.descripcion,
      })
      res.status(201).json({ data: result, mensaje: 'Reporte enviado. Será revisado en 72 horas' })
    } catch (err) { next(err) }
  }

  desestimar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.desestimarReporte.execute({
        idReporte: Number(req.params.id),
        idAdministrador: req.usuario!.idUsuario,
      })
      res.status(200).json({ mensaje: 'Reporte desestimado' })
    } catch (err) { next(err) }
  }

  retirarContenido = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.retirarContenido.execute({
        idReporte: Number(req.params.id),
        idContenido: Number(req.body.idContenido),
        tipoContenido: req.body.tipoContenido,
        idAdministrador: req.usuario!.idUsuario,
        idUsuarioPropietario: Number(req.body.idUsuarioPropietario),
      })
      res.status(200).json({ mensaje: 'Contenido retirado y propietario notificado' })
    } catch (err) { next(err) }
  }
}

export class SancionEmpresaController {
  constructor(private readonly c: Modulo3Container) {}

  registrar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.registrarSancion.execute({
        idEmpresa: Number(req.params.idEmpresa),
        idAdministrador: req.usuario!.idUsuario,
        motivo: req.body.motivo,
        normativaInfringida: req.body.normativaInfringida,
      })
      res.status(201).json({ mensaje: 'Sanción registrada correctamente' })
    } catch (err) { next(err) }
  }

  levantar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.levantarSancion.execute({
        idSancion: Number(req.params.id),
        idAdministrador: req.usuario!.idUsuario,
      })
      res.status(200).json({ mensaje: 'Sanción levantada correctamente' })
    } catch (err) { next(err) }
  }
}
