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
    private cd: ChangeDetectorRef
  ) {
    // Initialize form with empty values first
    this.initializeForm();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      role: [{ value: 'utilisateur', disabled: true }],
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

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

          // Update form with original user data
          this.populateFormWithUserData(user);

          this.isLoading = false;
          this.cd.detectChanges();
        },
        error: (err) => {
          this.apiError = err?.error?.message || 'Erreur de chargement';
          this.isLoading = false;
          this.cd.detectChanges();
        },
      });
  }

  private populateFormWithUserData(user: User): void {
    // Use setValue instead of patchValue for more reliable population
    this.userForm.setValue({
      role: user.role ?? 'utilisateur',
      username: user.username || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
    });

    // For the disabled role field, set it separately
    this.userForm.get('role')?.disable();

    // Force update of form controls individually to ensure values are set
    this.userForm.get('username')?.setValue(user.username || '');
    this.userForm.get('firstName')?.setValue(user.firstName || '');
    this.userForm.get('lastName')?.setValue(user.lastName || '');
    this.userForm.get('email')?.setValue(user.email || '');

    // Mark form as pristine after populating with original data
    this.userForm.markAsPristine();

    // Force change detection
    this.cd.markForCheck();
  }

  // Getter methods for placeholders
  get usernamePlaceholder(): string {
    return this.originalUser?.username || 'Ex: johndoe';
  }

  get firstNamePlaceholder(): string {
    return this.originalUser?.firstName || 'Ex: Jean';
  }

  get lastNamePlaceholder(): string {
    return this.originalUser?.lastName || 'Ex: Dupont';
  }

  get emailPlaceholder(): string {
    return this.originalUser?.email || 'exemple@email.com';
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
      next: (updatedUser) => {
        this.successMessage = 'Modifications enregistrées avec succès.';

        // Update originalUser with the response to reflect changes
        if (updatedUser) {
          this.originalUser = { ...this.originalUser, ...updatedUser };
        }

        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.apiError = err?.error?.message || 'Une erreur est survenue.';
        this.isLoading = false;
        this.cd.detectChanges();
      },
    });
  }

  // Reset form to original values
  resetForm(): void {
    if (this.originalUser) {
      this.populateFormWithUserData(this.originalUser);
      this.clearMessages();
    }
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
                  this.cd.detectChanges();
                },
                error: () => {
                  this.apiError = 'Échec de la mise à jour du mot de passe.';
                  this.cd.detectChanges();
                },
              });
          }
        });
      }
    );
  }
}
