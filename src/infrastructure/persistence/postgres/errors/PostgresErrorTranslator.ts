import { DuplicateEntityError } from "@domain/errors/DomainError"
import { AppError } from "@shared/errors/AppError"
import { ErrorType } from "@shared/errors/ErrorType"
import { DatabaseError } from "pg"

const UNIQUE_CONSTRAINTS: Record<string, {entity: string, field: string}> = {
  usuario_correo_key: {
    entity: 'usuario',
    field: 'correo electrónico'
  },
  empresa_empleadora_ruc_key: {
    entity: 'empresa_empleadora',
    field: 'RUC'
  },
  candidato_dni_key: {
    entity: 'Candidato',
    field: 'DNI'
  },
  intermediador_laboral_dni_key: {
    entity: 'intermediador_laboral',
    field: 'DNI'
  },
}
const NODE_CONNECTION_CODES = new Set([
  'ECONNREFUSED', 
  'ECONNRESET', 
  'ETIMEDOUT', 
  'ENOTFOUND', 
  'EAI_AGAIN'
])

export function translatePgError(err: unknown): unknown {
  if (err instanceof DatabaseError) return fromDatabaseError(err)
  if (isConnectionError(err)) {
    return new AppError(ErrorType.SERVICE_UNAVAILABLE, 'Base de Datos no disponible')
  }
  return err;
}

function fromDatabaseError(e: DatabaseError): AppError {
  const context = {
    sqlstate: e.code,
    constraint: e.constraint,
    table: e.table,
    column: e.column
  }

  const code = e.code ?? ''

  // Verificar en https://www.postgresql.org/docs/current/errcodes-appendix.html
  
  // No cumple los UNIQUE
  if (code === '23505') {
    const known = e.constraint ? UNIQUE_CONSTRAINTS[e.constraint] : undefined
    return known ? 
    new DuplicateEntityError(
      known.entity, 
      known.field, 
      { 
        context, 
        cause: e 
      }) :
    new AppError(
      ErrorType.DUPLICATE, 
      'Ya existe un registro con esos datos únicos', 
      {
        context,
        cause: e
      })
  }

  // No cumple FK
  if (code === '23503') {
    return new AppError(
      ErrorType.BUSINESS_RULE,
      'La operación no es posible: la referencia es inexistente o el registro tiene otros registros relacionados',
      {
        context,
        cause: e
      }
    )
  }

  // No cumple CHECK
  if (code === '23514') {
    return new AppError(
      ErrorType.BUSINESS_RULE,
      'Los datos no cumplen una regla de validación',
      {
        context,
        cause: e
      }
    )
  }
  // Valor obligatorio fue nulo
  if (code === '23502') {
    return new AppError(
      ErrorType.VALIDATION,
      'Falta un dato obligatorio',
      {
        context,
        cause: e
      }
    )
  }

  // Campo enviado inválido
  if (['22P02', '22003', '22001', '22007', '22008'].includes(code)) {
    return new AppError(
      ErrorType.VALIDATION,
      'Formato o valor inválido en uno de los datos enviados', 
      {
        context,
        cause: e
      }
    )
  }

  // Errores de serialización, deadlocks, problemas de conexión, recursos insuficientes, servidor apagado, no se puede establecer la conexion
  if (['40001', '40P01'].includes(code) || code.startsWith('08') || code.startsWith('53') || ['57P01', '57P02', '57P03'].includes(code)) {
    return new AppError(
      ErrorType.SERVICE_UNAVAILABLE,
      'Servicio temporalmente no disponible',
      {
        context,
        cause: e
      }
    )
  }
  // Cualquier otro no controlado
  return new AppError(
    ErrorType.DATABASE,
    'Error de base de datos',
    {
      context,
      cause: e
    }
  )
}

function isConnectionError(err: unknown): boolean {
  if (!(err instanceof Error)) return false

  const code = (err as { code?: string }).code

  return (
    (code !== undefined && NODE_CONNECTION_CODES.has(code)) ||
    err.message.includes('timeout exceeded when trying to connect') ||
    err.message.includes('Connection terminated unexpectedly')
  )
}