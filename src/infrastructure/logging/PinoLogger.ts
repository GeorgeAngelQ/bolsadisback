import pino from 'pino'
import { ILogger, LogContext } from '@application/ports/ILogger'

export class PinoLogger implements ILogger {
  private readonly logger: pino.Logger

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL ?? 'info',
      serializers: {
        err: pino.stdSerializers.err
      }
    })
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(context ?? {}, message)
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(context ?? {}, message)
  }
  error(message: string, context?: LogContext): void {
    this.logger.error(context ?? {}, message)
  }
  debug(message: string, context?: LogContext): void {
    this.logger.debug(context ?? {}, message)
  }
}