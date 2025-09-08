import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TheaterService } from '../../../../services/theater.service';

@Component({
  selector: 'app-new-theater',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './new-theater.html',
  styleUrl: './new-theater.css',
})
export class NewTheater {
  apiError = signal('');
  successMessage = signal('');
  isLoading = signal(false);
  theaterForm: FormGroup;

  constructor(private fb: FormBuilder, private theaterService: TheaterService) {
    this.theaterForm = this.fb.group({
      theaterId: ['', Validators.required],
      address: ['', Validators.required],
      postalCode: ['', Validators.required],
      city: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.theaterForm.invalid) return;

    this.isLoading.set(true);
    this.apiError.set('');
    this.successMessage.set('');

    this.theaterService.addTheater(this.theaterForm.value).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        const theaterName =
          this.theaterForm.get('theaterId')?.value || 'Le cinéma';
        this.successMessage.set(`${theaterName} a été créé avec succès !`);

        // Optional: Reset form after success
        setTimeout(() => {
          this.resetForm();
        }, 3000);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.error && err.error.message) {
          this.apiError.set(err.error.message);
        } else {
          this.apiError.set('Erreur lors de la création du cinéma.');
        }
      },
    });
  }

  resetForm() {
    this.theaterForm.reset();
    this.clearMessages();

    // Reset form to initial state
    this.theaterForm.patchValue({
      theaterId: '',
      address: '',
      postalCode: '',
      city: '',
      phone: '',
      email: '',
    });
  }

  clearMessages() {
    this.apiError.set('');
    this.successMessage.set('');
  }

  onInputChange() {
    // Clear messages when user starts typing
    this.clearMessages();
  }

  // Individual field validation helpers
  hasFieldError(fieldName: string): boolean {
    const field = this.theaterForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.theaterForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return this.getRequiredErrorMessage(fieldName);
      }
      if (field.errors['email']) {
        return "Format d'email invalide";
      }
    }
    return '';
  }

  private getRequiredErrorMessage(fieldName: string): string {
    const fieldLabels: { [key: string]: string } = {
      theaterId: "L'identifiant du cinéma est requis",
      address: "L'adresse est requise",
      postalCode: 'Le code postal est requis',
      city: 'La ville est requise',
      phone: 'Le téléphone est requis',
      email: "L'email est requis",
    };
    return fieldLabels[fieldName] || 'Ce champ est requis';
  }
}
