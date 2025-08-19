/**
 * DTO for requesting a password reset (email only).
 */
export interface RequestPasswordResetDto {
  email: string;
}

/**
 * DTO for validating a password reset token.
 */
export interface ValidateResetTokenDto {
  token: string;
}

/**
 * DTO for confirming password reset (token + new password).
 */
export interface ConfirmPasswordResetDto {
  token: string;
  password: string;
}
