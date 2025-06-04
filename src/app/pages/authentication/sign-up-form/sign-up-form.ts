import { Component } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthFacade } from '../../../store/auth/auth.facade'; // Update the import path as needed
import { Signal } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup-form',
  templateUrl: './sign-up-form.html',
  styleUrls: ['./sign-up-form.css'],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  standalone: true,
})
export class SignUpForm {
  firstname = new FormControl('', [Validators.required]);
  lastname = new FormControl('', [Validators.required]);
  username = new FormControl('', [Validators.required]);
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required]);
  hidePassword = true;

  // Reactive error signal from the facade
  apiErrorMessage: Signal<string | null>;

  constructor(private authFacade: AuthFacade) {
    this.apiErrorMessage = this.authFacade.error;
    this.authFacade.clearError(); // Clear error when form loads
  }

  hide() {
    return this.hidePassword;
  }
  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  emailErrorMessages() {
    const msgs: string[] = [];
    if (this.email.hasError('required')) msgs.push("L'email est requis");
    if (this.email.hasError('email')) msgs.push("L'email n'est pas valide");
    return msgs;
  }

  clearApiError() {
    this.authFacade.clearError();
  }

  onSubmit() {
    if (
      this.firstname.valid &&
      this.lastname.valid &&
      this.username.valid &&
      this.email.valid &&
      this.password.valid
    ) {
      this.authFacade.register(
        this.email.value!,
        this.username.value!,
        this.password.value!,
        this.firstname.value!,
        this.lastname.value!
      );
    }
  }
}
