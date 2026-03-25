import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  verificationEmailTemplate,
  VerificationEmailData,
} from './templates/verification-email.template';
import {
  passwordResetTemplate,
  PasswordResetData,
} from './templates/password-reset.template';
import {
  editorInvitationTemplate,
  EditorInvitationData,
} from './templates/editor-invitation.template';
import {
  welcomeEmailTemplate,
  WelcomeEmailData,
} from './templates/welcome-email.template';
import { testimonialInvitationTemplate } from './templates/testimonial-invitation.template';

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(resendApiKey);
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    fullName: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get<string>('frontend.url') || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const templateData: VerificationEmailData = {
      fullName,
      verificationUrl,
    };

    try {
      await this.resend.emails.send({
        from: 'Testimonial CMS <onboarding@resend.dev>',
        to: email,
        subject: 'Verifica tu email - Testimonial CMS',
        html: verificationEmailTemplate(templateData),
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    fullName: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get<string>('frontend.url') || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const templateData: PasswordResetData = {
      fullName,
      resetUrl,
    };

    try {
      await this.resend.emails.send({
        from: 'Testimonial CMS <onboarding@resend.dev>',
        to: email,
        subject: 'Restablece tu contraseña - Testimonial CMS',
        html: passwordResetTemplate(templateData),
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error,
      );
      throw error;
    }
  }

  async sendEditorInvitationEmail(
    email: string,
    token: string,
    fullName: string,
    categories: string[],
  ): Promise<void> {
    const frontendUrl =
      this.configService.get<string>('frontend.url') || 'http://localhost:3000';
    const setupUrl = `${frontendUrl}/setup-account/${token}`;

    const templateData: EditorInvitationData = {
      fullName,
      setupUrl,
      categories,
    };

    try {
      await this.resend.emails.send({
        from: 'Testimonial CMS <onboarding@resend.dev>',
        to: email,
        subject: '¡Bienvenido al equipo! - Testimonial CMS',
        html: editorInvitationTemplate(templateData),
      });
      this.logger.log(`Editor invitation email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send editor invitation email to ${email}`,
        error,
      );
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, fullName: string): Promise<void> {
    const templateData: WelcomeEmailData = {
      fullName,
    };

    try {
      await this.resend.emails.send({
        from: 'Testimonial CMS <onboarding@resend.dev>',
        to: email,
        subject: '¡Bienvenido a Testimonial CMS!',
        html: welcomeEmailTemplate(templateData),
      });
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}`, error);
      // No lanzamos error aquí porque el welcome email no es crítico
    }
  }
  async sendTestimonialInvitationEmail(
    email: string,
    token: string,
    fullName: string,
    testimonialName: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get<string>('frontend.url') || 'http://localhost:3000';

    const inviteUrl = `${frontendUrl}/testimonial/invite/${token}`;

    const templateData = {
      fullName,
      inviteUrl,
      testimonialName,
    };

    try {
      await this.resend.emails.send({
        from: 'Testimonial CMS <onboarding@resend.dev>',
        to: email,
        subject: 'Has sido invitado a dejar un testimonio',
        html: testimonialInvitationTemplate(templateData),
      });
      this.logger.log(`Testimonial invitation email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send testimonial invitation email to ${email}`,
        error,
      );
      throw error;
    }
  }
}
