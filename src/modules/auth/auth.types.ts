/**
 * Auth-specific type definitions.
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  roleId: string;
  emailConfirmed: boolean;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

export interface RegisterResponse extends AuthResponse {
  verificationEmailSent: boolean;
}
