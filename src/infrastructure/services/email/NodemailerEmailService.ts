import nodemailer from 'nodemailer'
import { IEmailService } from '../../../application/ports/IEmailService'

export class NodemailerEmailService implements IEmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT ?? '986'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async sendRecoveryEmail(correo: string, token: string): Promise<void> {
    const urlRecuperacion = `${process.env.FRONTEND_URL}/recuperar-contrasena?token=${token}`

    await this.transporter.sendMail({
      from: `"Portal Inclusivo" <${process.env.SMTP_FROM ?? 'noreply@portalinclusivo.pe'}>`,
      to: correo,
      subject: 'Recupera tu contraseña — Portal de Empleo Inclusivo',
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${urlRecuperacion}">Restablecer contraseña</a>
        <p>Este enlace expira en 24 horas.</p>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
      `,
    })
  }

  async sendWelcomeEmail(correo: string, nombres: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"Portal Inclusivo" <${process.env.SMTP_FROM ?? 'noreply@portalinclusivo.pe'}>`,
      to: correo,
      subject: 'Bienvenido al Portal de Empleo Inclusivo',
      html: `
        <h2>¡Bienvenido, ${nombres}!</h2>
        <p>Tu cuenta fue creada exitosamente en el Portal de Empleo Inclusivo de Lima Metropolitana.</p>
        <p>Accede a tu cuenta y completa tu perfil para comenzar tu búsqueda de empleo.</p>
        <a href="${process.env.FRONTEND_URL}">Ir al portal</a>
      `,
    })
  }

  async sendCredencialesEmail(correo: string, contrasenaTemp: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"Portal Inclusivo" <${process.env.SMTP_FROM ?? 'noreply@portalinclusivo.pe'}>`,
      to: correo,
      subject: 'Tus credenciales de acceso — Portal de Empleo Inclusivo',
      html: `
        <h2>Cuenta de intermediador creada</h2>
        <p>Se creó una cuenta de intermediador laboral para ti.</p>
        <p><strong>Correo:</strong> ${correo}</p>
        <p><strong>Contraseña temporal:</strong> ${contrasenaTemp}</p>
        <p>Por favor, cambia tu contraseña al ingresar por primera vez.</p>
        <a href="${process.env.FRONTEND_URL}">Ingresar al portal</a>
      `,
    })
  }

  async sendAccountStatusEmail(
    correo: string,
    estado: 'suspendida' | 'reactivada' | 'eliminada',
  ): Promise<void> {
    const mensajes: Record<string, string> = {
      suspendida: 'Tu cuenta ha sido suspendida. Contacta al administrador para más información.',
      reactivada: 'Tu cuenta ha sido reactivada. Ya puedes acceder al portal.',
      eliminada: 'Tu cuenta ha sido eliminada del sistema.',
    }

    await this.transporter.sendMail({
      from: `"Portal Inclusivo" <${process.env.SMTP_FROM ?? 'noreply@portalinclusivo.pe'}>`,
      to: correo,
      subject: `Estado de tu cuenta — Portal de Empleo Inclusivo`,
      html: `<p>${mensajes[estado]}</p>`,
    })
  }
}
