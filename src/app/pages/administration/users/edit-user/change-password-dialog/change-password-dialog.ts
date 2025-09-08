import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
  AbstractControl,
  ValidatorFn,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Password match validator to ensure both fields are identical.
 */
const passwordMatchValidator: ValidatorFn = (
  group: AbstractControl
): ValidationErrors | null => {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return newPassword && confirmPassword && newPassword !== confirmPassword
    ? { passwordMismatch: true }
    : null;
};

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  templateUrl: './change-password-dialog.html',
  styleUrls: ['./change-password-dialog.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class ChangePasswordDialog {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ChangePasswordDialog>
  ) {
    this.form = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }

  /**
   * Submit the form and close the dialog with new password if valid.
   */
  onSubmit(): void {
    if (this.form.valid) {
      const password = this.form.get('newPassword')?.value;
      this.dialogRef.close(password);
    }
  }

  /**
   * Close the dialog without making changes.
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Indicates if the passwords do not match.
   */
  get passwordMismatch(): boolean {
    return (
      this.form.hasError('passwordMismatch') &&
      !!this.form.get('confirmPassword')?.touched
    );
  }
}
