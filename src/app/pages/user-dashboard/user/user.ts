import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

import { AuthFacade } from '../../../store/auth/auth.facade';
import { UserService } from '../../../services/user.service';
import { UpdateUserDto } from '../../../services/user.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class UserComponent {
  authFacade = inject(AuthFacade);
  userService = inject(UserService);

  user = this.authFacade.user();
  editMode = signal(false);

  // Editable fields (copied from user)
  form = {
    username: this.user?.username || '',
    firstName: this.user?.firstName || '',
    lastName: this.user?.lastName || '',
    email: this.user?.email || '',
  };

  toggleEdit() {
    this.editMode.update((value) => !value);
  }

  saveChanges() {
    if (!this.user) return;

    const updateDto: UpdateUserDto = {
      username: this.form.username,
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
    };

    this.userService.updateUser(this.user.userId, updateDto).subscribe({
      next: (updatedUser) => {
        console.log('User updated:', updatedUser);
        this.toggleEdit();
      },
      error: (err) => {
        console.error('Error updating user:', err);
      },
    });
  }
}
