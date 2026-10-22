import {z} from 'zod'

const TIPOS: Record<string, string> = {
  string: 'texto', number: 'número', boolean: 'verdadero/falso', array: 'lista',
  object: 'objeto', undefined: 'vacío', null: 'nulo', nan: 'número', date: 'fecha',
  bigint: 'número', function: 'funcion', symbol:'símbolo', map:'mapa', set: 'conjunto'
}

const tipo = (t:string) => TIPOS[t] ?? t


export const spanishErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received == 'undefined') return {
        message: 'Campo requerido'
      }
      if (issue.received == 'nan') return {
        message: 'Debe ser un número válido'
      }
      return {
        message: `Debe ser ${tipo(issue.expected)} (se recibió ${tipo(issue.expected)})`
      }
    case z.ZodIssueCode.invalid_enum_value:
      return {
        message: `Valor no permitido. Opciones: ${issue.options.join(', ')}`
      }
    case z.ZodIssueCode.invalid_literal:
      return {
        message: 'Valor no permitido'
      }
    case z.ZodIssueCode.unrecognized_keys:
      return {
        message: `Campos no permitidos: ${issue.keys.join(', ')}`
      }
    case z.ZodIssueCode.invalid_union:
      return {
        message: 'El valor no cumple ninguno de los formatos permitidos'
      }
    case z.ZodIssueCode.invalid_date:
      return {
        message: 'Fecha inválida'
      }
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === 'email') return {
        message: 'Correo electrónico inválido'
      }
      if (issue.validation === 'url') return {
        message: 'URL inválida'
      }
      if (issue.validation === 'uuid') return {
        message: 'Identificador de tipo UUID inválido'
      }
      if (issue.validation === 'datetime') return {
        message: 'Fecha y hora inválidas respecto al ISO 8601'
      }
      return {
        message: 'Formato inválido'
      }
    case z.ZodIssueCode.too_small: {
      const n = issue.minimum
      if (issue.type === 'string') return {
        message: Number(n) <= 1 ? 'No puede estar vacío' : `Debe tener al menos ${n} caracteres`
      }
      if (issue.type === 'array') return {
        message: `Debe contar con al menos ${n} elementos(s)`
      }
      if (issue.type === 'number') return {
        message: issue.inclusive ? `Debe ser mayor o igual a ${n}` : `Debe ser mayor a ${n}`
      }
      return {
        message: 'Valor demasiado pequeño'
      }
    }
      
    case z.ZodIssueCode.too_big: {
      const n = issue.maximum
      if (issue.type === 'string') return {
        message: `No puede superar ${n} caracteres`
      }
      if (issue.type === 'array') return {
        message: `No puede contener más de ${n} elementos`
      }
      if (issue.type === 'number') return {
        message: issue.inclusive ? `Debe ser menor o igual a ${n}` : `Debe ser menor a ${n}`
      }
      return {
        message: 'Valor demsiado grande'
      }
    }

    case z.ZodIssueCode.not_multiple_of:
      return {
        message: `Debe ser múltiplo de ${issue.multipleOf}`
      }
    case z.ZodIssueCode.not_finite:
      return {
        message: 'Debe ser un número finito'
      }
  }
  return {
    message: ctx.defaultError
  }
}

z.setErrorMap(spanishErrorMap)