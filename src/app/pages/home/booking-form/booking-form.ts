import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { MovieService } from '../../../services/movie.service';
import { TheaterService } from '../../../services/theater.service';
import { Movie } from '../../../models/movie.model';
import { Theater } from '../../../models/theater.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './booking-form.html',
  styleUrls: ['./booking-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingForm {
  private movieService = inject(MovieService);
  private theaterService = inject(TheaterService);
  private router = inject(Router);

  movies: Movie[] = [];
  theaters: Theater[] = [];

  bookingForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.bookingForm = this.fb.group({
      movieId: [null, Validators.required],
      theaterId: [null, Validators.required],
    });

    this.movieService.getAllMovies().subscribe((data) => (this.movies = data));
    this.theaterService
      .getAllTheaters()
      .subscribe((data) => (this.theaters = data));
  }

  get canSubmit() {
    return this.bookingForm.valid;
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      const { movieId, theaterId } = this.bookingForm.value;
      this.router.navigate(['/bookings', 'new-booking'], {
        queryParams: { movieId, theaterId },
      });
    }
  }
}
