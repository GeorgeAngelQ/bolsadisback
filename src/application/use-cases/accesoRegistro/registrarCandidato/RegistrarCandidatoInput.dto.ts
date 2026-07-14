export interface RegistrarCandidatoInputDto {
  correo: string
  contrasena: string
  nombres: string
  apellidos: string
  dni: string
  fechaNacimiento: string   
  telefono?: string
  distrito: string
  preferenciasAccesibilidad?: {
    tipoContraste?: 'normal' | 'alto' | 'oscuro'
    tamanoTexto?: 'pequeno' | 'mediano' | 'grande'
    subtitulosActivos?: boolean
    lenguaSenas?: boolean
    lectorPantalla?: boolean
    lenguajeSencillo?: boolean
  }
}
