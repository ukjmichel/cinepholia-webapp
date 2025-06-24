import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MovieService } from '../../../services/movie.service';
import { Movie } from '../../../models/movie.model';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-favorite-movie',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './favorite-movie.html',
  styleUrls: ['./favorite-movie.css'],
})
export class FavoriteMovie implements OnInit {
  movie?: Movie;
  loading = true;
  error?: string;

  constructor(
    private movieService: MovieService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.movieService.searchMovies({ recommended: true }).subscribe({
      next: (movies) => {
        if (movies.length > 0) {
          const randomIndex = Math.floor(Math.random() * movies.length);
          this.movie = movies[randomIndex];
        } else {
          this.error = 'No recommended movies found';
        }
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.error = 'Movie fetch failed';
        this.loading = false;
        this.cdRef.detectChanges();
      },
    });
  }

  onSubmit(): void {
    if (this.movie?.movieId) {
      this.router.navigate(['/bookings', 'new-booking'], {
        queryParams: { movieId: this.movie.movieId },
      });
    }
  }
}
