import { Request, Response, NextFunction } from 'express'
import { AuthRequest } from '../../middlewares/authMiddleware'
import { Modulo1Container } from '../../../di/accesoRegistro.container'

export class AuthController {
  constructor(private readonly c: Modulo1Container) {}

  registrarCandidato = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.registrarCandidato.execute(req.body)
      res.status(201).json({ data: result, mensaje: 'Candidato registrado exitosamente' })
    } catch (err) { next(err) }
  }

  registrarEmpresa = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.registrarEmpresa.execute(req.body)
      res.status(201).json({ data: result, mensaje: 'Empresa registrada exitosamente' })
    } catch (err) { next(err) }
  }

  iniciarSesion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.iniciarSesion.execute({
        ...req.body,
        ipOrigen: req.ip,
      })
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }

  solicitarRecuperacion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.solicitarRecuperacion.execute({ correo: req.body.correo, ipOrigen: req.ip })
      res.status(200).json({ mensaje: 'Si el correo existe, recibirás instrucciones de recuperación' })
    } catch (err) { next(err) }
  }

  validarToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.validarToken.execute({ token: req.params.token as string})
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }

  actualizarContrasena = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.actualizarContrasena.execute(req.body)
      res.status(200).json({ mensaje: 'Contraseña actualizada correctamente' })
    } catch (err) { next(err) }
  }
}

export class AccesibilidadController {
  constructor(private readonly c: Modulo1Container) {}

  obtener = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.obtenerPreferencias.execute(req.usuario!.idUsuario)
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }

  guardar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.guardarPreferencias.execute({ idUsuario: req.usuario!.idUsuario, ...req.body })
      res.status(200).json({ mensaje: 'Preferencias actualizadas correctamente' })
    } catch (err) { next(err) }
  }

  restablecer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.restablecerPreferencias.execute(req.usuario!.idUsuario)
      res.status(200).json({ mensaje: 'Preferencias restablecidas a valores por defecto' })
    } catch (err) { next(err) }
  }
}

export class GestionCuentasController {
  constructor(private readonly c: Modulo1Container) {}

  crearIntermediador = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.crearIntermediador.execute({
        idAdministrador: req.usuario!.idUsuario,
        ...req.body,
      })
      res.status(201).json({ data: result })
    } catch (err) { next(err) }
  }

  suspender = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.suspenderCuenta.execute({
        idAdministrador: req.usuario!.idUsuario,
        idUsuario: parseInt(req.params.id as string),
        motivo: req.body.motivo,
      })
      res.status(200).json({ mensaje: 'Cuenta suspendida correctamente' })
    } catch (err) { next(err) }
  }

  reactivar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.reactivarCuenta.execute({
        idAdministrador: req.usuario!.idUsuario,
        idUsuario: parseInt(req.params.id as string),
      })
      res.status(200).json({ mensaje: 'Cuenta reactivada correctamente' })
    } catch (err) { next(err) }
  }

  eliminar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.c.eliminarCuenta.execute({
        idAdministrador: req.usuario!.idUsuario,
        idUsuario: parseInt(req.params.id as string),
        motivo: req.body.motivo,
      })
      res.status(200).json({ mensaje: 'Cuenta eliminada correctamente' })
    } catch (err) { next(err) }
  }
}

export class RolController {
  constructor(private readonly c: Modulo1Container) {}

  listar = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.listarRoles.execute()
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }

  crear = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.crearRol.execute({
        idAdministrador: req.usuario!.idUsuario,
        ...req.body,
      })
      res.status(201).json({ data: result })
    } catch (err) { next(err) }
  }

  asignarPermisos = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.asignarPermisos.execute({
        idAdministrador: req.usuario!.idUsuario,
        idRol: parseInt(req.params.id as string),
        permisoIds: req.body.permisoIds,
      })
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }
}
