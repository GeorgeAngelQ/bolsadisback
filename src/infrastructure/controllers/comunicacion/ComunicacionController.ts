import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../middlewares/authMiddleware'
import { Modulo6Container } from '@di/comunicacion.container'

export class ConversacionController {
  constructor(private readonly c: Modulo6Container) {}

  iniciar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.iniciarConversacion.execute({
        idPostulacion: Number(req.body.idPostulacion),
        idUsuarioEmisor: req.usuario!.idUsuario,
        tipoEmisor: req.body.tipoEmisor,
        idUsuarioReceptor: Number(req.body.idUsuarioReceptor),
      })
      res.status(result.esNueva ? 201 : 200).json({ data: result })
    } catch (err) { next(err) }
  }

  historial = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.obtenerHistorial.execute(
        Number(req.params.id),
        req.usuario!.idUsuario,
      )
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }
}

export class MensajeController {
  constructor(private readonly c: Modulo6Container) {}

  enviar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.enviarMensaje.execute({
        idConversacion: Number(req.params.idConversacion),
        idEmisor: req.usuario!.idUsuario,
        contenido: req.body.contenido,
        idDestinatario: Number(req.body.idDestinatario),
      })
      res.status(201).json({ data: result })
    } catch (err) { next(err) }
  }

  enviarMasivo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.enviarMasivo.execute({
        idEmpresa: Number(req.params.idEmpresa),
        idUsuarioEmpresa: req.usuario!.idUsuario,
        idsCandidatos: req.body.idsCandidatos,
        contenido: req.body.contenido,
      })
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }

  marcarLeidos = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.marcarLeidos.execute(
        Number(req.params.idConversacion),
        req.usuario!.idUsuario,
      )
      res.status(200).json({ mensaje: 'Mensajes marcados como leídos' })
    } catch (err) { next(err) }
  }
}

export class PlantillaNotificacionController {
  constructor(private readonly c: Modulo6Container) {}

  crear = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.crearPlantilla.execute({
        idAdministrador: req.usuario!.idUsuario,
        ...req.body,
      })
      res.status(201).json({ data: result })
    } catch (err) { next(err) }
  }

  editar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.editarPlantilla.execute({
        idPlantilla: Number(req.params.id),
        idAdministrador: req.usuario!.idUsuario,
        ...req.body,
      })
      res.status(200).json({ mensaje: 'Plantilla actualizada' })
    } catch (err) { next(err) }
  }

  desactivar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.desactivarPlantilla.execute(
        Number(req.params.id),
        req.usuario!.idUsuario,
      )
      res.status(200).json({ mensaje: 'Plantilla desactivada' })
    } catch (err) { next(err) }
  }
}