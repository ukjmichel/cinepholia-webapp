import {
  Component,
  ViewChild,
  OnInit,
  Signal,
  signal,
  computed,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';

import { TheaterService } from '../../services/theater.service';
import { Theater } from '../../models/theater.model';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';
import { ScreeningService } from '../../services/screening.service';
import { ScreeningAttributes } from '../../models/screening.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theater-movies-search-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSidenavModule,
    MatSelectModule,
    RouterModule,
  ],
  templateUrl: './theaters.html',
  styleUrls: ['./theaters.css'],
})
export class TheatersMoviesSearch implements OnInit {
  @ViewChild('drawer') drawer!: MatDrawer;

  filterForm: FormGroup;
  apiError = '';

  allTheaters: Signal<Theater[]>;

  fullMoviesByTheater = signal<Movie[]>([]);
  allMoviesByTheater = signal<Movie[]>([]);

  allScreenings = signal<ScreeningAttributes[]>([]);
  fullScreenings = signal<ScreeningAttributes[]>([]);

  allGenres = computed(() => {
    const movies = this.allMoviesByTheater();
    const genresSet = new Set(movies.map((m) => m.genre).filter(Boolean));
    return Array.from(genresSet).sort();
  });

  screeningDates = computed(() => {
    const datesSet = new Set(
      this.allScreenings()
        .map((s: ScreeningAttributes) => {
          if (!s.startTime) return '';

          if (s.startTime instanceof Date) {
            return s.startTime.toISOString().slice(0, 10);
          } else if (typeof s.startTime === 'string') {
            return (s.startTime as string).slice(0, 10);
          }
          return '';
        })
        .filter(Boolean)
    );
    return Array.from(datesSet).sort();
  });

  constructor(
    private fb: FormBuilder,
    private theaterService: TheaterService,
    private router: Router,
    private route: ActivatedRoute,
    private movieService: MovieService,
    private screeningService: ScreeningService
  ) {
    this.filterForm = this.fb.group({
      theaterId: [''],
      postalCode: [''],
      city: [''],
      genre: [''],
      movieId: [''],
      screeningDate: [''],
      screeningId: [''],
    });

    this.allTheaters = this.theaterService.allTheaters;
  }

  ngOnInit() {
    if (!this.allTheaters() || this.allTheaters().length === 0) {
      this.theaterService.getAllTheaters().subscribe();
    }
  }

  onSubmit() {
    if (
      !this.filterForm.value.theaterId &&
      !this.filterForm.value.postalCode &&
      !this.filterForm.value.city &&
      !this.filterForm.value.movieId &&
      !this.filterForm.value.genre &&
      !this.filterForm.value.screeningDate &&
      !this.filterForm.value.screeningId
    ) {
      this.apiError = 'Veuillez remplir au moins un champ pour filtrer.';
      return;
    }
    this.apiError = '';

    const filters: {
      theaterId?: string;
      city?: string;
      postalCode?: string;
      genre?: string;
      movieId?: string;
      screeningDate?: string;
      screeningId?: string;
    } = {};

    const {
      theaterId,
      postalCode,
      city,
      genre,
      movieId,
      screeningDate,
      screeningId,
    } = this.filterForm.value;

    if (theaterId) filters.theaterId = theaterId;
    if (postalCode) filters.postalCode = postalCode;
    if (city) filters.city = city;
    if (genre) filters.genre = genre;
    if (movieId) filters.movieId = movieId;
    if (screeningDate) filters.screeningDate = screeningDate;
    if (screeningId) filters.screeningId = screeningId;

    this.theaterService.searchMovieTheaters(filters).subscribe({
      next: () => {
        if (this.drawer) this.drawer.close();
        this.router.navigate(['search'], { relativeTo: this.route });
      },
      error: () => {
        this.apiError = 'Erreur lors de la récupération des cinémas.';
        this.theaterService.filteredTheaters.set([]);
      },
    });
  }

  onDrawerOpenedChange(opened: boolean) {
    if (opened) this.apiError = '';
  }

  onTheaterChange(theaterId: string) {
    this.filterForm.patchValue({
      movieId: '',
      genre: '',
      screeningDate: '',
      screeningId: '',
    });

    if (theaterId) {
      this.movieService.getMoviesByTheater(theaterId).subscribe((movies) => {
        this.fullMoviesByTheater.set(movies);
        this.allMoviesByTheater.set(movies);
      });
    } else {
      this.fullMoviesByTheater.set([]);
      this.allMoviesByTheater.set([]);
      this.allScreenings.set([]);
      this.fullScreenings.set([]);
    }
  }

  onGenreChange(selectedGenre: string) {
    this.filterForm.patchValue({
      movieId: '',
      screeningDate: '',
      screeningId: '',
    });

    if (selectedGenre) {
      const filtered = this.fullMoviesByTheater().filter(
        (movie) => movie.genre === selectedGenre
      );
      this.allMoviesByTheater.set(filtered);
    } else {
      this.allMoviesByTheater.set(this.fullMoviesByTheater());
    }
    this.allScreenings.set([]);
    this.fullScreenings.set([]);
  }

  onMovieChange(selectedMovieId: string) {
    this.filterForm.patchValue({ screeningDate: '', screeningId: '' });

    if (selectedMovieId) {
      const selectedMovie = this.allMoviesByTheater().find(
        (m) => m.movieId === selectedMovieId
      );
      if (selectedMovie) {
        this.filterForm.patchValue({ genre: selectedMovie.genre });
      }

      const theaterId = this.filterForm.value.theaterId;
      if (theaterId) {
        this.screeningService
          .searchScreenings({ movieId: selectedMovieId, theaterId })
          .subscribe((screenings) => {
            const uniqueScreenings = this.removeDuplicateScreenings(screenings);
            this.fullScreenings.set(uniqueScreenings);
            this.allScreenings.set(uniqueScreenings);
          });
      } else {
        this.fullScreenings.set([]);
        this.allScreenings.set([]);
      }
    } else {
      this.fullScreenings.set([]);
      this.allScreenings.set([]);
    }
  }

  onScreeningDateChange(selectedDate: string) {
    this.filterForm.patchValue({ screeningId: '' });

    if (selectedDate) {
      const filtered = this.fullScreenings().filter((s) => {
        const dateStr =
          typeof s.startTime === 'string'
            ? (s.startTime as string).slice(0, 10)
            : s.startTime instanceof Date
            ? s.startTime.toISOString().slice(0, 10)
            : '';
        return dateStr === selectedDate;
      });
      this.allScreenings.set(filtered);
    } else {
      this.allScreenings.set(this.fullScreenings());
    }
  }

  private removeDuplicateScreenings(
    screenings: ScreeningAttributes[]
  ): ScreeningAttributes[] {
    const map = new Map<string, ScreeningAttributes>();
    screenings.forEach((screening) => {
      if (!map.has(screening.screeningId)) {
        map.set(screening.screeningId, screening);
      }
    });
    return Array.from(map.values());
  }

  trackByTheaterId(index: number, theater: Theater): string {
    return theater.theaterId;
  }
  trackByMovieId(index: number, movie: Movie): string {
    return movie.movieId;
  }
  trackByScreeningId(index: number, screening: ScreeningAttributes): string {
    return screening.screeningId;
  }

  /**
   * Navigue vers la page de réservation /bookings/new-booking
   * en passant tous les filtres du formulaire en query params.
   */
  goToBooking() {
    const filters = this.filterForm.value;
    const queryParams: { [key: string]: string } = {};

    // Ajouter chaque filtre non vide aux query params
    for (const key of Object.keys(filters)) {
      const value = filters[key];
      if (value) {
        queryParams[key] = value;
      }
    }

    this.router.navigate(['/bookings', 'new-booking'], { queryParams });
  }

  /**
   * Navigue vers la page booking pour un cinéma cliqué,
   * en incluant au moins theaterId dans les query params.
   */
  goToBookings(theaterId: string) {
    this.router.navigate(['/bookings', 'new-booking'], {
      queryParams: { theaterId },
    });
  }
}
