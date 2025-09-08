import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  computed,
  OnInit,
  OnDestroy,
  AfterViewInit,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';

import { Movie } from '../../../models/movie.model';
import { MovieService } from '../../../services/movie.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-upcomming-movies-carousel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule,RouterModule],
  templateUrl: './upcomming-movies-carousel.html',
  styleUrls: ['./upcomming-movies-carousel.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('carouselSlide', [
      transition(':increment', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '800ms cubic-bezier(.25,.8,.25,1)',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      transition(':decrement', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate(
          '800ms cubic-bezier(.25,.8,.25,1)',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
    ]),
  ],
})
export class UpcommingMoviesCarousel
  implements OnInit, AfterViewInit, OnDestroy
{
  private movieService = inject(MovieService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  movies = signal<Movie[]>([]);
  currentPage = signal(0);
  moviesPerPage = signal(1);
  isAnimating = signal(false);
  isReady = signal(false);
  hasRendered = signal(false);
  showCarousel = signal(false);

  resizeListener?: () => void;

  ngOnInit(): void {
    this.movieService.getUpcommingMovies().subscribe((data) => {
      this.movies.set(data);
      this.isReady.set(true);
    });

    if (this.isBrowser) {
      this.setMoviesPerPage();
      this.resizeListener = () => this.setMoviesPerPage();
      window.addEventListener('resize', this.resizeListener);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.hasRendered.set(true);
      setTimeout(() => {
        this.showCarousel.set(true);
      }, 50);
    });
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  setMoviesPerPage(): void {
    if (!this.isBrowser) return;
    const width = window.innerWidth;
    if (width >= 1200) {
      this.moviesPerPage.set(3);
    } else if (width >= 800) {
      this.moviesPerPage.set(2);
    } else {
      this.moviesPerPage.set(1);
    }
    this.currentPage.set(0);
  }

  totalPages = computed(() =>
    Math.ceil(this.movies().length / this.moviesPerPage())
  );

  visibleMovies = computed(() => {
    const start = this.currentPage() * this.moviesPerPage();
    return this.movies().slice(start, start + this.moviesPerPage());
  });

  prev = (): void => {
    if (this.isAnimating()) return;
    this.isAnimating.set(true);
    const prevPage =
      (this.currentPage() - 1 + this.totalPages()) % this.totalPages();
    this.currentPage.set(prevPage);
  };

  next = (): void => {
    if (this.isAnimating()) return;
    this.isAnimating.set(true);
    const nextPage = (this.currentPage() + 1) % this.totalPages();
    this.currentPage.set(nextPage);
  };

  goToPage = (i: number): void => {
    if (this.isAnimating()) return;
    this.isAnimating.set(true);
    this.currentPage.set(i);
  };

  onAnimationDone(): void {
    this.isAnimating.set(false);
  }

  trackByMovieId(index: number, movie: Movie): string {
    return movie.movieId;
  }
}
