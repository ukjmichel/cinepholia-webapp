import { Component, signal, effect, Signal, computed } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MovieService } from '../../../services/movie.service';
import { Movie } from '../../../models/movie.model';
import { TheaterService } from '../../../services/theater.service';
import { Theater } from '../../../models/theater.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { ScreeningAttributes } from '../../../models/screening.model';
import { ScreeningService } from '../../../services/screening.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  templateUrl: './movie-details.html',
  styleUrl: './movie-details.css',
  imports: [
    MatCardModule,
    MatIconModule,
    CommonModule,
    MatProgressSpinnerModule,
    RouterModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
})
export class MovieDetails {
  // Signals for all your data/UI state
  movie = signal<Movie | null>(null);
  isLoading = signal(true);
  error = signal('');

  theaters = signal<Theater[]>([]);
  selectedTheaterId = signal<string>(''); // value from select dropdown
  selectedTheater = signal<Theater | null>(null);

  // Two signals for date:
  selectedDate = signal<string>(''); // API filter, format 'yyyy-MM-dd'
  selectedDateObj = signal<Date | null>(null); // Material Datepicker input

  screeningsList!: Signal<ScreeningAttributes[]>;

  // List of screenings, sorted by start time
  filteredSortedScreenings = computed(() => {
    const screenings = [...(this.screeningsList() ?? [])].sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    return screenings;
  });

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private theaterService: TheaterService,
    private screeningService: ScreeningService
  ) {
    // Link to the reactive screenings list from the service
    this.screeningsList = this.screeningService.filteredScreenings;

    // Fetch movie and theater data when the component mounts
    effect(() => {
      const id = this.route.snapshot.paramMap.get('movieId');
      if (id) {
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
      } else {
        this.error.set('ID de film manquant dans l’URL.');
        this.isLoading.set(false);
      }
    });

    // Fetch all theaters
    this.theaterService.getAllTheaters().subscribe({
      next: (theaters) => this.theaters.set(theaters ?? []),
    });

    // Effect to update the current selected theater object (for displaying address etc.)
    effect(() => {
      const all = this.theaters();
      const id = this.selectedTheaterId();
      this.selectedTheater.set(all.find((t) => t.theaterId === id) ?? null);
    });

    // Main effect to re-trigger API request whenever a filter (movie, theater, date) changes
    effect(() => {
      const movie = this.movie();
      const theaterId = this.selectedTheaterId();
      const date = this.selectedDate();

      // Debug log: you should see the date value here
      console.log('Triggering search. date:', date, 'theaterId:', theaterId);

      if (movie) {
        const filters: any = { movieId: movie.movieId };
        if (theaterId) filters.theaterId = theaterId;
        if (date) filters.date = date; // send 'date' (NOT 'startTime') to API
        this.screeningService.searchScreenings(filters).subscribe();
      }
    });
  }

  // Called when the user picks a date
  onDateChange(date: Date | null) {
    console.log('date:', date); // Should be a Date object or null
    this.selectedDateObj.set(date);

    if (date && !isNaN(date.getTime())) {
      // Format date to yyyy-MM-dd
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      this.selectedDate.set(`${year}-${month}-${day}`);
    } else {
      this.selectedDate.set('');
    }
  }
}
