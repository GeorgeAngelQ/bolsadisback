import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../middlewares/authMiddleware'
import { Modulo8Container } from '@di/reporte.container'

export class ReporteCuotaController {
  constructor(private readonly c: Modulo8Container) {}

  generar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.generarReporteCuota.execute({
        idEmpresa: Number(req.params.idEmpresa),
        idUsuario: req.usuario!.idUsuario,
        periodo: req.body.periodo,
      })
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }
}

export class ReporteGestionController {
  constructor(private readonly c: Modulo8Container) {}

  generar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.generarReporteGestion.execute({
        idIntermediador: Number(req.params.idIntermediador),
        idUsuario: req.usuario!.idUsuario,
        periodo: req.body.periodo,
      })
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }
}

export class ReporteGlobalController {
  constructor(private readonly c: Modulo8Container) {}

  generar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.generarReporteGlobal.execute({
        idAdministrador: req.usuario!.idUsuario,
        periodo: req.body.periodo,
        filtros: {
          idsTiposDiscapacidad: req.body.idsTiposDiscapacidad,
          sector: req.body.sector,
          distrito: req.body.distrito,
        },
      })
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }

  comparar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.c.compararPeriodos.execute(
        req.query.periodoActual as string,
        req.query.periodoAnterior as string,
      )
      res.status(200).json({ data: result })
    } catch (err) { next(err) }
  }
}

export class DashboardController {
  constructor(private readonly c: Modulo8Container) {}

  obtener = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dashboard = await this.c.obtenerDashboard.execute(req.usuario!.idUsuario)
      res.status(200).json({
        data: {
          fechaUltimaActualizacion: dashboard.getFechaUltimaActualizacion(),
          totalUsuariosActivos: dashboard.getTotalUsuariosActivos(),
          totalVacantesActivas: dashboard.getTotalVacantesActivas(),
          totalPostulacionesMes: dashboard.getTotalPostulacionesMes(),
          totalContratacionesMes: dashboard.getTotalContratacionesMes(),
          tasaIntermediacion: dashboard.getTasaIntermediacion(),
        },
      })
    } catch (err) { next(err) }
  }
}

export class ExportacionController {
  constructor(private readonly c: Modulo8Container) {}

  exportarPDF = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const url = await this.c.exportarPDF.execute({
        idReporte: Number(req.params.id),
        tipoReporte: req.params.tipo as any,
        idUsuario: req.usuario!.idUsuario,
      })
      res.status(200).json({ data: { urlDescarga: url } })
    } catch (err) { next(err) }
  }

  exportarExcel = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const url = await this.c.exportarExcel.execute({
        idReporte: Number(req.params.id),
        tipoReporte: req.params.tipo as any,
        idUsuario: req.usuario!.idUsuario,
      })
      res.status(200).json({ data: { urlDescarga: url } })
    } catch (err) { next(err) }
  }

  exportarConsolidado = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const url = await this.c.exportarConsolidado.execute(
        req.usuario!.idUsuario,
        req.query.periodo as string,
      )
      res.status(200).json({ data: { urlDescarga: url } })
    } catch (err) { next(err) }
  }
}