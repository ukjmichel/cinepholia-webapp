import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import {
  ConfirmPasswordResetDto,
  RequestPasswordResetDto,
  ValidateResetTokenDto,
} from '../models/password-reset.model';

/**
 * Service responsible for managing password reset operations:
 * - Requesting reset codes
 * - Validating reset tokens
 * - Confirming password resets
 */
@Injectable({ providedIn: 'root' })
export class PasswordResetService {
  /** Base API endpoint for password reset actions */
  private baseUrl = `${environment.apiUrl}auth/password-reset/`;

  constructor(private http: HttpClient) {}

  /**
   * Requests a password reset token to be sent to the user email.
   * Always returns a generic success message (even if the user doesn't exist).
   * @param dto Email of the user requesting password reset
   * @returns Observable with `{ message: string }`
   */
  requestPasswordReset(
    dto: RequestPasswordResetDto
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}request`, dto, {
      withCredentials: true,
    });
  }

  /**
   * Validates whether a given reset token is still valid.
   * @param dto Object containing the token to validate
   * @returns Observable with `{ message: string; valid: boolean }`
   */
  validateResetToken(
    dto: ValidateResetTokenDto
  ): Observable<{ message: string; valid: boolean }> {
    return this.http.post<{ message: string; valid: boolean }>(
      `${this.baseUrl}validate`,
      dto,
      {
        withCredentials: true,
      }
    );
  }

  /**
   * Confirms a password reset by submitting the new password and token.
   * @param dto Object containing token and new password
   * @returns Observable with `{ message: string }`
   */
  confirmPasswordReset(
    dto: ConfirmPasswordResetDto
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}confirm`, dto, {
      withCredentials: true,
    });
  }
}
