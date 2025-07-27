import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { Movie } from '../models/movie.model';
import { MovieComment } from '../models/movieComment.model';

/**
 * Interface representing a booking comment returned by the API.
 */

@Injectable({ providedIn: 'root' })
export class MovieService {
  private baseUrl = `${environment.apiUrl}movies/`;

  public filteredMovies = signal<Movie[]>([]);
  public allMovies = signal<Movie[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * Retrieves all movies from the backend.
   * @returns Observable emitting an array of movies.
   */
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
   * Retrieves a single movie by its ID.
   * @param movieId - The unique identifier of the movie.
   * @returns Observable emitting the movie details.
   */
  getMovieById(movieId: string): Observable<Movie> {
    return this.http
      .get<{ message: string; data: Movie }>(`${this.baseUrl}${movieId}`, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  /**
   * Retrieves upcoming movies (with a release date in the future).
   * @returns Observable emitting an array of upcoming movies.
   */
  getUpcommingMovies(): Observable<Movie[]> {
    return this.http
      .get<{ message: string; data: Movie[] }>(`${this.baseUrl}upcoming`, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  /**
   * Retrieves all movies being screened in a specific theater.
   * @param theaterId - The ID of the theater.
   * @returns Observable emitting an array of movies screened at the theater.
   */
  getMoviesByTheater(theaterId: string): Observable<Movie[]> {
    const url = `${this.baseUrl}theater/${theaterId}`;
    return this.http
      .get<{ message: string; data: Movie[] }>(url, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  /**
   * Searches for movies based on provided filters.
   * @param filters - Object containing optional search criteria.
   * @returns Observable emitting an array of movies matching the filters.
   */
  searchMovies(filters: {
    movieId?: string;
    title?: string;
    genre?: string;
    ageRating?: string;
    releaseDate?: string;
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

  /**
   * Sends a POST request to create a new movie.
   * @param movie - The movie object or FormData containing movie details.
   * @returns Observable emitting the created movie.
   */
  addMovie(movie: Movie | FormData): Observable<Movie> {
    return this.http.post<Movie>(this.baseUrl, movie, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves all comments associated with a given movie.
   * This calls the backend endpoint `/movies/:movieId/comments`.
   * @param movieId - The ID of the movie to retrieve comments for.
   * @returns Observable emitting an array of MovieComment.
   */
  getCommentsByMovie(movieId: string): Observable<MovieComment[]> {
    const url = `${this.baseUrl}${movieId}/comments`;
    return this.http
      .get<{ message: string; data: MovieComment[] }>(url, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }
}
