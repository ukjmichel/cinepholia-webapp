import { Component, effect, Signal, signal } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Movie } from '../../../../models/movie.model';
import { Theater } from '../../../../models/theater.model';
import { Hall } from '../../../../models/hall.model';
import { ScreeningService } from '../../../../services/screening.service';
import { MovieService } from '../../../../services/movie.service';
import { TheaterService } from '../../../../services/theater.service';
import { HallService } from '../../../../services/halls.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-new-screening',
  templateUrl: './new-screening.html',
  styleUrl: './new-screening.css',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatCardModule,
    MatDividerModule,
    RouterModule,
  ],
})
export class NewScreening {
  screeningForm: FormGroup;
  isLoading = signal(false);
  apiError = signal('');
  successMessage = signal('');
  movies: Signal<Movie[]>;
  theaters: Signal<Theater[]>;
  halls = signal<Hall[]>([]);
  theaterIdSignal = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private screeningService: ScreeningService,
    private movieService: MovieService,
    private theaterService: TheaterService,
    private hallService: HallService
  ) {
    this.movies = this.movieService.allMovies;
    this.theaters = this.theaterService.allTheaters;

    this.screeningForm = this.fb.group({
      movieId: ['', Validators.required],
      theaterId: ['', Validators.required],
      hallId: ['', Validators.required],
      date: ['', Validators.required], // Date seule
      time: ['', Validators.required], // Heure seule (ex: '20:15')
      quality: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
    });

    // Charger les films/théâtres si pas déjà fait
    if (
      !this.movieService.allMovies() ||
      this.movieService.allMovies().length === 0
    )
      this.movieService.getAllMovies().subscribe();
    if (
      !this.theaterService.allTheaters() ||
      this.theaterService.allTheaters().length === 0
    )
      this.theaterService.getAllTheaters().subscribe();

    // Synchroniser sélection cinéma <-> signal
    this.screeningForm.get('theaterId')!.valueChanges.subscribe((theaterId) => {
      this.theaterIdSignal.set(theaterId);
    });

    // Charger les halls sur changement cinéma
    effect(() => {
      this.halls.set([]);
      const theaterId = this.theaterIdSignal();
      if (theaterId) {
        this.hallService.getHallsByTheaterId(theaterId).subscribe((halls) => {
          this.halls.set(halls ?? []);
        });
      }
      this.screeningForm.get('hallId')?.setValue('');
    });
  }

  onSubmit() {
    if (this.screeningForm.invalid) return;
    this.isLoading.set(true);
    this.apiError.set('');
    this.successMessage.set('');

    const formValue = this.screeningForm.value;

    // Combiner la date et l’heure en un ISO string
    const date: Date = formValue.date;
    const time: string = formValue.time; // ex: '20:00'
    const [hours, minutes] = time.split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    const startTime = dateTime.toISOString();

    const payload = {
      movieId: formValue.movieId,
      theaterId: formValue.theaterId,
      hallId: formValue.hallId,
      startTime, // Champ ISO
      quality: formValue.quality,
      price: Number(formValue.price),
    };

    this.screeningService.addScreening(payload).subscribe({
      next: () => {
        this.successMessage.set('Séance créée avec succès !');
        this.isLoading.set(false);
      },
      error: (err) => {
        this.apiError.set(
          'Erreur lors de la création : ' + (err?.error?.message || '')
        );
        this.isLoading.set(false);
      },
    });
  }

  hasFieldError(field: string): boolean {
    const ctrl = this.screeningForm.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  getFieldError(field: string): string {
    const ctrl = this.screeningForm.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required']) return 'Ce champ est requis';
    if (ctrl.errors['min']) return 'Valeur trop basse';
    return 'Champ invalide';
  }

  resetForm() {
    this.screeningForm.reset({
      movieId: '',
      theaterId: '',
      hallId: '',
      date: '',
      time: '',
      quality: '',
      price: '',
    });
    this.apiError.set('');
    this.successMessage.set('');
  }
}
