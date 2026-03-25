export interface VerificationEmailData {
  fullName: string;
  verificationUrl: string;
}

export const verificationEmailTemplate = (data: VerificationEmailData): string => {
  const { fullName, verificationUrl } = data;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">¡Hola ${fullName}!</h2>
      <p>Gracias por registrarte en Testimonial CMS.</p>
      <p>Por favor, verifica tu email haciendo clic en el siguiente enlace:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
        Verificar Email
      </a>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">Este enlace expirará en 24 horas.</p>
      <p style="color: #999; font-size: 12px;">Si no creaste esta cuenta, puedes ignorar este email.</p>
    </div>
  `;
};
