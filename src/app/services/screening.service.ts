/**
 * ScreeningService
 * ------------------------------------------------------------
 * Angular service for searching, fetching, and creating screenings.
 * All HTTP responses are expected to be shaped as:
 *   { message: string; data: T }
 * The service unwraps `data` for consumers and keeps a `signal`
 * with the latest filtered screenings.
 */

import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { ScreeningWithDetails } from '../models/screening.model';

/** Generic API response wrapper used by the backend. */
interface ApiResponse<T> {
  message: string;
  data: T;
}

/** Response shapes used by this service. */
type ScreeningListResponse = ApiResponse<ScreeningWithDetails[]>;
type ScreeningResponse = ApiResponse<ScreeningWithDetails>;
type BookedSeatsResponse = ApiResponse<string[]>;

/** Payload for creating a new screening. */
export interface CreateScreeningPayload {
  movieId: string;
  theaterId: string;
  hallId: string;
  /** ISO string, e.g. "2025-07-01T20:00:00Z" */
  startTime: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class ScreeningService {
  private readonly baseUrl = `${environment.apiUrl}screenings/`;

  /** Reactive store for filtered screenings (search results). */
  public readonly filteredScreenings = signal<ScreeningWithDetails[]>([]);

  constructor(private http: HttpClient) {}

  // -------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------

  /**
   * Search screenings with optional filters.
   *
   * Supported filters: movieId, theaterId, hallId, startTime, date,
   * priceMin, priceMax, recommended.
   *
   * Adds a cache-busting `_ts` param to avoid stale caches.
   *
   * @param filters Search criteria
   * @returns Observable that emits the unwrapped screenings array
   */
  searchScreenings(filters: {
    movieId?: string;
    theaterId?: string;
    hallId?: string;
    startTime?: string;
    date?: string;
    priceMin?: number;
    priceMax?: number;
    recommended?: boolean;
  }): Observable<ScreeningWithDetails[]> {
    let params = new HttpParams();

    if (filters.movieId) params = params.set('movieId', filters.movieId);
    if (filters.theaterId) params = params.set('theaterId', filters.theaterId);
    if (filters.hallId) params = params.set('hallId', filters.hallId);
    if (filters.startTime) params = params.set('startTime', filters.startTime);
    if (filters.date) params = params.set('date', filters.date);
    if (filters.priceMin !== undefined) {
      params = params.set('priceMin', String(filters.priceMin));
    }
    if (filters.priceMax !== undefined) {
      params = params.set('priceMax', String(filters.priceMax));
    }
    if (filters.recommended !== undefined) {
      params = params.set('recommended', String(filters.recommended));
    }

    // Cache-buster
    params = params.set('_ts', Date.now().toString());

    return this.http
      .get<ScreeningListResponse>(`${this.baseUrl}search`, {
        params,
        withCredentials: true,
      })
      .pipe(
        map((res) => res.data),
        tap((screenings) => this.filteredScreenings.set(screenings))
      );
  }

  /**
   * Create a new screening.
   *
   * @param screening Payload describing the screening to create
   * @returns Observable emitting the created screening (unwrapped)
   */
  addScreening(
    screening: CreateScreeningPayload
  ): Observable<ScreeningWithDetails> {
    return this.http
      .post<ScreeningResponse>(this.baseUrl, screening, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  /**
   * Get the list of already-booked seats for a given screening.
   *
   * @param screeningId Screening identifier
   * @returns Observable emitting an array of seat identifiers (unwrapped)
   */
  getBookedSeats(screeningId: string): Observable<string[]> {
    return this.http
      .get<BookedSeatsResponse>(`${this.baseUrl}${screeningId}/booked-seats`, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  /**
   * Get a single screening by its unique ID.
   *
   * @param screeningId Screening identifier
   * @returns Observable emitting the screening (unwrapped)
   */
  getScreeningById(screeningId: string): Observable<ScreeningWithDetails> {
    return this.http
      .get<ScreeningResponse>(`${this.baseUrl}${screeningId}`, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }
}
