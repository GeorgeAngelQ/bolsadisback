import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { errorHandlerMiddleware } from './middlewares/errorHandlerMiddleware'
import { createAuthRoutes } from './routes/auth.routes'
import { AccesibilidadController, AuthController, GestionCuentasController, RolController } from './controllers/accesoRegistro/AuthController'
import { buildContainer } from '../di/container'
import { apiReference } from '@scalar/express-api-reference'
import { openApiSpec } from '../docs/openapi'
export function createApp(): Application {
  const app = express()

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
)
  app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))

  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,   
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes. Intenta nuevamente en 15 minutos.' },
  }))

  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))

  app.get('/openapi.json', (_req, res) => {
    res.json(openApiSpec)
  })
  app.use('/docs', apiReference({
    spec: {
      url: '/openapi.json'
    },
    authentication: {
      preferredSecurityScheme: 'bearerAuth',
    },
    persistAuth: true,
  }),

  )
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toString() })
  })

  
  const container = buildContainer()
  const { m1 } = container

  const authController = new AuthController(m1)
  const accesibilidadController = new AccesibilidadController(m1)
  const cuentasController = new GestionCuentasController(m1)
  const rolController = new RolController(m1)

  const authRoutes = createAuthRoutes(
    authController,
    accesibilidadController,
    cuentasController,
    rolController
  )
  app.use('/api/v1/auth', authRoutes)
  // app.use('/api/v1/perfil', perfilRoutes)

  app.use(errorHandlerMiddleware)

  return app
}
