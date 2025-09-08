import {
  Component,
  Signal,
  signal,
  effect,
  ViewChild,
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ScreeningService } from '../../../services/screening.service';
import { MovieService } from '../../../services/movie.service';
import { TheaterService } from '../../../services/theater.service';
import { HallService } from '../../../services/halls.service';
import { Movie } from '../../../models/movie.model';
import { Theater } from '../../../models/theater.model';
import { Hall } from '../../../models/hall.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-screenings',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSidenavModule,
    RouterModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './screenings.html',
  styleUrl: './screenings.css',
})
export class ScreeningsAdmin {
  @ViewChild('drawer') drawer!: MatDrawer;
  filterForm: FormGroup;
  apiError = signal<string>('');
  movies: Signal<Movie[]>;
  theaters: Signal<Theater[]>;
  halls = signal<Hall[]>([]);

  // <-- Ajoute un vrai signal !
  theaterIdSignal = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private screeningService: ScreeningService,
    private movieService: MovieService,
    private theaterService: TheaterService,
    private hallService: HallService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.movies = this.movieService.allMovies;
    this.theaters = this.theaterService.allTheaters;
    this.filterForm = this.fb.group({
      movieId: [''],
      theaterId: [''],
      hallId: [''],
      startTime: [''],
      quality: [''],
      priceMin: [''],
      priceMax: [''],
      recommended: [false],
    });

    // Chargement si vide
    if (
      !this.movieService.allMovies() ||
      this.movieService.allMovies().length === 0
    ) {
      this.movieService.getAllMovies().subscribe();
    }
    if (
      !this.theaterService.allTheaters() ||
      this.theaterService.allTheaters().length === 0
    ) {
      this.theaterService.getAllTheaters().subscribe();
    }

    // Synchronise le champ de formulaire avec le signal à chaque changement
    this.filterForm.get('theaterId')!.valueChanges.subscribe((theaterId) => {
      this.theaterIdSignal.set(theaterId);
    });

    // Effet réactif sur le signal (cette fois, ça marchera à chaque changement)
    effect(() => {
      // On vide toujours la liste des halls au début
      this.halls.set([]);
      this.filterForm.get('hallId')?.setValue('');

      const theaterId = this.theaterIdSignal();
      if (theaterId) {
        this.hallService.getHallsByTheaterId(theaterId).subscribe((halls) => {
          this.halls.set(halls ?? []);
        });
      }
    });
  }

  onSubmit() {
    const {
      movieId,
      theaterId,
      hallId,
      startTime,
      quality,
      priceMin,
      priceMax,
      recommended,
    } = this.filterForm.value;

    const filters: any = {};
    if (movieId) filters.movieId = movieId;
    if (theaterId) filters.theaterId = theaterId;
    if (hallId) filters.hallId = hallId;
    if (startTime) filters.startTime = startTime;
    if (quality) filters.quality = quality;
    if (priceMin) filters.priceMin = priceMin;
    if (priceMax) filters.priceMax = priceMax;
    if (recommended) filters.recommended = true;

    this.apiError.set('');

    this.screeningService.searchScreenings(filters).subscribe({
      next: () => {
        if (this.drawer) this.drawer.close();
        this.router.navigate(['search'], { relativeTo: this.route });
      },
      error: () => {
        this.apiError.set('Erreur lors de la récupération des séances.');
        this.screeningService.filteredScreenings.set([]);
      },
    });
  }

  onDrawerOpenedChange(opened: boolean) {
    if (opened) this.apiError.set('');
  }
}
