import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  computed,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Movie } from '../../../models/movie.model';
import { MovieService } from '../../../services/movie.service';

import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
} from '@angular/animations';

@Component({
  selector: 'app-upcomming-movies-carousel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
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
      transition(':enter', [
        style({ opacity: 0 }),
        animate('800ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('400ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class UpcommingMoviesCarouselComponent implements OnInit, OnDestroy {
  private movieService = inject(MovieService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  movies = signal<Movie[]>([]);
  currentPage = signal(0);
  moviesPerPage = signal(1);
  resizeListener?: () => void;

  ngOnInit() {
    this.movieService
      .getUpcommingMovies()
      .subscribe((data) => this.movies.set(data));

    if (this.isBrowser) {
      this.setMoviesPerPage();
      this.resizeListener = () => this.setMoviesPerPage();
      window.addEventListener('resize', this.resizeListener);
    }
  }

  ngOnDestroy() {
    if (this.isBrowser && this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  setMoviesPerPage() {
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

  prev = () => {
    const prevPage =
      (this.currentPage() - 1 + this.totalPages()) % this.totalPages();
    this.currentPage.set(prevPage);
  };

  next = () => {
    const nextPage = (this.currentPage() + 1) % this.totalPages();
    this.currentPage.set(nextPage);
  };

  goToPage = (i: number) => this.currentPage.set(i);
}
