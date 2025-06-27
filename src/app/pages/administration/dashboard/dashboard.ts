import { Component, OnInit, DestroyRef, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Movie } from '../../../models/movie.model';
import { MovieStats } from '../../../models/movie-stats.model';
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
  movies = signal<Movie[]>([]);
  selectedMovieId = signal<string | null>(null);
  stats = signal<MovieStats | null>(null);

  view: [number, number] = [700, 400];

  colorScheme = {
    domain: ['#1e88e5'],
  };

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

  constructor(
    private movieService: MovieService,
    private dashboardService: DashboardService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.movieService
      .getAllMovies()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((movies) => {
        this.movies.set(movies);
      });
  }

  onSelectMovie(movieId: string): void {
    this.selectedMovieId.set(movieId);
    this.dashboardService
      .getStatsByMovieId(movieId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          if (err.status === 404) {
            // Generate 7 last days with zero
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
        // Fill missing days if backend data is incomplete
        const today = new Date();
        const sevenDays = [];
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
        this.stats.set({
          movieId,
          bookingNumbers: sevenDays,
        });
      });
  }
}
