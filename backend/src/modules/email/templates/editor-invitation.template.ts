export interface EditorInvitationData {
  fullName: string;
  setupUrl: string;
  categories: string[];
}

export const editorInvitationTemplate = (data: EditorInvitationData): string => {
  const { fullName, setupUrl, categories } = data;

  const categoriesHtml = categories.length > 0
    ? `<p style="margin: 16px 0;"><strong>Categorías asignadas:</strong></p>
       <ul style="background-color: #f8f9fa; padding: 16px; border-radius: 4px; list-style: none;">
         ${categories.map(cat => `<li style="padding: 4px 0;">✓ ${cat}</li>`).join('')}
       </ul>`
    : '';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido al equipo!</h1>
      </div>

      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #333; margin-top: 0;">¡Hola ${fullName}!</h2>

        <p style="color: #555; line-height: 1.6;">
          Has sido invitado como <strong style="color: #667eea;">Editor</strong> del CMS de Testimonios de NoCountry.
        </p>

        ${categoriesHtml}

        <p style="color: #555; line-height: 1.6; margin-top: 20px;">
          Para completar tu registro y comenzar a trabajar, haz clic en el siguiente enlace:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${setupUrl}" style="display: inline-block; padding: 14px 32px; background-color: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
            Completar Registro
          </a>
        </div>

        <p style="color: #888; font-size: 14px; margin-top: 20px;">
          O copia y pega este enlace en tu navegador:
        </p>
        <p style="word-break: break-all; color: #667eea; font-size: 13px; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
          ${setupUrl}
        </p>

        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin-top: 24px; border-radius: 4px;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>⏰ Importante:</strong> Este enlace expira en <strong>72 horas (3 días)</strong>
          </p>
        </div>

        <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          Si no esperabas este email, puedes ignorarlo de manera segura.
        </p>
      </div>
    </div>
  `;
};
