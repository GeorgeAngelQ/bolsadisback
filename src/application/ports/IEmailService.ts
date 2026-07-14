export interface IEmailService {
  sendRecoveryEmail(correo: string, token: string): Promise<void>
  sendWelcomeEmail(correo: string, nombres: string): Promise<void>
  sendCredencialesEmail(correo: string, contrasenaTemp: string): Promise<void>
  sendAccountStatusEmail(correo: string, estado: 'suspendida' | 'reactivada' | 'eliminada'): Promise<void>
}
