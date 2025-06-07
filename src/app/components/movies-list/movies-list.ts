import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

import { MatIconModule } from '@angular/material/icon';
import { MovieService } from '../../services/movie.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule,RouterModule],
  templateUrl: './movies-list.html',
  styleUrl: './movies-list.css',
})
export class MoviesList {
  movieService = inject(MovieService);
  filteredMovies = this.movieService.filteredMovies;

  constructor() {
    effect(() => {
      console.log('Movie list updated:', this.filteredMovies());
    });
  }
}
