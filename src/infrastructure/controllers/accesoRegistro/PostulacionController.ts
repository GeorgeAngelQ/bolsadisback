import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/authMiddleware'
import { Modulo4Container } from '../../../di/modulos3-8.container'

export class BusquedaVacanteController {
  constructor(private readonly c: Modulo4Container) {}

  buscar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.buscarVacantes.execute({
        idCandidato: req.usuario!.idUsuario,
        palabrasClave: req.query.palabrasClave as string | undefined,
        sector: req.query.sector as string | undefined,
        modalidad: req.query.modalidad as any,
        ubicacion: req.query.ubicacion as string | undefined,
        remuneracionMinima: req.query.remuneracionMinima
          ? parseFloat(req.query.remuneracionMinima as string)
          : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      })
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }

  detalle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.obtenerDetalleVacante.execute(
        parseInt(req.params.id),
        req.usuario!.idUsuario,
      )
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }
}

export class PostulacionController {
  constructor(private readonly c: Modulo4Container) {}

  postular = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.postularVacante.execute({
        idCandidato: parseInt(req.params.idCandidato),
        idVacante: parseInt(req.params.idVacante),
        idUsuario: req.usuario!.idUsuario,
        cartaPresentacion: req.body.cartaPresentacion,
      })
      res.status(201).json({ data: result })
    } catch (err) { next(err) }
  }

  listar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.listarPostulaciones.execute(
        parseInt(req.params.idCandidato),
      )
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }

  detalle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.obtenerDetallePostulacion.execute(
        parseInt(req.params.id),
        req.usuario!.idUsuario,
      )
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }

  retirar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.retirarPostulacion.execute(
        parseInt(req.params.id),
        parseInt(req.params.idCandidato),
        req.usuario!.idUsuario,
      )
      res.status(200).json({ mensaje: 'Postulación retirada correctamente' })
    } catch (err) { next(err) }
  }

  calificar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.calificarPostulacion.execute({
        idPostulacion: parseInt(req.params.id),
        idCandidato: parseInt(req.params.idCandidato),
        idUsuario: req.usuario!.idUsuario,
        calificacion: req.body.calificacion,
        comentario: req.body.comentario,
      })
      res.status(200).json({ mensaje: 'Calificación registrada. Gracias por tu opinión.' })
    } catch (err) { next(err) }
  }
}

export class VacanteGuardadaController {
  constructor(private readonly c: Modulo4Container) {}

  guardar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.guardarFavorita.execute(
        parseInt(req.params.idCandidato),
        parseInt(req.params.idVacante),
      )
      res.status(201).json({ mensaje: 'Vacante guardada en favoritos' })
    } catch (err) { next(err) }
  }

  eliminar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.eliminarFavorita.execute(
        parseInt(req.params.idCandidato),
        parseInt(req.params.idVacante),
      )
      res.status(200).json({ mensaje: 'Vacante eliminada de favoritos' })
    } catch (err) { next(err) }
  }
}

export class AlertaEmpleoController {
  constructor(private readonly c: Modulo4Container) {}

  crear = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.crearAlerta.execute({
        idCandidato: parseInt(req.params.idCandidato),
        idUsuario: req.usuario!.idUsuario,
        ...req.body,
      })
      res.status(201).json({ data: result })
    } catch (err) { next(err) }
  }

  editar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.editarAlerta.execute({
        idAlerta: parseInt(req.params.id),
        idCandidato: parseInt(req.params.idCandidato),
        ...req.body,
      })
      res.status(200).json({ mensaje: 'Alerta actualizada correctamente' })
    } catch (err) { next(err) }
  }

  desactivar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.desactivarAlerta.execute(
        parseInt(req.params.id),
        parseInt(req.params.idCandidato),
      )
      res.status(200).json({ mensaje: 'Alerta desactivada' })
    } catch (err) { next(err) }
  }
}

export class RecomendacionVacanteController {
  constructor(private readonly c: Modulo4Container) {}

  listar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.listarRecomendaciones.execute(
        parseInt(req.params.idCandidato),
      )
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }

  crearManual = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.crearRecomendacionManual.execute({
        idCandidato: parseInt(req.params.idCandidato),
        idVacante: parseInt(req.params.idVacante),
        idIntermediador: req.body.idIntermediador,
        idUsuarioIntermediador: req.usuario!.idUsuario,
      })
      res.status(201).json({ mensaje: 'Vacante recomendada al candidato exitosamente' })
    } catch (err) { next(err) }
  }

  descartar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.descartarRecomendacion.execute(
        parseInt(req.params.id),
        parseInt(req.params.idCandidato),
      )
      res.status(200).json({ mensaje: 'Recomendación descartada' })
    } catch (err) { next(err) }
  }
}
