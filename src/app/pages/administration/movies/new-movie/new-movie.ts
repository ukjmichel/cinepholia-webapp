import { Component, signal, ViewChild, ElementRef } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MovieService } from '../../../../services/movie.service'; 

@Component({
  selector: 'app-new-movie',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatCardModule,
    MatCheckboxModule,
  ],
  templateUrl: './new-movie.html',
  styleUrl: './new-movie.css',
})
export class NewMovie {
  apiError = signal('');
  successMessage = signal('');
  isLoading = signal(false);
  movieForm: FormGroup;

  // For file input and preview
  posterFile: File | null = null;
  posterPreview: string | null = null;
  dragging = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly ageRatings = [
    'G',
    'PG',
    'PG-13',
    'R',
    'NC-17',
    'U',
    'UA',
    'A',
    'Not Rated',
  ];

  constructor(private fb: FormBuilder, private movieService: MovieService) {
    this.movieForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      ageRating: ['', Validators.required],
      genre: ['', Validators.required],
      releaseDate: ['', Validators.required],
      director: ['', Validators.required],
      durationMinutes: [90, [Validators.required, Validators.min(1)]],
      recommended: [''],
      // posterUrl: [''], // REMOVE: replaced by posterFile
    });
  }

  // ----- Poster (drag & drop + preview) -----
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragging = true;
  }
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragging = false;
  }
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length) {
      this.setPosterFile(event.dataTransfer.files[0]);
    }
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.setPosterFile(input.files[0]);
    }
  }
  setPosterFile(file: File) {
    this.posterFile = file;
    // Generate preview
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.posterPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
  removePoster(event: Event) {
    event.stopPropagation();
    this.posterFile = null;
    this.posterPreview = null;
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  // ----- Form submission -----
  onSubmit() {
    if (this.movieForm.invalid) return;

    this.isLoading.set(true);
    this.apiError.set('');
    this.successMessage.set('');

    const rawValue = this.movieForm.value;
    const formData = new FormData();

    // Add fields (convert date to yyyy-mm-dd if needed)
    Object.keys(rawValue).forEach((key) => {
      let value = rawValue[key];
      if (key === 'releaseDate' && value instanceof Date) {
        value = value.toISOString().split('T')[0]; // yyyy-mm-dd
      }
      if (key !== 'posterUrl') {
        formData.append(key, value);
      }
    });

    // Add poster file if present
    if (this.posterFile) {
      formData.append('poster', this.posterFile);
    }

    // Submit
    this.movieService.addMovie(formData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Le film a été créé avec succès !');
        setTimeout(() => this.resetForm(), 3000);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.error && err.error.message) {
          this.apiError.set(err.error.message);
        } else {
          this.apiError.set('Erreur lors de la création du film.');
        }
      },
    });
  }

  resetForm() {
    this.movieForm.reset({
      title: '',
      description: '',
      ageRating: '',
      genre: '',
      releaseDate: '',
      director: '',
      durationMinutes: 90,
      recommended: '',
    });
    this.posterFile = null;
    this.posterPreview = null;
    if (this.fileInput) this.fileInput.nativeElement.value = '';
    this.successMessage.set('');
    this.apiError.set('');
  }

  clearMessages() {
    this.apiError.set('');
    this.successMessage.set('');
  }
}
