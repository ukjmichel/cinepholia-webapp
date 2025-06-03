import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthFacade } from '../../../store/auth/auth.facade';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login-form.html',
  styleUrls: ['./login-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginForm {
  readonly email = new FormControl('', [Validators.required, Validators.email]);
  readonly password = new FormControl('', [Validators.required]);
  hide = signal(true);

  // This could become a signal array for more errors if you want to demo @for
  errorMessages = signal<string[]>([]);

  constructor(private authFacade: AuthFacade) {
    merge(this.email.statusChanges, this.email.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessages());
  }

  updateErrorMessages() {
    const messages: string[] = [];
    if (this.email.hasError('required')) {
      messages.push('You must enter a value');
    }
    if (this.email.hasError('email')) {
      messages.push('format email invalide');
    }
    this.errorMessages.set(messages);
  }

  togglePassword() {
    this.hide.update((prev) => !prev);
  }

  onSubmit() {
    if (this.email.invalid || this.password.invalid) {
      this.email.markAsTouched();
      this.password.markAsTouched();
      this.updateErrorMessages();
      return;
    }
    this.authFacade.login(this.email.value!, this.password.value!);
  }
}
