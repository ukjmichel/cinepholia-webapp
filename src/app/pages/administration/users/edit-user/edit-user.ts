import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import {
  UpdateUserDto,
  User,
  UserService,
} from '../../../../services/user.service';

// Angular Material modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  templateUrl: './edit-user.html',
  styleUrls: ['./edit-user.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
})
export class EditUser implements OnInit {
  userForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  apiError = '';
  userId = '';
  originalUser!: User;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef // ✅ Injection
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.userId = params.get('userId') || '';
          return this.userService.getUserById(this.userId);
        })
      )
      .subscribe({
        next: (user) => {
          this.originalUser = user;

          this.userForm = this.fb.group({
            role: [{ value: user.role ?? 'utilisateur', disabled: true }],
            username: [user.username, Validators.required],
            firstName: [user.firstName, Validators.required],
            lastName: [user.lastName, Validators.required],
            email: [user.email, [Validators.required, Validators.email]],
          });

          this.isLoading = false;
          this.cd.detectChanges(); // ✅ Force la détection après modif
        },
        error: (err) => {
          this.apiError = err?.error?.message || 'Erreur de chargement';
          this.isLoading = false;
          this.cd.detectChanges(); // ✅ Évite l'erreur NG0100
        },
      });
  }

  clearMessages() {
    this.apiError = '';
    this.successMessage = '';
  }

  onSubmit(): void {
    if (!this.userForm.valid) return;

    const formValues = this.userForm.getRawValue();
    const updatedFields: UpdateUserDto = {};

    ['username', 'firstName', 'lastName', 'email'].forEach((key) => {
      if (formValues[key] !== (this.originalUser as any)[key]) {
        (updatedFields as any)[key] = formValues[key];
      }
    });

    if (Object.keys(updatedFields).length === 0) {
      this.successMessage = 'Aucune modification détectée.';
      return;
    }

    this.isLoading = true;

    this.userService.updateUser(this.userId, updatedFields).subscribe({
      next: () => {
        this.successMessage = 'Modifications enregistrées avec succès.';
        this.isLoading = false;
      },
      error: (err) => {
        this.apiError = err?.error?.message || 'Une erreur est survenue.';
        this.isLoading = false;
      },
    });
  }

  get displayedRole(): string {
    const role = this.userForm?.get('role')?.value;
    const map: Record<string, string> = {
      utilisateur: 'Utilisateur',
      employé: 'Employé',
      administrateur: 'Administrateur',
    };
    return map[role] || role;
  }

  openPasswordDialog(): void {
    import('./change-password-dialog/change-password-dialog').then(
      ({ ChangePasswordDialog }) => {
        const dialogRef = this.dialog.open(ChangePasswordDialog);

        dialogRef.afterClosed().subscribe((newPassword: string) => {
          if (newPassword) {
            this.userService
              .changePassword(this.userId, newPassword)
              .subscribe({
                next: () => {
                  this.successMessage = 'Mot de passe mis à jour avec succès.';
                },
                error: () => {
                  this.apiError = 'Échec de la mise à jour du mot de passe.';
                },
              });
          }
        });
      }
    );
  }
}
