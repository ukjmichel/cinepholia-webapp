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
import { ScreeningAttributes, ScreeningWithDetails } from '../../../models/screening.model';
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
  bookingForm: FormGroup;

  // UI signals for loading & error/success messages
  isLoading = signal(false);
  apiError = signal('');
  successMessage = signal('');

  // Data signals for loaded lists & selections
  movies: Signal<Movie[]>;
  theaters: Signal<Theater[]>;
  screenings = signal<ScreeningWithDetails[]>([]);
  halls = signal<Hall[]>([]);
  seatsLayout = signal<string[][]>([]);
  selectedSeats = signal<string[]>([]);
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
    private route: ActivatedRoute,
    private bookingDataService: NewBookingDataService
  ) {
    this.movies = this.movieService.allMovies;
    this.theaters = this.theaterService.allTheaters;

    this.bookingForm = this.createBookingForm();

    // Load persisted form data if any, set form controls step-by-step
    this.loadPersistedState();

    // Fetch movies and theaters if needed
    this.initMovieAndTheaterLoad();

    // Handle URL query parameters
    this.handleQueryParams();

    // Persist form data & load screenings when inputs change
    this.setupFormListeners();

    // Listen to screeningId changes to load seats and booked seats
    this.setupScreeningIdListener();

    // Sync seat selection count and total price in form controls
    this.setupSeatSelectionSync();
  }

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

  private loadPersistedState() {
    const persisted = this.bookingDataService.bookingFormData();
    if (persisted) {
      if (persisted.movieId) {
        this.bookingForm.get('movieId')!.setValue(persisted.movieId);
      }
      if (persisted.theaterId) {
        this.bookingForm.get('theaterId')!.setValue(persisted.theaterId);
      }
      if (persisted.date) {
        this.bookingForm.get('date')!.setValue(persisted.date);
      }
      if (persisted.screeningId) {
        this.bookingForm.get('screeningId')!.setValue(persisted.screeningId);
      }

      if (persisted.movieId && persisted.theaterId && persisted.date) {
        const screeningId = persisted.screeningId || undefined;
        setTimeout(() => this.loadScreenings(screeningId));
      }
    }
  }

  private initMovieAndTheaterLoad() {
    if (!this.movies() || this.movies().length === 0) {
      this.movieService.getAllMovies().subscribe();
    }
    if (!this.theaters() || this.theaters().length === 0) {
      this.theaterService.getAllTheaters().subscribe();
    }
  }

  private handleQueryParams() {
    this.route.queryParams.subscribe((params) => {
      const movieId = params['movieId'] ?? '';
      const theaterId = params['theaterId'] ?? '';
      const screeningId = params['screeningId'] ?? '';
      const dateParam = params['screeningDate'] ?? params['date'] ?? '';

      const parsedDate = this.parseDate(dateParam);

      effect(() => {
        const moviesLoaded = this.movies() && this.movies().length > 0;
        const theatersLoaded = this.theaters() && this.theaters().length > 0;

        if (moviesLoaded && theatersLoaded) {
          if (movieId && this.bookingForm.get('movieId')!.value !== movieId) {
            this.bookingForm.get('movieId')!.setValue(movieId);
          }
          if (
            theaterId &&
            this.bookingForm.get('theaterId')!.value !== theaterId
          ) {
            this.bookingForm.get('theaterId')!.setValue(theaterId);
          }
          if (
            parsedDate &&
            (!this.bookingForm.get('date')!.value ||
              new Date(this.bookingForm.get('date')!.value)
                .toISOString()
                .slice(0, 10) !== parsedDate.toISOString().slice(0, 10))
          ) {
            this.bookingForm.get('date')!.setValue(parsedDate);
          }

          if (
            this.bookingForm.get('movieId')!.valid &&
            this.bookingForm.get('theaterId')!.valid &&
            this.bookingForm.get('date')!.valid
          ) {
            this.loadScreenings(screeningId);
          }
        }
      });
    });
  }

  private parseDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);
    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  }

  private setupFormListeners() {
    this.bookingForm.valueChanges.subscribe((values) => {
      this.bookingDataService.setMovieId(values.movieId || null);
      this.bookingDataService.setTheaterId(values.theaterId || null);
      this.bookingDataService.setDate(values.date || null);
      this.bookingDataService.setScreeningId(values.screeningId || null);
    });

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

            // Normalize whatever the API returns to string[] of seatIds
            this.screeningService.getBookedSeats(screeningId).subscribe({
              next: (payload: unknown) => {
                const ids = this.normalizeBookedSeatIds(payload);
                this.bookedSeatIds.set(ids);
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

  private setupSeatSelectionSync() {
    effect(() => {
      const selected = this.selectedSeats();
      this.bookingForm
        .get('seatsNumber')!
        .setValue(selected.length, { emitEvent: false });
      this.bookingForm
        .get('seatIds')!
        .setValue(selected.join(', '), { emitEvent: false });

      const screeningId = this.bookingForm.get('screeningId')!.value;
      const screening = this.screenings().find(
        (s) => s.screeningId === screeningId
      );
      if (screening) {
        this.bookingForm
          .get('totalPrice')!
          .setValue(selected.length * screening.price, { emitEvent: false });
      } else {
        this.bookingForm.get('totalPrice')!.setValue(0, { emitEvent: false });
      }
    });
  }

  loadScreenings(selectedScreeningId?: string) {
    const movieId = this.bookingForm.get('movieId')!.value;
    const theaterId = this.bookingForm.get('theaterId')!.value;
    const dateObj = this.bookingForm.get('date')!.value;

    function getLocalDateString(date: Date): string {
      return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-');
    }

    if (movieId && theaterId && dateObj) {
      const filterDateStr = getLocalDateString(new Date(dateObj));

      this.screeningService
        .searchScreenings({ movieId, theaterId, date: filterDateStr })
        .subscribe({
          next: (screenings) => {
            const uniqueMap = new Map<string, ScreeningWithDetails>();
            screenings.forEach((s) => uniqueMap.set(s.screeningId, s));
            let uniqueScreenings = Array.from(uniqueMap.values());

            uniqueScreenings = uniqueScreenings.filter((s) => {
              const local = new Date(s.startTime);
              const localDay = getLocalDateString(local);
              return localDay === filterDateStr;
            });

            this.screenings.set(uniqueScreenings);

            if (
              selectedScreeningId &&
              uniqueScreenings.some(
                (s) => s.screeningId === selectedScreeningId
              )
            ) {
              setTimeout(() =>
                this.bookingForm
                  .get('screeningId')!
                  .setValue(selectedScreeningId)
              );
            } else {
              setTimeout(() =>
                this.bookingForm.get('screeningId')!.setValue('')
              );
            }

            this.seatsLayout.set([]);
            this.selectedSeats.set([]);
            this.bookedSeatIds.set([]);
          },
          error: () => {
            this.screenings.set([]);
            this.seatsLayout.set([]);
            this.selectedSeats.set([]);
            this.bookedSeatIds.set([]);
            this.bookingForm.get('screeningId')!.setValue('');
          },
        });
    } else {
      this.screenings.set([]);
      this.seatsLayout.set([]);
      this.selectedSeats.set([]);
      this.bookingForm.get('screeningId')!.setValue('');
      this.bookedSeatIds.set([]);
    }
  }

  loadHallSeats(hallId: string) {
    const theaterId = this.bookingForm.get('theaterId')!.value;
    if (!theaterId || !hallId) {
      this.seatsLayout.set([]);
      this.selectedSeats.set([]);
      return;
    }

    this.hallService.searchHall(theaterId, hallId).subscribe({
      next: (halls) => {
        const hall = halls[0];
        if (hall && hall.seatsLayout) {
          const layoutStr = hall.seatsLayout.map((row: any[]) =>
            row.map((seat) => seat.toString())
          );
          this.seatsLayout.set(layoutStr);
          this.selectedSeats.set([]);
        } else {
          this.seatsLayout.set([]);
          this.selectedSeats.set([]);
        }
      },
      error: () => {
        this.seatsLayout.set([]);
        this.selectedSeats.set([]);
      },
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
    if (ctrl.errors['required']) return 'This field is required';
    if (ctrl.errors['min']) return 'Value is too low';
    return 'Invalid field';
  }

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
        this.successMessage.set('Booking created successfully!');
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
            'One or more selected seats are no longer available. Please reload or select different seats.'
          );
        } else {
          this.apiError.set(
            'Error creating booking: ' + (err?.error?.message || '')
          );
        }
        this.isLoading.set(false);
      },
    });
  }

  get userId(): string | null {
    const user = this.authFacade.user();
    return user?.userId ?? null;
  }

  trackByScreeningId(index: number, screening: ScreeningWithDetails) {
    return screening.screeningId;
  }

  /** Normalize booked-seats API responses to string[] of seatIds */
  private normalizeBookedSeatIds(input: unknown): string[] {
    try {
      if (Array.isArray(input)) {
        if (input.length === 0) return [];
        if (typeof input[0] === 'string') return input as string[];
        return (input as any[])
          .map((x) =>
            'seatId' in (x ?? {}) ? String((x as any).seatId) : String(x)
          )
          .filter(Boolean);
      }
      const data = (input as any)?.data;
      if (Array.isArray(data)) {
        if (data.length === 0) return [];
        if (typeof data[0] === 'string') return data as string[];
        return (data as any[])
          .map((x) =>
            'seatId' in (x ?? {}) ? String((x as any).seatId) : String(x)
          )
          .filter(Boolean);
      }
    } catch {
      // swallow normalization errors; return empty list
    }
    return [];
  }
}
