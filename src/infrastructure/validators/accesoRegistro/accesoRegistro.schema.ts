import { z } from 'zod'
import {
  correo, contrasenaNueva, dni, ruc, telefono, texto, fechaPasada, idEnBody,
} from '@infrastructure/validators/common/common.schemas'


export const preferenciasAccesibilidadSchema = z.object({
  tipoContraste: z.enum(['normal', 'alto', 'oscuro']).optional(),
  tamanoTexto: z.enum(['pequeno', 'mediano', 'grande']).optional(),
  subtitulosActivos: z.boolean().optional(),
  lenguaSenas: z.boolean().optional(),
  lectorPantalla: z.boolean().optional(),
  lenguajeSencillo: z.boolean().optional(),
})


export const registrarCandidatoSchema = z.object({
  correo,
  contrasena:contrasenaNueva,
  nombres: texto(2,100),
  apellidos: texto(2,100),
  dni,
  fechaNacimiento: fechaPasada,
  telefono: telefono.optional(),
  distrito: texto(2,100),
  preferenciasAccesibilidad: preferenciasAccesibilidadSchema.optional(),
})

export const registrarEmpresaSchema = z.object({
  correo,
  contrasena: contrasenaNueva,
  razonSocial: texto(2,200),
  ruc,
  representanteLegal: texto(1,150).optional(),
  telefonoEmpresa: telefono.optional(),
  correoEmpresa: correo.optional(),
})

export const loginSchema = z.object({
  correo,
  contrasena: z.string().min(1, 'Contraseña requerida').max(200),
})

export const solicitarRecuperacionSchema = z.object({
  correo,
})

export const actualizarContrasenaSchema = z.object({
  token: z.string().min(1, 'Token requerido').max(500),
  nuevaContrasena: contrasenaNueva,
  confirmacionContrasena: z.string().min(1, 'Confirmación requerida'),
}).refine(d => d.nuevaContrasena === d.confirmacionContrasena, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmacionContrasena'],
})

export const guardarPreferenciasSchema = preferenciasAccesibilidadSchema

export const crearIntermediadorSchema = z.object({
  correo,
  nombres: texto(2,100),
  apellidos: texto(2,100),
  dni,
  entidadOrigen: texto(1,150).optional(),
  telefono: telefono.optional(),
})

export const crearRolSchema = z.object({
  nombre: texto(2,50),
  descripcion: texto(1,255).optional(),
  permisoIds: z.array(idEnBody).max(200),
})

export const asignarPermisosSchema = z.object({
  permisoIds: z.array(idEnBody).max(200),
})


export const motivoCuentaSchema = z.object({
  motivo: texto(1,500),
})

export const tokenParamsSchema = z.object({
  token: z.string().min(10).max(500)
})