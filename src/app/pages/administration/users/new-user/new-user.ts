import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

import {
  UserService,
  CreateUserDto,
  CreateEmployeeDto,
  UserRole,
} from '../../../../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-new-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
  ],
  templateUrl: './new-user.html',
  styleUrls: ['./new-user.css'],
})
export class NewUser {
  userForm: FormGroup;
  isLoading = false;
  successMessage = '';
  apiError = '';

  // Roles selectable in the form
  roles: UserRole[] = ['utilisateur', 'employé'];

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['utilisateur', Validators.required], // Default to 'utilisateur'
    });
  }

  clearMessages() {
    this.successMessage = '';
    this.apiError = '';
  }

  onSubmit() {
    if (this.userForm.invalid) return;
    this.isLoading = true;
    this.successMessage = '';
    this.apiError = '';

    const { role, ...userData } = this.userForm.value;

    if (role === 'utilisateur') {
      // Send regular user creation request
      this.userService.createUser(userData as CreateUserDto).subscribe({
        next: (user) => {
          console.log(user);
          this.successMessage = `Utilisateur ${user.username} créé avec succès !`;
          this.userForm.reset({ role: 'utilisateur' }); // reset role default
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.apiError = err.error?.message || 'Erreur lors de la création.';
          this.isLoading = false;
        },
      });
    } else if (role === 'employé') {
      // Send employee creation request
      this.userService.createEmployee(userData as CreateEmployeeDto).subscribe({
        next: (user) => {
          console.log(user);
          this.successMessage = `Employé ${user.username} créé avec succès !`;
          this.userForm.reset({ role: 'utilisateur' });
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.apiError = err.error?.message || 'Erreur lors de la création.';
          this.isLoading = false;
        },
      });
    }
  }
}
