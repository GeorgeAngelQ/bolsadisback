import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../middlewares/authMiddleware'
import { Modulo5Container } from '@di/intermediacion.container'


export class IntermediacionLaboralController {
  constructor(private readonly c: Modulo5Container) {}

   asignar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
         await this.c.asignarCandidato.execute(
            Number(req.params.idIntermediador),
            Number(req.params.idCandidato),
            req.usuario!.idUsuario
         )
         res.status(201).json({ mensaje: 'Candidato asignado correctamente'})
      } catch (err) { next(err) }
   }
}

export class ObservacionCandidatoController {
   constructor(private readonly c: Modulo5Container) {}

   registrar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
         const result = await this.c.registrarObservacion.execute({
            idIntermediador: Number(req.params.idIntermediador),
            idCandidato: Number(req.params.idCandidato),
            idUsuario: req.usuario!.idUsuario,
            contenido: req.body.contenido,
            tipo: req.body.tipo
         })
      } catch (err) { next(err) }
   }
}

export class SeguimientoPostulacionController {
   constructor(private readonly c:Modulo5Container) {}

   iniciar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
      try{
         const result = await this.c.iniciarSeguimiento.execute(
            Number(req.params.idPostulacion),
            Number(req.params.idIntermediador),
            Number(req.params.idCandidato)
         )
         res.status(result.esNuevo ? 201 : 200).json({ data:result })
      } catch (err) { next(err) }
   }
   actualizaNotas = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
         await this.c.actualizarNotas.execute(
            Number(req.params.id),
            Number(req.params.idIntermediador),
            req.body.notas
         )
      } catch (err) { next(err) }
   }
   registrarResultado = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
         await this.c.registrarResultado.execute({
            idSeguimiento: Number(req.params.id),
            idIntermediador: Number(req.params.idIntermediador),
            idUsuario: req.usuario!.idUsuario,
            resultado: req.body.resultado,
            idPostulacion: req.body.idPostulacion,
            idUsuarioCandidato: req.body.idUsuarioCandidato
         })
         res.status(201).json({ mensaje: 'Resultado registrado correctamente'})
      } catch (err) { next(err) }
   }
}

export class CoordinacionEntrevistaController {
   constructor(private readonly c:Modulo5Container) {}
   programar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
         const result = await this.c.programarEntrevista.execute({
            idPostulacion: Number(req.params.idPostulacion),
            idUsuario: req.usuario!.idUsuario,
            fechaEntrevista: req.body.fechaEntrevista,
            modalidad: req.body.modalidad,
            lugar: req.body.lugar,
            urlReunion: req.body.urlReunion,
            ajustesNecesarios: req.body.ajustesNecesarios,
            idUsuarioCandidato: req.body.idUsuarioCandidato,
            idUsuarioIntermediador: req.body.idUsuarioIntermediador
         })
         res.status(201).json({ data: result })
      } catch (err) { next(err) }
   }
}

export class DerivacionServicioController {
   constructor(private readonly c:Modulo5Container) {}

   registrar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
         const result = await this.c.registrarDerivacion.execute({
            idSeguimiento: Number(req.params.idSeguimiento),
            idCandidato: Number(req.params.idCandidato),
            idIntermediador: Number(req.params.idIntermediador),
            idUsuario: req.usuario!.idUsuario,
            tipoServicio: req.body.tipoServicio,
            entidadDestino: req.body.entidadDestino,
            motivo: req.body.motivo,
            idUsuarioCandidato: req.body.idUsuarioCandidato
         })
         res.status(201).json({ data: result })
      } catch (err) { next(err) }
   }
   actualizarEstado = async (req:AuthRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
         await this.c.actualizarDerivacion.execute(
            Number(req.params.id),
            req.body.nuevoEstado,
            Number(req.params.idIntermediador),
            req.body.idUsuarioCandidato
         )
      } catch (err) { next(err) }
   }
}