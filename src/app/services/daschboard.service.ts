import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { MovieStats } from '../models/movie-stats.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private baseUrl = `${environment.apiUrl}movies/`;

  // Signal to store stats in the app, optional
  public stats = signal<MovieStats | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Get booking stats for a movie by movieId
   * @param movieId The movie's ID
   */
  getStatsByMovieId(movieId: string): Observable<MovieStats> {
    const url = `${this.baseUrl}${movieId}/stats`;
    const obs = this.http.get<MovieStats>(url, { withCredentials: true });

    return obs;
  }
}
