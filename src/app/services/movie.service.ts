import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { Movie } from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private baseUrl = `${environment.apiUrl}movies/`;

  public filteredMovies = signal<Movie[]>([]);
  public allMovies = signal<Movie[]>([]);

  constructor(private http: HttpClient) {}

  /** GET: Get all movies (no filter, returns everything) */
  getAllMovies(): Observable<Movie[]> {
    const url = `${environment.apiUrl}movies`;
    const obs = this.http
      .get<{ message: string; data: Movie[] }>(url, { withCredentials: true })
      .pipe(map((res) => res.data));

    obs.subscribe((movies) => {
      this.allMovies.set(movies);
    });

    return obs;
  }

  /**
   * GET: Get a single movie by its ID
   * @param movieId - The ID of the movie (as in /movies/:movieId)
   * @returns Observable<Movie>
   */
  getMovieById(movieId: string): Observable<Movie> {
    return this.http
      .get<{ message: string; data: Movie }>(`${this.baseUrl}${movieId}`, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  /**
   * GET: Get a single movie by its ID
   * @returns Observable<Movie[]>
   */
  getUpcommingMovies(): Observable<Movie[]> {
    return this.http
      .get<{ message: string; data: Movie[] }>(`${this.baseUrl}upcoming`, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  /**
   * Search movies by filters
   * @param filters - Object of search fields
   * @returns Observable<Movie[]>
   */
  searchMovies(filters: {
    movieId?: string;
    title?: string;
    genre?: string;
    ageRating?: string;
    releaseDate?: string; // ISO string for query param
    director?: string;
    recommended?: boolean;
  }): Observable<Movie[]> {
    let params = new HttpParams();
    if (filters.movieId) params = params.set('movieId', filters.movieId);
    if (filters.title) params = params.set('title', filters.title);
    if (filters.genre) params = params.set('genre', filters.genre);
    if (filters.ageRating) params = params.set('ageRating', filters.ageRating);
    if (filters.releaseDate)
      params = params.set('releaseDate', filters.releaseDate);
    if (filters.director) params = params.set('director', filters.director);
    if (filters.recommended !== undefined)
      params = params.set('recommended', String(filters.recommended));

    const obs = this.http
      .get<{ message: string; data: Movie[] }>(`${this.baseUrl}search`, {
        params,
      })
      .pipe(map((res) => res.data));
    obs.subscribe((movies) => {
      this.filteredMovies.set(movies);
    });

    return obs;
  }

  /** POST: Add a new movie */
  addMovie(movie: Movie | FormData): Observable<Movie> {
    return this.http.post<Movie>(this.baseUrl, movie, {
      withCredentials: true,
    });
  }
}
