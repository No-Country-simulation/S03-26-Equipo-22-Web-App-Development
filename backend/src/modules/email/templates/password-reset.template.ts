export interface PasswordResetData {
  fullName: string;
  resetUrl: string;
}

export const passwordResetTemplate = (data: PasswordResetData): string => {
  const { fullName, resetUrl } = data;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">¡Hola ${fullName}!</h2>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
        Restablecer Contraseña
      </a>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">Este enlace expirará en 1 hora.</p>
      <p style="color: #999; font-size: 12px;">Si no solicitaste restablecer tu contraseña, puedes ignorar este email.</p>
    </div>
  `;
};
