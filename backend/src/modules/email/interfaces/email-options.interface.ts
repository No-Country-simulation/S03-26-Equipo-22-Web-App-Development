export interface BaseEmailOptions {
  to: string;
  subject: string;
  from?: string;
}

export interface VerificationEmailOptions extends BaseEmailOptions {
  fullName: string;
  token: string;
}

export interface PasswordResetEmailOptions extends BaseEmailOptions {
  fullName: string;
  token: string;
}

export interface EditorInvitationEmailOptions extends BaseEmailOptions {
  fullName: string;
  token: string;
  categories: string[];
}

export interface WelcomeEmailOptions extends BaseEmailOptions {
  fullName: string;
}
