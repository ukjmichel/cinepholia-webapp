import {
  Injectable,
  Inject,
  PLATFORM_ID,
  effect,
  signal,
  WritableSignal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface BookingFormData {
  movieId: string | null;
  theaterId: string | null;
  date: string | null;
  screeningId: string | null;
  // seatsNumber: number;      // <--- REMOVE
  // seatIds: string[];        // <--- REMOVE
  // totalPrice: number;       // <--- REMOVE
}

const STORAGE_KEY = 'bookingFormData_v1';

const initialState: BookingFormData = {
  movieId: null,
  theaterId: null,
  date: null,
  screeningId: null,
  // seatsNumber: 0,
  // seatIds: [],
  // totalPrice: 0,
};

@Injectable({ providedIn: 'root' })
export class NewBookingDataService {
  private isBrowser: boolean;
  private newBookingData: WritableSignal<BookingFormData>;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    let initial: BookingFormData = { ...initialState };
    if (this.isBrowser) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        // Only keep the fields you want (for migration safety)
        const parsed = JSON.parse(saved);
        initial = {
          movieId: parsed.movieId ?? null,
          theaterId: parsed.theaterId ?? null,
          date: parsed.date ?? null,
          screeningId: parsed.screeningId ?? null,
        };
      }
    }

    this.newBookingData = signal<BookingFormData>(initial);

    // Only persist in the browser
    if (this.isBrowser) {
      effect(() => {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(this.newBookingData())
        );
      });
    }
  }

  // Expose the signal as a readonly accessor
  get bookingFormData() {
    return this.newBookingData.asReadonly();
  }

  // Individual field selectors as getters
  get movieId() {
    return this.newBookingData().movieId;
  }
  get theaterId() {
    return this.newBookingData().theaterId;
  }
  get date() {
    return this.newBookingData().date;
  }
  get screeningId() {
    return this.newBookingData().screeningId;
  }

  // Setters
  setMovieId(id: string | null) {
    this.newBookingData.update((state) => ({ ...state, movieId: id }));
  }
  setTheaterId(id: string | null) {
    this.newBookingData.update((state) => ({ ...state, theaterId: id }));
  }
  setDate(date: string | null) {
    this.newBookingData.update((state) => ({ ...state, date }));
  }
  setScreeningId(id: string | null) {
    this.newBookingData.update((state) => ({ ...state, screeningId: id }));
  }

  // These are now removed:
  // setSeatsNumber(num: number) { ... }
  // setSeatIds(ids: string[]) { ... }
  // setTotalPrice(price: number) { ... }

  // Reset to initial state
  reset() {
    this.newBookingData.set({ ...initialState });
    if (this.isBrowser) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
