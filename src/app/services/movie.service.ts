/**
 * MovieService
 * --------------------------------------------------------------------------
 * Service responsible for communicating with the backend API for movie-related
 * operations such as retrieving, searching, creating movies, and fetching
 * associated comments.
 *
 * It handles the backend's response format, including a fallback for a known
 * typo where the field `data` may be incorrectly returned as `date`.
 *
 * This service uses Angular Signals to store global movie state for
 * easy reactive consumption in components.
 * --------------------------------------------------------------------------
 */

import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { Movie } from '../models/movie.model';
import { MovieComment } from '../models/movieComment.model';
import { ApiEnvelope } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class MovieService {
  /** Base URL for movie-related endpoints */
  private baseUrl = `${environment.apiUrl}movies/`;

  /** Signal holding the most recently fetched filtered movies */
  public filteredMovies = signal<Movie[]>([]);

  /** Signal holding all movies fetched from the API */
  public allMovies = signal<Movie[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * Unwraps the API envelope to extract the actual data payload.
   * Supports both `{ data }` and `{ date }` formats.
   * @param res API envelope object
   * @returns The extracted payload of type `T`
   */
  private unwrap<T>(res: ApiEnvelope<T>): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (res as any).data ?? (res as any).date;
  }

  /**
   * Retrieves all movies from the backend.
   * Also updates the `allMovies` signal.
   * @returns Observable emitting the list of movies.
   */
  getAllMovies(): Observable<Movie[]> {
    const url = `${environment.apiUrl}movies`;
    const obs = this.http
      .get<ApiEnvelope<Movie[]>>(url, { withCredentials: true })
      .pipe(map((res) => this.unwrap<Movie[]>(res)));

    obs.subscribe((movies) => this.allMovies.set(movies));
    return obs;
  }

  /**
   * Retrieves details of a single movie by its ID.
   * @param movieId The UUID of the movie.
   * @returns Observable emitting the movie details.
   */
  getMovieById(movieId: string): Observable<Movie> {
    return this.http
      .get<ApiEnvelope<Movie>>(`${this.baseUrl}${movieId}`, {
        withCredentials: true,
      })
      .pipe(map((res) => this.unwrap<Movie>(res)));
  }

  /**
   * Retrieves upcoming movies with release dates in the future.
   * @returns Observable emitting an array of upcoming movies.
   */
  getUpcommingMovies(): Observable<Movie[]> {
    return this.http
      .get<ApiEnvelope<Movie[]>>(`${this.baseUrl}upcoming`, {
        withCredentials: true,
      })
      .pipe(map((res) => this.unwrap<Movie[]>(res)));
  }

  /**
   * Retrieves all movies being screened at a specific theater.
   * @param theaterId The UUID of the theater.
   * @returns Observable emitting the list of movies for the given theater.
   */
  getMoviesByTheater(theaterId: string): Observable<Movie[]> {
    const url = `${this.baseUrl}theater/${theaterId}`;
    return this.http
      .get<ApiEnvelope<Movie[]>>(url, { withCredentials: true })
      .pipe(map((res) => this.unwrap<Movie[]>(res)));
  }

  /**
   * Searches for movies based on provided filters.
   * Also updates the `filteredMovies` signal.
   * @param filters Optional search filters.
   * @returns Observable emitting an array of movies matching the criteria.
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
    if (filters.recommended !== undefined) {
      params = params.set('recommended', String(filters.recommended));
    }

    const obs = this.http
      .get<ApiEnvelope<Movie[]>>(`${this.baseUrl}search`, {
        params,
        withCredentials: true,
      })
      .pipe(map((res) => this.unwrap<Movie[]>(res)));

    obs.subscribe((movies) => this.filteredMovies.set(movies));
    return obs;
  }

  /**
   * Sends a request to create a new movie.
   * Accepts either a plain `Movie` object or a `FormData` instance
   * (useful for file uploads).
   * @param movie Movie details or FormData containing the movie.
   * @returns Observable emitting the created movie.
   */
  addMovie(movie: Movie | FormData): Observable<Movie> {
    return this.http
      .post<ApiEnvelope<Movie>>(this.baseUrl, movie, { withCredentials: true })
      .pipe(map((res) => this.unwrap<Movie>(res)));
  }

  /**
   * Retrieves all comments associated with a specific movie.
   * @param movieId The UUID of the movie.
   * @returns Observable emitting an array of `MovieComment` objects.
   */
  getCommentsByMovie(movieId: string): Observable<MovieComment[]> {
    const url = `${this.baseUrl}${movieId}/comments`;
    return this.http
      .get<ApiEnvelope<MovieComment[]>>(url, { withCredentials: true })
      .pipe(map((res) => this.unwrap<MovieComment[]>(res)));
  }
}
