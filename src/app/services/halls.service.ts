import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hall } from '../models/hall.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class HallService {
  /** API base URL for movie halls */
  private baseUrl = `${environment.apiUrl}movie-halls/`;

  /** Signal holding all halls (e.g. admin view or listing) */
  public allHalls = signal<Hall[]>([]);

  /** Signal holding halls for a specific theater (e.g. filtered result) */
  public createdHalls = signal<Hall[]>([]);

  /** Signal holding search results (by hall ID + theater ID) */
  public searchedHalls = signal<Hall[]>([]);

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────────
  // GET methods
  // ─────────────────────────────────────────────

  /**
   * GET: Fetch all movie halls
   * Populates the `allHalls` signal.
   */
  getAllHalls(): Observable<Hall[]> {
    const obs = this.http.get<Hall[]>(this.baseUrl, { withCredentials: true });
    obs.subscribe((halls) => this.allHalls.set(halls));
    return obs;
  }

  /**
   * GET: Fetch all halls for a specific theater
   * @param theaterId Theater ID to filter by
   * Populates the `createdHalls` signal.
   */
  getHallsByTheaterId(theaterId: string): Observable<Hall[]> {
    const url = `${this.baseUrl}theater/${encodeURIComponent(theaterId)}`;
    const obs = this.http.get<Hall[]>(url, { withCredentials: true });
    obs.subscribe((halls) => this.createdHalls.set(halls));
    return obs;
  }

  /**
   * GET: Fetch a single hall by theaterId and hallId (composite key)
   * @param theaterId Theater ID
   * @param hallId Hall ID
   */
  getHall(theaterId: string, hallId: string): Observable<Hall> {
    const url = `${this.baseUrl}${encodeURIComponent(
      theaterId
    )}/${encodeURIComponent(hallId)}`;
    return this.http.get<Hall>(url, { withCredentials: true });
  }

  /**
   * GET: Search halls by theaterId and hallId
   * @param theaterId Theater ID
   * @param hallId Hall ID
   * Populates the `searchedHalls` signal.
   */
  searchHall(theaterId: string, hallId: string): Observable<Hall[]> {
    const url = `${this.baseUrl}search?theaterId=${encodeURIComponent(
      theaterId
    )}&hallId=${encodeURIComponent(hallId)}`;
    const obs = this.http.get<Hall[]>(url, { withCredentials: true });
    obs.subscribe((halls) => this.searchedHalls.set(halls));
    return obs;
  }

  // ─────────────────────────────────────────────
  // POST method
  // ─────────────────────────────────────────────

  /**
   * POST: Add a new hall (including quality)
   * @param hall Hall object to create
   */
  addHall(hall: Hall): Observable<Hall> {
    return this.http.post<Hall>(this.baseUrl, hall, {
      withCredentials: true,
    });
  }

  // ─────────────────────────────────────────────
  // PATCH method
  // ─────────────────────────────────────────────

  /**
   * PATCH: Update a hall (fields like hallId, seatsLayout, quality)
   * @param theaterId Theater ID
   * @param hallId Hall ID
   * @param data Partial hall fields to update (e.g. hallId, seatsLayout, quality)
   */
  updateHall(
    theaterId: string,
    hallId: string,
    data: Partial<Hall>
  ): Observable<Hall> {
    const url = `${this.baseUrl}${encodeURIComponent(
      theaterId
    )}/${encodeURIComponent(hallId)}`;
    return this.http.patch<Hall>(url, data, { withCredentials: true });
  }

  // ─────────────────────────────────────────────
  // DELETE method
  // ─────────────────────────────────────────────

  /**
   * DELETE: Remove a hall by composite ID
   * @param theaterId Theater ID
   * @param hallId Hall ID
   */
  deleteHall(theaterId: string, hallId: string): Observable<void> {
    const url = `${this.baseUrl}${encodeURIComponent(
      theaterId
    )}/${encodeURIComponent(hallId)}`;
    return this.http.delete<void>(url, { withCredentials: true });
  }
}
