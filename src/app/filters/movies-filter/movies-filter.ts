import {
  Component,
  effect,
  input,
  Signal,
  signal,
  ViewChild,
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
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-movies-filter',
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
  ],
  templateUrl: './movies-filter.html',
  styleUrl: './movies-filter.css',
})
export class MoviesFilter {
  // Liste des classifications d’âge proposées pour le filtre
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

  // Récupère la référence du drawer pour le manipuler
  @ViewChild('drawer') drawer!: MatDrawer;

  // Indique si l’utilisateur est staff (venant d’un input du parent)
  isStaff = input();

  // Formulaire réactif Angular pour les filtres de recherche
  filterForm: FormGroup;

  // Signal pour afficher une erreur d’API éventuelle
  apiError = signal<string>('');

  // Signal contenant la liste de tous les films
  allMovies: Signal<Movie[]>;

  constructor(
    private fb: FormBuilder,
    private movieService: MovieService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // On pointe vers la source de vérité des films (Signal du service)
    this.allMovies = this.movieService.allMovies;

    // Création du formulaire avec tous les champs possibles pour filtrer
    this.filterForm = this.fb.group({
      movieId: [''],
      title: [''],
      genre: [''],
      ageRating: [''],
      director: [''],
      recommended: [''], // '' = tous, true = recommandés, false = non
    });

    // 👇 L’effet DOIT être dans le constructeur (et pas dans onSubmit)
    effect(() => {
      // Si la liste des films n'est pas chargée, on la charge
      if (!this.allMovies() || this.allMovies().length === 0) {
        this.movieService.getAllMovies().subscribe();
      }
    });
  }

  /** Appelé quand on valide le formulaire de filtre */
  onSubmit() {
    // Réinitialise la liste pour effacer l’affichage précédent
    this.movieService.filteredMovies.set([]);

    const { movieId, title, genre, ageRating, director, recommended } =
      this.filterForm.value;

    // Préparation de l’objet de filtre (on ignore les champs vides)
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

    // On efface l’erreur si existante
    this.apiError.set('');

    // On déclenche la recherche via le MovieService
    this.movieService.searchMovies(filters).subscribe({
      next: () => {
        // Si OK : on ferme le drawer et on redirige sur la page "search"
        if (this.drawer) this.drawer.close();
        this.router.navigate(['search'], { relativeTo: this.route });
      },
      error: () => {
        // Si erreur : message et liste vidée
        this.apiError.set('Erreur lors de la récupération des films.');
        this.movieService.filteredMovies.set([]);
      },
    });
  }

  /** Lorsqu’on ouvre le drawer (side panel), on réinitialise l’erreur */
  onDrawerOpenedChange(opened: boolean) {
    if (opened) {
      this.apiError.set('');
    }
  }
}
