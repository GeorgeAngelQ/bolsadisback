import { z } from 'zod'

export const registrarCandidatoSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
  contrasena: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  nombres: z.string().min(2, 'Nombres requeridos').max(100),
  apellidos: z.string().min(2, 'Apellidos requeridos').max(100),
  dni: z.string().length(8, 'El DNI debe tener 8 dígitos').regex(/^\d+$/, 'Solo dígitos'),
  fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
  telefono: z.string().max(15).optional(),
  distrito: z.string().min(2, 'Distrito requerido'),
  preferenciasAccesibilidad: z.object({
    tipoContraste: z.enum(['normal', 'alto', 'oscuro']).optional(),
    tamanoTexto: z.enum(['pequeno', 'mediano', 'grande']).optional(),
    subtitulosActivos: z.boolean().optional(),
    lenguaSenas: z.boolean().optional(),
    lectorPantalla: z.boolean().optional(),
    lenguajeSencillo: z.boolean().optional(),
  }).optional(),
})

export const registrarEmpresaSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
  contrasena: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  razonSocial: z.string().min(2).max(200),
  ruc: z.string().length(11, 'El RUC debe tener 11 dígitos').regex(/^\d+$/, 'Solo dígitos'),
  representanteLegal: z.string().max(150).optional(),
  telefonoEmpresa: z.string().max(15).optional(),
  correoEmpresa: z.string().email().optional(),
})

export const loginSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
  contrasena: z.string().min(1, 'Contraseña requerida'),
})

export const solicitarRecuperacionSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
})

export const actualizarContrasenaSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  nuevaContrasena: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmacionContrasena: z.string().min(1, 'Confirmación requerida'),
}).refine(d => d.nuevaContrasena === d.confirmacionContrasena, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmacionContrasena'],
})

export const guardarPreferenciasSchema = z.object({
  tipoContraste: z.enum(['normal', 'alto', 'oscuro']).optional(),
  tamanoTexto: z.enum(['pequeno', 'mediano', 'grande']).optional(),
  subtitulosActivos: z.boolean().optional(),
  lenguaSenas: z.boolean().optional(),
  lectorPantalla: z.boolean().optional(),
  lenguajeSencillo: z.boolean().optional(),
})

export const crearIntermediadorSchema = z.object({
  correo: z.string().email(),
  nombres: z.string().min(2).max(100),
  apellidos: z.string().min(2).max(100),
  dni: z.string().length(8).regex(/^\d+$/),
  entidadOrigen: z.string().max(150).optional(),
  telefono: z.string().max(15).optional(),
})

export const crearRolSchema = z.object({
  nombre: z.string().min(2).max(50),
  descripcion: z.string().max(255).optional(),
  permisoIds: z.array(z.number().int().positive()),
})

export const asignarPermisosSchema = z.object({
  permisoIds: z.array(z.number().int().positive()),
})
