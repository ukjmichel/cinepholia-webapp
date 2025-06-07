import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment'; // adjust path as needed
import { ScreeningAttributes } from '../models/screening.model';

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
  private createUrl = `${environment.apiUrl}screenings`;

  public filteredScreenings = signal<ScreeningAttributes[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * Search screenings with filters.
   * Filters can be: movieId, theaterId, hallId, startTime, priceMin, priceMax, quality, recommended.
   */
  searchScreenings(filters: {
    movieId?: string;
    theaterId?: string;
    hallId?: string;
    startTime?: string; // full ISO datetime, only for exact match!
    date?: string; // <-- add this: for filtering by day!
    priceMin?: number;
    priceMax?: number;
    quality?: string;
    recommended?: boolean;
  }): Observable<ScreeningAttributes[]> {
    let params = new HttpParams();
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

    const obs = this.http
      .get<{ message: string; data: ScreeningAttributes[] }>(
        `${this.baseUrl}search`,
        {
          params,
        }
      )
      .pipe(map((res) => res.data));

    obs.subscribe((screenings) => this.filteredScreenings.set(screenings));

    return obs;
  }

  /** Add a new screening */
  addScreening(screening: CreateScreeningPayload): Observable<any> {
    console.log(screening);
    return this.http.post<any>(this.baseUrl, screening, {
      withCredentials: true,
    });
  }
}
