export interface TestimonialInvitationData {
  fullName: string;
  inviteUrl: string;
  testimonialName: string;
}

export const testimonialInvitationTemplate = (
  data: TestimonialInvitationData,
) => `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Hola ${data.fullName},</h2>
    <p>Has sido invitado a dejar un testimonio sobre:</p>
    <strong>${data.testimonialName}</strong>
    <p>Puedes completar tu testimonio ingresando al siguiente enlace:</p>
    <a href="${data.inviteUrl}" style="color: #007bff;">Crear testimonio</a>
    <br /><br />
    <p>Gracias por tu tiempo.</p>
  </div>
`;
