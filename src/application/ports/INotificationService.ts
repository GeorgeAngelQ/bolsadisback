export interface INotificationService {
  notificar(idUsuario: number, titulo: string, contenido: string): Promise<void>
  notificarMasivo(idUsuarios: number[], titulo: string, contenido: string): Promise<void>
}
