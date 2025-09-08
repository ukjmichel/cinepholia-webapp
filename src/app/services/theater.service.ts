/**
 * TheaterService
 * --------------------------------------------------------------------------
 * Handles CRUD and search operations for movie theaters against the backend.
 * The API responses use an envelope `{ message, data }` but some endpoints
 * may (temporarily) return `{ message, date }`. The `unwrap` helper handles both.
 * --------------------------------------------------------------------------
 */

import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { Theater } from '../models/theater.model';
import { ApiEnvelope } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class TheaterService {
  /** Search endpoint base */
  private baseUrl = `${environment.apiUrl}movie-theaters/search`;
  /** Collection endpoint (list/create) */
  private createUrl = `${environment.apiUrl}movie-theaters`;

  /** Signal of the last search results */
  public filteredTheaters = signal<Theater[]>([]);
  /** Signal of all theaters (from getAll) */
  public allTheaters = signal<Theater[]>([]);

  constructor(private http: HttpClient) {}

  /** Extracts payload from `{message, data}` or `{message, date}`. */
  private unwrap<T>(res: ApiEnvelope<T>): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (res as any).data ?? (res as any).date;
  }

  /** GET: Retrieve all theaters. Also updates `allTheaters` signal. */
  getAllTheaters(): Observable<Theater[]> {
    const obs = this.http
      .get<ApiEnvelope<Theater[]>>(this.createUrl, { withCredentials: true })
      .pipe(map((res) => this.unwrap<Theater[]>(res)));

    obs.subscribe((theaters) => this.allTheaters.set(theaters));
    return obs;
  }

  /**
   * GET: Search theaters by optional criteria. Also updates `filteredTheaters`.
   * @param filters Optional search parameters.
   */
  searchMovieTheaters(filters: {
    theaterId?: string;
    city?: string;
    postalCode?: string;
  }): Observable<Theater[]> {
    let params = new HttpParams();
    if (filters.theaterId) params = params.set('theaterId', filters.theaterId);
    if (filters.city) params = params.set('city', filters.city);
    if (filters.postalCode)
      params = params.set('postalCode', filters.postalCode);

    const obs = this.http
      .get<ApiEnvelope<Theater[]>>(this.baseUrl, {
        params,
        withCredentials: true,
      })
      .pipe(map((res) => this.unwrap<Theater[]>(res)));

    obs.subscribe((theaters) => this.filteredTheaters.set(theaters));
    return obs;
  }

  /** POST: Add a new theater. */
  addTheater(theater: Theater): Observable<Theater> {
    return this.http
      .post<ApiEnvelope<Theater>>(this.createUrl, theater, {
        withCredentials: true,
      })
      .pipe(map((res) => this.unwrap<Theater>(res)));
  }
}
