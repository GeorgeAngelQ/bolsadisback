import dotenv from 'dotenv'
dotenv.config()

import { buildContainer } from '@di/container'
import { createApp } from '@infrastructure/app'
import { closePool } from '@infrastructure/persistence/postgres/connection/PostgresConnection'

const PORT = process.env.PORT

async function bootstrap(): Promise<void> {
  const container = buildContainer()
  const app = createApp(container)

  const server = app.listen(PORT, () => {
    console.log(`Portal Inclusivo Backend corriendo en puerto ${PORT}`)
    console.log(`Entorno: ${process.env.NODE_ENV}`)
  })

  const shutdown = (signal: string) => {
    console.log(`${signal} recibido, cerrando`)
    server.close(async () => {
      await closePool()
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10_000).unref()
  }
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

bootstrap().catch(err => {
  console.error('Error al iniciar la aplicación:', err)
  process.exit(1)
})
