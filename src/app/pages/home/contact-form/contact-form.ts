import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Theater } from '../../../models/theater.model';
import { TheaterService } from '../../../services/theater.service';
import { ContactService } from '../../../services/contact.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './contact-form.html',
  styleUrls: ['./contact-form.css'],
})
export class ContactForm implements OnInit {
  form: FormGroup;
  theaters = signal<Theater[]>([]);
  isSubmitting = signal(false);

  private fb = inject(FormBuilder);
  private theaterService = inject(TheaterService);
  private contactService = inject(ContactService); // 👈 Inject the ContactService
  private snackbar = inject(MatSnackBar); // Optional for feedback

  ngOnInit(): void {
    this.theaterService.getAllTheaters().subscribe({
      next: (theaters) => this.theaters.set(theaters),
      error: () => this.theaters.set([]),
    });
  }

  constructor() {
    this.form = this.fb.group({
      theaterId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const data = this.form.value;

    this.contactService.sendMessage(data).subscribe({
      next: (res) => {
        this.snackbar.open('Message envoyé avec succès.', 'Fermer', {
          duration: 3000,
        });
        this.form.reset();
      },
      error: (err) => {
        this.snackbar.open('Erreur lors de l’envoi du message.', 'Fermer', {
          duration: 3000,
        });
        console.error(err);
      },
      complete: () => this.isSubmitting.set(false),
    });
  }
}
