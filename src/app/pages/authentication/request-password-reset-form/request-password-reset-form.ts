import {
  ChangeDetectionStrategy,
  Component,
  signal,
  Signal,
} from '@angular/core';
import {
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { PasswordResetService } from '../../../services/password-reset.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request-password-reset-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
  ],
  templateUrl: './request-password-reset-form.html',
  styleUrls: ['../../../styles/authentication/form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestPasswordResetForm {
  readonly email = new FormControl('', [Validators.required, Validators.email]);

  errorMessages = signal<string[]>([]);
  apiErrorMessage = signal<string>('');
  successMessage = signal<string>('');

  constructor(
    private passwordResetService: PasswordResetService,
    private router: Router // ✅ inject Router
  ) {}

  updateErrorMessages() {
    const messages: string[] = [];
    if (this.email.hasError('required')) {
      messages.push('Vous devez entrer une adresse email');
    }
    if (this.email.hasError('email')) {
      messages.push('Format email invalide');
    }
    this.errorMessages.set(messages);
  }

  clearApiError() {
    this.apiErrorMessage.set('');
  }

  onSubmit() {
    if (this.email.invalid) {
      this.email.markAsTouched();
      this.updateErrorMessages();
      return;
    }

    this.apiErrorMessage.set('');
    this.successMessage.set('');

    this.passwordResetService
      .requestPasswordReset({ email: this.email.value! })
      .subscribe({
        next: (res) => {
          // Optional: show message before redirect
          this.successMessage.set(res.message || 'Code envoyé');

          // ✅ Redirect to confirm page (and pass email as query param if needed)
          this.router.navigate(['/auth/reset-password'], {
            queryParams: { email: this.email.value },
          });
        },
        error: (err) => {
          this.apiErrorMessage.set(
            err?.error?.message ||
              'Erreur lors de la demande de réinitialisation.'
          );
        },
      });
  }
}
