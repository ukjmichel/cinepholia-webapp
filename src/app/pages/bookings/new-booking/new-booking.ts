import { Component, Signal, signal, effect } from '@angular/core';
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
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { Movie } from '../../../models/movie.model';
import { Theater } from '../../../models/theater.model';
import { ScreeningAttributes } from '../../../models/screening.model';
import { Hall } from '../../../models/hall.model';
import { BookingService } from '../../../services/booking.service';
import { ScreeningService } from '../../../services/screening.service';
import { MovieService } from '../../../services/movie.service';
import { TheaterService } from '../../../services/theater.service';
import { HallService } from '../../../services/halls.service';
import { AuthFacade } from '../../../store/auth/auth.facade';
import { NewBookingDataService } from './new-booking-data.service';

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
  // --- Form group for all fields
  bookingForm: FormGroup;

  // --- UI signals for state feedback
  isLoading = signal(false);
  apiError = signal('');
  successMessage = signal('');

  // --- Data signals for async/observable data
  movies: Signal<Movie[]>;
  theaters: Signal<Theater[]>;
  screenings = signal<ScreeningAttributes[]>([]);
  halls = signal<Hall[]>([]);
  seatsLayout = signal<string[][]>([]);
  selectedSeats = signal<string[]>([]);
  bookedSeatIds = signal<string[]>([]);

  // --- Query params (for preselecting form fields)
  movieId: string | null = null;
  theaterId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private screeningService: ScreeningService,
    private movieService: MovieService,
    private theaterService: TheaterService,
    private hallService: HallService,
    private authFacade: AuthFacade,
    private router: Router,
    private route: ActivatedRoute,
    private bookingDataService: NewBookingDataService
  ) {
    // Signals for list data
    this.movies = this.movieService.allMovies;
    this.theaters = this.theaterService.allTheaters;

    // Reactive Form setup
    this.bookingForm = this.createBookingForm();

    // Load any prefilled state from service
    this.loadPersistedState();

    // Load movies and theaters if not already loaded
    this.initMovieAndTheaterLoad();

    // Handle movieId/theaterId in URL query params
    this.handleQueryParams();

    // Setup listeners for form fields, screeningId, and seat sync
    this.setupFormListeners();
    this.setupScreeningIdListener();
    this.setupSeatSelectionSync();
  }

  // --- FORM GROUP CREATION ---
  private createBookingForm(): FormGroup {
    return this.fb.group({
      movieId: ['', Validators.required],
      theaterId: ['', Validators.required],
      date: ['', Validators.required],
      screeningId: ['', Validators.required],
      seatsNumber: [{ value: 0, disabled: true }, Validators.required],
      seatIds: [{ value: '', disabled: true }, Validators.required],
      totalPrice: [{ value: 0, disabled: true }, Validators.required],
    });
  }

  // --- PERSISTED STATE (for multi-step or navigated-away users) ---
  private loadPersistedState() {
    const persisted = this.bookingDataService.bookingFormData();
    if (persisted) {
      this.bookingForm.patchValue({
        movieId: persisted.movieId,
        theaterId: persisted.theaterId,
        date: persisted.date,
        screeningId: persisted.screeningId,
      });
      if (persisted.movieId && persisted.theaterId && persisted.date) {
        setTimeout(() =>
          this.loadScreenings(persisted.screeningId ?? undefined)
        );
      }
    }
  }

  // --- INITIAL DATA LOAD ---
  private initMovieAndTheaterLoad() {
    if (!this.movies() || this.movies().length === 0) {
      this.movieService.getAllMovies().subscribe();
    }
    if (!this.theaters() || this.theaters().length === 0) {
      this.theaterService.getAllTheaters().subscribe();
    }
  }

  // --- QUERY PARAMS HANDLING ---
  private handleQueryParams() {
    this.route.queryParams.subscribe((params) => {
      this.movieId = params['movieId'] ?? null;
      this.theaterId = params['theaterId'] ?? null;

      // Set fields in form if present in query params
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
  }

  // --- FORM FIELD LISTENERS ---
  private setupFormListeners() {
    // Save form state to service except calculated fields
    this.bookingForm.valueChanges.subscribe((values) => {
      this.bookingDataService.setMovieId(values.movieId || null);
      this.bookingDataService.setTheaterId(values.theaterId || null);
      this.bookingDataService.setDate(values.date || null);
      this.bookingDataService.setScreeningId(values.screeningId || null);
    });

    // Reload screenings on relevant field changes
    this.bookingForm
      .get('movieId')!
      .valueChanges.subscribe(() => this.loadScreenings());
    this.bookingForm
      .get('theaterId')!
      .valueChanges.subscribe(() => this.loadScreenings());
    this.bookingForm
      .get('date')!
      .valueChanges.subscribe(() => this.loadScreenings());
  }

  // --- SCREENINGID LISTENER FOR SEAT MAP ---
  private setupScreeningIdListener() {
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
  }

  // --- SYNC SEAT SELECTION TO FORM FIELDS ---
  private setupSeatSelectionSync() {
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
        const total = selected.length * screening.price;
        this.bookingForm
          .get('totalPrice')
          ?.setValue(total, { emitEvent: false });
      } else {
        this.bookingForm.get('totalPrice')?.setValue(0, { emitEvent: false });
      }
    });
  }

  // --- LOAD SCREENINGS, REMOVE DUPLICATES, FILTER BY LOCAL DATE ---
  loadScreenings(selectedScreeningId?: string) {
    const movieId = this.bookingForm.get('movieId')!.value;
    const theaterId = this.bookingForm.get('theaterId')!.value;
    const dateObj = this.bookingForm.get('date')!.value;

    // Utility to get local date as YYYY-MM-DD string
    function getLocalDateString(date: Date): string {
      return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-');
    }

    if (movieId && theaterId && dateObj) {
      const selectedDate = new Date(dateObj);
      const filterDateStr = getLocalDateString(selectedDate);

      this.screeningService
        .searchScreenings({ movieId, theaterId, date: filterDateStr })
        .subscribe({
          next: (screenings) => {
            // 1️⃣ Remove duplicates by screeningId
            const uniqueMap = new Map<string, ScreeningAttributes>();
            screenings.forEach((s) => uniqueMap.set(s.screeningId, s));
            let uniqueScreenings = Array.from(uniqueMap.values());

            // 2️⃣ Filter by exact local date only (fix timezone bug!)
            uniqueScreenings = uniqueScreenings.filter((s) => {
              const local = new Date(s.startTime);
              const localDay = getLocalDateString(local);
              return localDay === filterDateStr;
            });

            this.screenings.set(uniqueScreenings);

            // 3️⃣ Restore previous screening selection if available
            if (
              selectedScreeningId &&
              uniqueScreenings.some(
                (s) => s.screeningId === selectedScreeningId
              )
            ) {
              this.bookingForm
                .get('screeningId')
                ?.setValue(selectedScreeningId);
            } else {
              this.bookingForm.get('screeningId')?.setValue('');
            }
            // 4️⃣ Reset seats and booked state
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
      // Not enough data to filter: reset
      this.screenings.set([]);
      this.seatsLayout.set([]);
      this.selectedSeats.set([]);
      this.bookingForm.get('screeningId')?.setValue('');
      this.bookedSeatIds.set([]);
    }
  }

  // --- LOAD SEAT MAP FOR GIVEN HALL ---
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

  // --- SEAT HANDLING ---
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

  // --- FIELD VALIDATION HELPERS ---
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

  // --- FORM SUBMISSION ---
  onSubmit() {
    if (this.bookingForm.invalid) return;

    const userId = this.userId;
    if (!userId) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    this.isLoading.set(true);
    this.apiError.set('');
    this.successMessage.set('');

    const formValue = this.bookingForm.getRawValue();

    const payload = {
      userId,
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
        this.bookingDataService.reset();
      },
      error: (err) => {
        if (err?.status === 409) {
          this.apiError.set(
            'Un ou plusieurs sièges sélectionnés ne sont plus disponibles. Veuillez recharger la page ou choisir d’autres sièges.'
          );
        } else {
          this.apiError.set(
            'Erreur lors de la création : ' + (err?.error?.message || '')
          );
        }
        this.isLoading.set(false);
      },
    });
  }

  // --- GET USER ID FROM AUTH FACADE ---
  get userId(): string | null {
    const user = this.authFacade.user();
    return user?.userId ?? null;
  }
}
