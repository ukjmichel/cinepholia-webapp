import { Component, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MovieComment } from '../../../../models/movieComment.model';
import { MovieService } from '../../../../services/movie.service';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-movie-comments',
  standalone: true,
  templateUrl: './movie-comments.html',
  styleUrl: './movie-comments.css',
  imports: [CommonModule, MatIconModule],
})
export class MovieComments implements OnInit {
  /** Movie ID provided by parent component */
  movieId = input.required<string>();

  /** Holds the comments retrieved from API */
  comments = signal<MovieComment[]>([]);
  /** Currently displayed comment index */
  currentIndex = signal(0);

  constructor(private movieService: MovieService) {}

  ngOnInit() {
    const id = this.movieId();
    if (id) {
      this.movieService.getCommentsByMovie(id).subscribe({
        next: (data) => this.comments.set(data),
        error: (err) => console.error('Error fetching comments:', err),
      });
    }
  }

  /** Navigate to previous comment */
  prevComment() {
    const total = this.comments().length;
    if (total > 0) {
      this.currentIndex.set((this.currentIndex() - 1 + total) % total);
    }
  }

  /** Navigate to next comment */
  nextComment() {
    const total = this.comments().length;
    if (total > 0) {
      this.currentIndex.set((this.currentIndex() + 1) % total);
    }
  }

  /** Generates an array of stars (★ and ☆) for the rating */
  getStars(rating: number): string[] {
    return Array(rating)
      .fill('★')
      .concat(Array(5 - rating).fill('☆'));
  }

  /**
   * ✅ Sanitizes user comments to prevent XSS.
   * - Uses DOMPurify to remove dangerous HTML/JS.
   * - Allows only plain text by default (no tags).
   */
  sanitizeComment(comment: string): string {
    return DOMPurify.sanitize(comment, {
      ALLOWED_TAGS: [], // no HTML tags allowed
      ALLOWED_ATTR: [], // no attributes allowed
    });
  }
}
