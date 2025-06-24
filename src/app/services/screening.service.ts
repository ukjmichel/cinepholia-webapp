import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment'; // Adjust path as needed
import { ScreeningAttributes } from '../models/screening.model';

// Type for creating a new screening
export interface CreateScreeningPayload {
  movieId: string;
  theaterId: string;
  hallId: string;
  startTime: string; // ISO date string, e.g. "2025-07-01T20:00:00Z"
  price: number;
  quality: string; // "IMAX", "2D", etc.
}

@Injectable({ providedIn: 'root' })
export class ScreeningService {
  private baseUrl = `${environment.apiUrl}screenings/`;

  // State signal for components to subscribe to screening list changes
  public filteredScreenings = signal<ScreeningAttributes[]>([]);

  constructor(private http: HttpClient) {}

  // -------------------------------------------------------------------
  // Public API Methods
  // -------------------------------------------------------------------

  /**
   * Search screenings with filters.
   * Supported filters: movieId, theaterId, hallId, startTime, date,
   * priceMin, priceMax, quality, recommended.
   * Always adds a cache-busting timestamp so no 304/cached results.
   */
  searchScreenings(filters: {
    movieId?: string;
    theaterId?: string;
    hallId?: string;
    startTime?: string;
    date?: string;
    priceMin?: number;
    priceMax?: number;
    quality?: string;
    recommended?: boolean;
  }): Observable<ScreeningAttributes[]> {
    let params = new HttpParams();

    // Build search params
    if (filters.movieId) params = params.set('movieId', filters.movieId);
    if (filters.theaterId) params = params.set('theaterId', filters.theaterId);
    if (filters.hallId) params = params.set('hallId', filters.hallId);
    if (filters.startTime) params = params.set('startTime', filters.startTime);
    if (filters.date) params = params.set('date', filters.date);
    if (filters.quality) params = params.set('quality', filters.quality);
    if (filters.priceMin !== undefined)
      params = params.set('priceMin', String(filters.priceMin));
    if (filters.priceMax !== undefined)
      params = params.set('priceMax', String(filters.priceMax));
    if (filters.recommended !== undefined)
      params = params.set('recommended', String(filters.recommended));

    // Cache buster: always unique, disables cache on server and browser
    params = params.set('_ts', Date.now().toString());

    // HTTP request
    const obs = this.http
      .get<{ message: string; data: ScreeningAttributes[] }>(
        `${this.baseUrl}search`,
        { params }
      )
      .pipe(map((res) => res.data));

    // Update signal automatically (side effect for consumers)
    obs.subscribe((screenings) => this.filteredScreenings.set(screenings));

    return obs;
  }

  /**
   * Add a new screening to the database.
   */
  addScreening(screening: CreateScreeningPayload): Observable<any> {
    return this.http.post<any>(this.baseUrl, screening, {
      withCredentials: true,
    });
  }

  /**
   * Get the list of already booked seats for a given screening.
   */
  getBookedSeats(screeningId: string): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(
      `${this.baseUrl}${screeningId}/booked-seats`
    );
  }

  /**
   * Get a single screening by its unique ID.
   */
  getScreeningById(screeningId: string): Observable<ScreeningAttributes> {
    return this.http
      .get<{ message: string; data: ScreeningAttributes }>(
        `${this.baseUrl}${screeningId}`
      )
      .pipe(map((res) => res.data));
  }
}
