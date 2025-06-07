import { Component, input, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MovieService } from '../../../services/movie.service'; // <-- make sure the path is correct
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MoviesFilter } from "../../../filters/movies-filter/movies-filter";

@Component({
  selector: 'app-movies-admin',
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
    MoviesFilter
],
  templateUrl: './movies.html',
  styleUrl: './movies.css',
})
export class MoviesAdmin {
  readonly ageRatings = [
    'G',
    'PG',
    'PG-13',
    'R',
    'NC-17',
    'U',
    'UA',
    'A',
    'Not Rated',
  ];
  @ViewChild('drawer') drawer!: MatDrawer;
  filterForm: FormGroup;
  apiError = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private movieService: MovieService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filterForm = this.fb.group({
      movieId: [''],
      title: [''],
      genre: [''],
      ageRating: [''],
      director: [''],
      recommended: [''], // '' = all, true, false
    });
  }

  onSubmit() {
    const { movieId, title, genre, ageRating, director, recommended } =
      this.filterForm.value;

    // Optional: only build the filter object with filled values
    const filters: any = {};
    if (movieId) filters.movieId = movieId;
    if (title) filters.title = title;
    if (genre) filters.genre = genre;
    if (ageRating) filters.ageRating = ageRating;
    if (director) filters.director = director;
    if (recommended !== '')
      filters.recommended =
        recommended === 'true'
          ? true
          : recommended === 'false'
          ? false
          : undefined;

    this.apiError.set('');

    this.movieService.searchMovies(filters).subscribe({
      next: () => {
        if (this.drawer) this.drawer.close();
        this.router.navigate(['search'], { relativeTo: this.route });
      },
      error: () => {
        this.apiError.set('Erreur lors de la récupération des films.');
        this.movieService.filteredMovies.set([]);
      },
    });
  }

  onDrawerOpenedChange(opened: boolean) {
    if (opened) {
      this.apiError.set('');
    }
  }
}
