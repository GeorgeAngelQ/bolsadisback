import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../middlewares/authMiddleware'
import { Modulo2Container } from '@di/gestionPerfil.container'

export class PerfilCandidatoController {
  constructor(private readonly c: Modulo2Container) {}

  crear = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.crearPerfilCandidato.execute({
        idCandidato: req.params.idCandidato,
        idUsuario: req.usuario!.idUsuario,
        ...req.body,
      })
      res.status(201).json({ data: result })
    } catch (err) { next(err) }
  }

  editar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.editarPerfilCandidato.execute({
        idCandidato: req.params.idCandidato,
        idUsuario: req.usuario!.idUsuario,
        ...req.body,
      })
      res.status(200).json({ mensaje: 'Perfil actualizado correctamente' })
    } catch (err) { next(err) }
  }

  actualizarHabilidades = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.actualizarHabilidades.execute({
        idCandidato: Number(req.params.idCandidato),
        idUsuario: req.usuario!.idUsuario,
        habilidades: req.body.habilidades,
      })
      res.status(200).json({ mensaje: 'Habilidades actualizadas' })
    } catch (err) { next(err) }
  }

  actualizarExperiencias = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.actualizarExperiencias.execute({
        idCandidato: Number(req.params.idCandidato),
        experiencias: req.body.experiencias,
      })
      res.status(200).json({ mensaje: 'Experiencias actualizadas' })
    } catch (err) { next(err) }
  }

  actualizarFormaciones = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.actualizarFormaciones.execute({
        idCandidato: Number(req.params.idCandidato),
        formaciones: req.body.formaciones,
      })
      res.status(200).json({ mensaje: 'Formaciones actualizadas' })
    } catch (err) { next(err) }
  }
}

export class CurriculumVitaeController {
  constructor(private readonly c: Modulo2Container) {}

  subir = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Archivo requerido' })
        return
      }
      const result = await this.c.subirCV.execute({
        idCandidato: Number(req.params.idCandidato),
        idUsuario: req.usuario!.idUsuario,
        fileBuffer: req.file.buffer,
        nombreArchivo: req.file.originalname,
        mimeType: req.file.mimetype,
        formato: req.body.formato,
        tamanoBytes: req.file.size,
      })
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }

  generar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.generarCV.execute(
        Number(req.params.idCandidato),
        req.usuario!.idUsuario,
      )
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }

  descargar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const url = await this.c.descargarCV.execute(Number(req.params.idCandidato))
      res.status(200).json({ data: { urlDescarga: url } })
    } catch (err) { next(err) }
  }
}

export class CertificadoController {
  constructor(private readonly c: Modulo2Container) {}

  registrar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.registrarCertificado.execute({
        idCandidato: Number(req.params.idCandidato),
        idUsuario: req.usuario!.idUsuario,
        ...req.body,
        fileBuffer: req.file?.buffer,
        nombreArchivo: req.file?.originalname,
        mimeType: req.file?.mimetype,
      })
      res.status(201).json({ data: result })
    } catch (err) { next(err) }
  }

  verificar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.verificarCertificado.execute(
        Number(req.params.idPerfil),
        req.usuario!.idUsuario,
      )
      res.status(200).json({ mensaje: 'Certificado verificado correctamente' })
    } catch (err) { next(err) }
  }
}

export class PerfilEmpresaController {
  constructor(private readonly c: Modulo2Container) {}

  crear = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.crearPerfilEmpresa.execute({
        idEmpresa: Number(req.params.idEmpresa),
        idUsuario: req.usuario!.idUsuario,
        ...req.body,
      })
      res.status(201).json({ data: result })
    } catch (err) { next(err) }
  }

  editar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.editarPerfilEmpresa.execute({
        idEmpresa: Number(req.params.idEmpresa),
        idUsuario: req.usuario!.idUsuario,
        ...req.body,
      })
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }
}
