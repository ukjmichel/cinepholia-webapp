/**
 * HallService
 * ------------------------------------------------------------
 * Angular service for managing movie halls.
 * The backend returns responses shaped as:
 *   { message: string; data: T }
 * This service unwraps `data` for consumers and updates signals.
 */

import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Hall } from '../models/hall.model';
import { environment } from '../environments/environment';

/** Generic API response wrapper used by the backend. */
interface ApiResponse<T> {
  message: string;
  data: T;
}

/** Response shapes */
type HallListResponse = ApiResponse<Hall[]>;
type HallResponse = ApiResponse<Hall>;
type VoidResponse = ApiResponse<null>;

@Injectable({ providedIn: 'root' })
export class HallService {
  /** API base URL for movie halls */
  private readonly baseUrl = `${environment.apiUrl}movie-halls/`;

  /** Signal holding all halls (e.g., admin view or listing) */
  public readonly allHalls = signal<Hall[]>([]);

  /** Signal holding halls for a specific theater (e.g., filtered result) */
  public readonly createdHalls = signal<Hall[]>([]);

  /** Signal holding search results (by hall ID + theater ID) */
  public readonly searchedHalls = signal<Hall[]>([]);

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────────
  // GET methods
  // ─────────────────────────────────────────────

  /**
   * GET: Fetch all movie halls.
   * Populates the `allHalls` signal.
   */
  getAllHalls(): Observable<Hall[]> {
    return this.http
      .get<HallListResponse>(this.baseUrl, { withCredentials: true })
      .pipe(
        map((res) => res.data ?? []),
        tap((halls) => this.allHalls.set(halls))
      );
  }

  /**
   * GET: Fetch all halls for a specific theater.
   * Populates the `createdHalls` signal.
   * @param theaterId Theater ID to filter by
   */
  getHallsByTheaterId(theaterId: string): Observable<Hall[]> {
    const url = `${this.baseUrl}theater/${encodeURIComponent(theaterId)}`;
    return this.http.get<HallListResponse>(url, { withCredentials: true }).pipe(
      map((res) => res.data ?? []),
      tap((halls) => this.createdHalls.set(halls))
    );
  }

  /**
   * GET: Fetch a single hall by theaterId and hallId (composite key).
   * @param theaterId Theater ID
   * @param hallId Hall ID
   */
  getHall(theaterId: string, hallId: string): Observable<Hall> {
    const url = `${this.baseUrl}${encodeURIComponent(
      theaterId
    )}/${encodeURIComponent(hallId)}`;
    return this.http
      .get<HallResponse>(url, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  /**
   * GET: Search halls by theaterId and hallId.
   * Populates the `searchedHalls` signal.
   * @param theaterId Theater ID
   * @param hallId Hall ID
   */
  searchHall(theaterId: string, hallId: string): Observable<Hall[]> {
    let params = new HttpParams();
    if (theaterId) params = params.set('theaterId', theaterId);
    if (hallId) params = params.set('hallId', hallId);

    const url = `${this.baseUrl}search`;
    return this.http
      .get<HallListResponse>(url, { params, withCredentials: true })
      .pipe(
        map((res) => res.data ?? []),
        tap((halls) => this.searchedHalls.set(halls))
      );
  }

  // ─────────────────────────────────────────────
  // POST method
  // ─────────────────────────────────────────────

  /**
   * POST: Add a new hall (including quality).
   * @param hall Hall object to create
   */
  addHall(hall: Hall): Observable<Hall> {
    return this.http
      .post<HallResponse>(this.baseUrl, hall, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  // ─────────────────────────────────────────────
  // PATCH method
  // ─────────────────────────────────────────────

  /**
   * PATCH: Update a hall (fields like hallId, seatsLayout, quality).
   * @param theaterId Theater ID
   * @param hallId Hall ID
   * @param data Partial hall fields to update
   */
  updateHall(
    theaterId: string,
    hallId: string,
    data: Partial<Hall>
  ): Observable<Hall> {
    const url = `${this.baseUrl}${encodeURIComponent(
      theaterId
    )}/${encodeURIComponent(hallId)}`;
    return this.http
      .patch<HallResponse>(url, data, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  // ─────────────────────────────────────────────
  // DELETE method
  // ─────────────────────────────────────────────

  /**
   * DELETE: Remove a hall by composite ID.
   * @param theaterId Theater ID
   * @param hallId Hall ID
   */
  deleteHall(theaterId: string, hallId: string): Observable<void> {
    const url = `${this.baseUrl}${encodeURIComponent(
      theaterId
    )}/${encodeURIComponent(hallId)}`;
    return this.http
      .delete<VoidResponse>(url, { withCredentials: true })
      .pipe(map(() => void 0));
  }
}
