import {
  Component,
  OnInit,
  DestroyRef,
  signal,
  computed,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Movie } from '../../../models/movie.model';
import { BookingNumber, MovieStats } from '../../../models/movie-stats.model';
import { MovieService } from '../../../services/movie.service';
import { DashboardService } from '../../../services/daschboard.service';

import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    ReactiveFormsModule,
    NgxChartsModule,
  ],
})
export class Dashboard implements OnInit {
  // List of all movies, as a signal (for template reactivity)
  movies = signal<Movie[]>([]);
  // Currently selected movieId
  selectedMovieId = signal<string | null>(null);
  // Stats for selected movie (signal)
  stats = signal<MovieStats | null>(null);

  // Responsive chart width (as a signal)
  viewWidth = signal(this.getResponsiveWidth());
  view: [number, number] = [this.viewWidth(), 400];

  // Color scheme for ngx-charts
  colorScheme = {
    domain: ['#1e88e5'],
  };

  constructor(
    private movieService: MovieService,
    private dashboardService: DashboardService,
    private destroyRef: DestroyRef,
    private cdr: ChangeDetectorRef
  ) {}

  // Responsive chart resizing on window resize
  @HostListener('window:resize')
  onResize() {
    this.viewWidth.set(this.getResponsiveWidth());
    this.view = [this.viewWidth(), 400];
    setTimeout(() => this.cdr.markForCheck());
  }

  /** Calculate chart width based on window size */
  getResponsiveWidth(): number {
    const w = window.innerWidth;
    if (w < 600) return Math.max(w - 40, 320);
    if (w < 900) return 500;
    if (w < 1200) return 700;
    return 900;
  }

  /**
   * Chart data for ngx-charts.
   * Always returns 7 days, sorted, with 0 for missing.
   */
  lineChartData = computed(() => {
    const stats = this.stats();
    if (!stats || !stats.bookingNumbers?.length) return [];
    return [
      {
        name: 'Bookings per day',
        series: stats.bookingNumbers
          .slice()
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((b) => ({ name: b.date, value: b.number })),
      },
    ];
  });

  ngOnInit(): void {
    // Responsive: recalc chart width on start (use timeout to avoid error)
    setTimeout(() => this.onResize());

    // Load all movies at startup
    this.movieService
      .getAllMovies()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((movies) => {
        // Avoid ExpressionChanged error by updating signal after tick
        setTimeout(() => {
          this.movies.set(movies);
          this.cdr.markForCheck();
        });
      });
  }

  /**
   * Handles movie selection:
   * Loads stats (or fills with 7 zeros on 404), always ensures 7 days.
   */
  onSelectMovie(movieId: string): void {
    this.selectedMovieId.set(movieId);
    this.dashboardService
      .getStatsByMovieId(movieId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          if (err.status === 404) {
            // Generate 7 days with zero bookings
            const today = new Date();
            const days = Array.from({ length: 7 }).map((_, i) => {
              const d = new Date(today);
              d.setDate(today.getDate() - (6 - i));
              const iso = d.toISOString().slice(0, 10);
              return { date: iso, number: 0 };
            });
            return of({
              movieId,
              bookingNumbers: days,
            } as MovieStats);
          }
          throw err;
        })
      )
      .subscribe((stats) => {
        // Always show the 7 most recent days, filling missing with 0
        const today = new Date();
        const sevenDays: BookingNumber[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const iso = d.toISOString().slice(0, 10);
          const found = stats.bookingNumbers.find((b) => b.date === iso);
          sevenDays.push({
            date: iso,
            number: found ? found.number : 0,
          });
        }
        // Update signal after tick to avoid change detection error
        setTimeout(() => {
          this.stats.set({
            movieId,
            bookingNumbers: sevenDays,
          });
          this.cdr.markForCheck();
        });
      });
  }
}
