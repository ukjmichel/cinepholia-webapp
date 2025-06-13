import { Component, signal, effect, Signal } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Movie } from '../../../models/movie.model';
import { Theater } from '../../../models/theater.model';
import { ScreeningAttributes } from '../../../models/screening.model';
import { BookingService } from '../../../services/booking.service';
import { ScreeningService } from '../../../services/screening.service';
import { MovieService } from '../../../services/movie.service';
import { TheaterService } from '../../../services/theater.service';
import { Hall } from '../../../models/hall.model';
import { HallService } from '../../../services/halls.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthFacade } from '../../../store/auth/auth.facade';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-new-booking',
  templateUrl: './new-booking.html',
  styleUrls: ['./new-booking.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    CommonModule,
  ],
})
export class NewBooking {
  bookingForm: FormGroup;

  isLoading = signal(false);
  apiError = signal('');
  successMessage = signal('');

  movies: Signal<Movie[]>;
  theaters: Signal<Theater[]>;
  screenings = signal<ScreeningAttributes[]>([]);
  halls = signal<Hall[]>([]);
  seatsLayout = signal<string[][]>([]);
  selectedSeats = signal<string[]>([]);

  movieId: string | null = null;
  theaterId: string | null = null;

  bookedSeatIds = signal<string[]>([]);

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private screeningService: ScreeningService,
    private movieService: MovieService,
    private theaterService: TheaterService,
    private hallService: HallService,
    private authFacade: AuthFacade,
    private router: Router,
    private route: ActivatedRoute // <--- inject ActivatedRoute
  ) {
    this.movies = this.movieService.allMovies;
    this.theaters = this.theaterService.allTheaters;

    this.bookingForm = this.fb.group({
      movieId: ['', Validators.required],
      theaterId: ['', Validators.required],
      date: ['', Validators.required],
      screeningId: ['', Validators.required],
      seatsNumber: [{ value: 0, disabled: true }, Validators.required],
      seatIds: [{ value: '', disabled: true }, Validators.required],
      totalPrice: [{ value: 0, disabled: true }, Validators.required],
    });

    // Load movies/theaters if missing
    if (!this.movies() || this.movies().length === 0) {
      this.movieService.getAllMovies().subscribe();
    }
    if (!this.theaters() || this.theaters().length === 0) {
      this.theaterService.getAllTheaters().subscribe();
    }

    // --- GET movieId and theaterId from query params
    this.route.queryParams.subscribe((params) => {
      this.movieId = params['movieId'] ?? null;
      this.theaterId = params['theaterId'] ?? null;

      // Patch the form when movies/theaters loaded and query params are present
      effect(() => {
        if (
          this.movies() &&
          this.movies().length &&
          this.movieId &&
          this.bookingForm.get('movieId')!.value !== this.movieId
        ) {
          this.bookingForm.get('movieId')?.setValue(this.movieId);
        }
        if (
          this.theaters() &&
          this.theaters().length &&
          this.theaterId &&
          this.bookingForm.get('theaterId')!.value !== this.theaterId
        ) {
          this.bookingForm.get('theaterId')?.setValue(this.theaterId);
        }
      });
    });

    // Listen for changes to load screenings
    this.bookingForm
      .get('movieId')!
      .valueChanges.subscribe(() => this.loadScreenings());
    this.bookingForm
      .get('theaterId')!
      .valueChanges.subscribe(() => this.loadScreenings());
    this.bookingForm
      .get('date')!
      .valueChanges.subscribe(() => this.loadScreenings());

    // Listen for screeningId changes (hall/seats)
    this.bookingForm
      .get('screeningId')!
      .valueChanges.subscribe((screeningId) => {
        if (screeningId) {
          const screening = this.screenings().find(
            (s) => s.screeningId === screeningId
          );
          if (screening) {
            this.loadHallSeats(screening.hallId);
            // Load booked seats for this screening
            this.screeningService.getBookedSeats(screeningId).subscribe({
              next: (res) => {
                this.bookedSeatIds.set(
                  res.data.map((seat: any) => seat.seatId)
                );
              },
              error: () => {
                this.bookedSeatIds.set([]);
              },
            });
          } else {
            this.seatsLayout.set([]);
            this.selectedSeats.set([]);
            this.bookedSeatIds.set([]);
          }
        } else {
          this.seatsLayout.set([]);
          this.selectedSeats.set([]);
          this.bookedSeatIds.set([]);
        }
      });

    // React to seat selection changes
    effect(() => {
      const selected = this.selectedSeats();
      this.bookingForm
        .get('seatsNumber')
        ?.setValue(selected.length, { emitEvent: false });
      this.bookingForm
        .get('seatIds')
        ?.setValue(selected.join(', '), { emitEvent: false });

      const screeningId = this.bookingForm.get('screeningId')!.value;
      const screening = this.screenings().find(
        (s) => s.screeningId === screeningId
      );
      if (screening) {
        this.bookingForm
          .get('totalPrice')
          ?.setValue(selected.length * screening.price, { emitEvent: false });
      } else {
        this.bookingForm.get('totalPrice')?.setValue(0, { emitEvent: false });
      }
    });
  }

  loadScreenings() {
    const movieId = this.bookingForm.get('movieId')!.value;
    const theaterId = this.bookingForm.get('theaterId')!.value;
    const dateObj = this.bookingForm.get('date')!.value;

    if (movieId && theaterId && dateObj) {
      const date = new Date(dateObj);
      const isoDate = date.toISOString().slice(0, 10); // "YYYY-MM-DD"

      this.screeningService
        .searchScreenings({ movieId, theaterId, date: isoDate })
        .subscribe({
          next: (screenings) => {
            this.screenings.set(screenings);
            this.bookingForm.get('screeningId')?.setValue('');
            this.seatsLayout.set([]);
            this.selectedSeats.set([]);
            this.bookedSeatIds.set([]);
          },
          error: () => {
            this.screenings.set([]);
            this.seatsLayout.set([]);
            this.selectedSeats.set([]);
            this.bookedSeatIds.set([]);
          },
        });
    } else {
      this.screenings.set([]);
      this.seatsLayout.set([]);
      this.selectedSeats.set([]);
      this.bookingForm.get('screeningId')?.setValue('');
      this.bookedSeatIds.set([]);
    }
  }

  loadHallSeats(hallId: string) {
    const theaterId = this.bookingForm.get('theaterId')!.value;
    if (!theaterId) return;

    this.hallService.getHallsByTheaterId(theaterId).subscribe((halls) => {
      const hall = halls.find((h) => h.hallId === hallId);
      if (hall && hall.seatsLayout) {
        this.seatsLayout.set(hall.seatsLayout);
        this.selectedSeats.set([]);
      } else {
        this.seatsLayout.set([]);
        this.selectedSeats.set([]);
      }
    });
  }

  isSeatSelected(seat: string): boolean {
    return this.selectedSeats().includes(seat);
  }

  isSeatBooked(seat: string): boolean {
    return this.bookedSeatIds().includes(seat);
  }

  toggleSeat(seat: string) {
    if (this.isSeatBooked(seat)) return;
    const selected = this.selectedSeats();
    if (selected.includes(seat)) {
      this.selectedSeats.set(selected.filter((s) => s !== seat));
    } else {
      this.selectedSeats.set([...selected, seat]);
    }
  }

  hasFieldError(field: string): boolean {
    const ctrl = this.bookingForm.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  getFieldError(field: string): string {
    const ctrl = this.bookingForm.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required']) return 'Ce champ est requis';
    if (ctrl.errors['min']) return 'Valeur trop basse';
    return 'Champ invalide';
  }

  onSubmit() {
    if (this.bookingForm.invalid) return;

    const userId = this.userId;
    if (!userId) {
      this.apiError.set('Utilisateur non connecté.');
      return;
    }

    this.isLoading.set(true);
    this.apiError.set('');
    this.successMessage.set('');

    const formValue = this.bookingForm.getRawValue();

    const payload = {
      userId, // injecté depuis l'auth facade
      screeningId: formValue.screeningId,
      seatsNumber: formValue.seatsNumber,
      seatIds: formValue.seatIds.split(',').map((s: string) => s.trim()),
      totalPrice: formValue.totalPrice,
    };

    this.bookingService.createBooking(payload).subscribe({
      next: () => {
        this.successMessage.set('Réservation créée avec succès !');
        this.isLoading.set(false);
        this.bookingForm.reset();
        this.screenings.set([]);
        this.seatsLayout.set([]);
        this.selectedSeats.set([]);
        this.bookedSeatIds.set([]);
      },
      error: (err) => {
        this.apiError.set(
          'Erreur lors de la création : ' + (err?.error?.message || '')
        );
        this.isLoading.set(false);
      },
    });
  }

  get userId(): string | null {
    const user = this.authFacade.user();
    return user?.userId ?? null;
  }
}
