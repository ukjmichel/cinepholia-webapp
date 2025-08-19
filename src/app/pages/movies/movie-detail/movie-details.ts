import { Component, signal, effect, Signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MovieService } from '../../../services/movie.service';
import { Movie } from '../../../models/movie.model';
import { TheaterService } from '../../../services/theater.service';
import { Theater } from '../../../models/theater.model';
import { ScreeningService } from '../../../services/screening.service';
import { ScreeningWithDetails } from '../../../models/screening.model';
import { AuthFacade } from '../../../store/auth/auth.facade';

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MovieComments } from "./movie-comments/movie-comments";



@Component({
  selector: 'app-movie-detail',
  standalone: true,
  templateUrl: './movie-details.html',
  styleUrl: './movie-details.css',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatButtonModule,
    MovieComments
],
})
export class MovieDetails {
  // ------------------ Signals & State ------------------
  movie = signal<Movie | null>(null);
  isLoading = signal(true);
  error = signal('');
  isLogged: Signal<boolean>;

  theaters = signal<Theater[]>([]);
  selectedTheaterId = signal<string>(''); // The currently-selected theater
  selectedTheater = signal<Theater | null>(null);

  // Date management
  selectedDate = signal<string>(''); // yyyy-MM-dd format for API/filter
  selectedDateObj = signal<Date | null>(null); // actual Date object

  // Raw list of screenings returned from API (can contain extra or wrong dates)
  screeningsList: Signal<ScreeningWithDetails[]>;

  // ------------- FILTERED & DEDUPED SCREENINGS --------------
  /**
   * Show only unique screenings for the selected date (in local time).
   * This prevents bugs where backend returns screenings for more than the selected date.
   */
  filteredSortedScreenings = computed(() => {
    const screenings = this.screeningsList() ?? [];
    const dateStr = this.selectedDate();

    if (!dateStr) return [];

    // Keep only screenings on the selected date
    const filtered = screenings.filter((s) => {
      // If backend gives UTC string, use getUTCFullYear etc; else use local
      const screeningDate = new Date(s.startTime);
      // Format to yyyy-MM-dd for comparison
      const y = screeningDate.getFullYear();
      const m = String(screeningDate.getMonth() + 1).padStart(2, '0');
      const d = String(screeningDate.getDate()).padStart(2, '0');
      const screeningDay = `${y}-${m}-${d}`;
      return screeningDay === dateStr;
    });

    // Deduplicate by screeningId
    const uniqueMap = new Map<string, ScreeningWithDetails>();
    filtered.forEach((s) => uniqueMap.set(s.screeningId, s));

    // Sort by start time
    return Array.from(uniqueMap.values()).sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  });

  // ----------------------------------------------------------

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private theaterService: TheaterService,
    private screeningService: ScreeningService,
    private authFacade: AuthFacade
  ) {
    this.isLogged = authFacade.isLogged;
    this.screeningsList = this.screeningService.filteredScreenings;

    // Load movie on mount
    effect(() => {
      const id = this.route.snapshot.paramMap.get('movieId');
      if (!id) {
        this.error.set('ID de film manquant dans l’URL.');
        this.isLoading.set(false);
        return;
      }
      this.isLoading.set(true);
      this.movieService.getMovieById(id).subscribe({
        next: (result) => {
          this.movie.set(result);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Film introuvable');
          this.isLoading.set(false);
        },
      });
    });

    // Load theaters on mount
    this.theaterService.getAllTheaters().subscribe({
      next: (theaters) => this.theaters.set(theaters ?? []),
    });

    // Update selectedTheater object when selection changes
    effect(() => {
      const all = this.theaters();
      const id = this.selectedTheaterId();
      this.selectedTheater.set(all.find((t) => t.theaterId === id) ?? null);
    });

    // Whenever movie, theater, or date changes, reload screenings from API
    effect(() => {
      const movie = this.movie();
      const theaterId = this.selectedTheaterId();
      const date = this.selectedDate();

      if (!movie || !date) {
        // Don't search if not enough info
        this.screeningService.filteredScreenings.set([]);
        return;
      }

      // Always send date in yyyy-MM-dd to backend
      const filters: any = { movieId: movie.movieId, date };
      if (theaterId) filters.theaterId = theaterId;
      this.screeningService.searchScreenings(filters).subscribe();
    });
  }

  // ------------------- UI Actions -------------------

  // Called when the user picks a date in the date picker
  onDateChange(date: Date | null) {
    this.selectedDateObj.set(date);
    if (date && !isNaN(date.getTime())) {
      // Format date as yyyy-MM-dd (local time)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      this.selectedDate.set(`${year}-${month}-${day}`);
    } else {
      this.selectedDate.set('');
    }
  }

  // Go to booking page with correct params
  goToBooking(screening: ScreeningWithDetails) {
    const movieId = this.movie()?.movieId;
    const theaterId = this.selectedTheater()?.theaterId;
    const screeningId = screening.screeningId;

    if (movieId && theaterId && screeningId) {
      this.router.navigate(['/bookings', 'new-booking'], {
        queryParams: { movieId, theaterId, screeningId },
      });
    }
  }
}
