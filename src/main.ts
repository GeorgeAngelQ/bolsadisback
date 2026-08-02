import dotenv from 'dotenv'
dotenv.config()

import { createApp } from './infrastructure/app'

const PORT = process.env.PORT

async function bootstrap(): Promise<void> {
  const app = createApp()

  app.listen(PORT, () => {
    console.log(`Portal Inclusivo Backend corriendo en puerto ${PORT}`)
    console.log(`Entorno: ${process.env.NODE_ENV}`)
  })
}

bootstrap().catch(err => {
  console.error('Error al iniciar la aplicación:', err)
  process.exit(1)
})
