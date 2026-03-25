export interface WelcomeEmailData {
  fullName: string;
}

export const welcomeEmailTemplate = (data: WelcomeEmailData): string => {
  const { fullName } = data;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">¡Bienvenido ${fullName}!</h2>
      <p>Tu email ha sido verificado exitosamente.</p>
      <p>Ya puedes comenzar a usar Testimonial CMS para gestionar testimonios y casos de éxito.</p>
      <p style="margin-top: 24px;">¡Gracias por unirte a nosotros!</p>
    </div>
  `;
};
