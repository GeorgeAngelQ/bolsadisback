export interface IniciarSesionOutputDto {
  accessToken: string
  idUsuario: number
  correo: string
  rol: string
  preferenciasAccesibilidad: {
    tipoContraste: string
    tamanoTexto: string
    subtitulosActivos: boolean
    lenguaSenas: boolean
    lectorPantalla: boolean
    lenguajeSencillo: boolean
  }
}
