import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { errorHandlerMiddleware } from './middlewares/errorHandlerMiddleware'
import { buildContainer } from '../di/container'
import { apiReference } from '@scalar/express-api-reference'
import { openApiSpec } from '../docs/openapi'
import { registerRoutes } from './routes/index.routes'
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
  registerRoutes(app, container)

  app.use((_req, res) => {
    res.status(404).json({ error: 'NotFound', mensaje: 'Recurso no encontrado' })
  })

  app.use(errorHandlerMiddleware)

  return app
}
