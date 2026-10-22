import { z, ZodTypeAny } from 'zod'
import { registry } from '@docs/openapiRegistry'
import { errorResponses } from '@docs/errorResponses'

type Metodo = 'get' | 'post' | 'put' | 'patch' | 'delete'

export const RespuestaMensaje = z.object({
  mensaje: z.string()
})

export const conDatos = <T extends ZodTypeAny>(schema: T) => z.object({
  data: schema
})
export const mensaje = (ejemplo: string) => z.object({
  mensaje: z.string().openapi({
    example: ejemplo
  })
})

export const RespuestaDatos = z.object({
  data: z.object({}).passthrough()
})

export interface EndpointDoc {
  metodo: Metodo
  ruta: string
  modulo: string
  seccion: string
  resumen: string
  descripcion?: string
  publico?: boolean
  roles?: string[]
  params?: z.AnyZodObject
  query?: z.AnyZodObject
  body?: z.ZodTypeAny
  multipart?: {
    archivo: {
      campo: string;
      descripcion: string;
      requerido?: boolean
    }
    campos?: z.AnyZodObject
  }
  exito: {
    status?: number;
    descripcion: string;
    schema?: ZodTypeAny;
  }
  errores?: number[]
}

function cuerpoMultipart(m: NonNullable<EndpointDoc['multipart']>) {
  const archivo = z.string().openapi({
    format: 'binary',
    description: m.archivo.descripcion
  })
  const schema = z.object({
    [m.archivo.campo]: m.archivo.requerido === false ? archivo.optional() : archivo,
    ...(m.campos?.shape ?? {})
  })
  return {
    required: true,
    content: {
      'multipart/form-data': { schema }
    }
  }
}

export function documentar(e: EndpointDoc): void {
  const errores = new Set<number>([500, ...(e.errores ?? [])])
  if (e.params || e.query || e.body) errores.add(400)
  if (e.multipart) { errores.add(413); errores.add(415) }
  if (!e.publico) errores.add(401)
  if (e.roles?.length) errores.add(403)

  const status = e.exito.status ?? 200
  const descripcion = [
    e.descripcion,
    e.roles?.length ? `Roles permitidos: **${e.roles.join(', ')}` : undefined,
  ].filter(Boolean).join('\n\n')

  registry.registerPath({
    method: e.metodo,
    path: e.ruta,
    tags: [e.modulo, e.seccion],
    summary: e.resumen,
    ...(descripcion ? { description: descripcion } : {}),
    security: e.publico ? [] : [{ bearerAuth: [] }],
    request: {
      ...(e.params ? { params: e.params } : {}),
      ...(e.query ? { query: e.query } : {}),
      ...(e.body ? { body: { required: true, content: { 'application/json': { schema: e.body }}} } : {}),
      ...(e.multipart ? { body: cuerpoMultipart(e.multipart)} : {})
    },
    responses: {
      [status]: {
        description: e.exito.descripcion,
        ...(e.exito.schema ? { content: { 'application/json': { schema: e.exito.schema}}} : {}),
      },
      ...errorResponses(...[...errores].sort((a,b) => a - b)),
    },
  })
}