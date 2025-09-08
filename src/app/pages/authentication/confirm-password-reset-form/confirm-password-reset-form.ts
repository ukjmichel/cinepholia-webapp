import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { PasswordResetService } from '../../../services/password-reset.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-password-reset-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
  ],
  templateUrl: './confirm-password-reset-form.html',
  styleUrls: ['../../../styles/authentication/form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmPasswordResetForm {
  readonly resetToken = new FormControl('', [
    Validators.required,
    Validators.pattern(/^\d{6}$/),
  ]);
  readonly password = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
  ]);

  hide = signal(true);
  apiErrorMessage = signal<string>('');
  successMessage = signal<string>('');

  constructor(
    private passwordResetService: PasswordResetService,
    private router: Router
  ) {}

  togglePassword() {
    this.hide.update((v) => !v);
  }

  clearApiError() {
    this.apiErrorMessage.set('');
  }

  updateErrorMessages() {}

  onSubmit() {
    if (this.resetToken.invalid || this.password.invalid) {
      this.resetToken.markAsTouched();
      this.password.markAsTouched();
      return;
    }

    this.apiErrorMessage.set('');
    this.successMessage.set('');

    this.passwordResetService
      .confirmPasswordReset({
        token: this.resetToken.value!,
        password: this.password.value!,
      })
      .subscribe({
        next: () => {
          console.log('✅ Password reset successful. Redirecting to home...');

          this.successMessage.set(
            'Votre mot de passe a été réinitialisé avec succès. Redirection vers l’accueil...'
          );

          //  disable form
          this.resetToken.disable();
          this.password.disable();

          // Redirect after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000);
        },
        error: (err) =>
          this.apiErrorMessage.set(
            err?.error?.message ||
              'Erreur lors de la réinitialisation du mot de passe.'
          ),
      });
  }
}
