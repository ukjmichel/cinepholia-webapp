import { Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hall } from '../models/hall.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class HallService {
  private baseUrl = `${environment.apiUrl}movie-halls/`;

  public createdHalls = signal<Hall[]>([]);

  constructor(private http: HttpClient) {
    effect(() => {
      console.log('[createdHalls changed]', this.createdHalls());
    });
  }

  getHallsByTheaterId(theaterId: string): Observable<Hall[]> {
    const url = `${this.baseUrl}theater/${encodeURIComponent(theaterId)}`;
    const obs = this.http.get<Hall[]>(url, { withCredentials: true });
    obs.subscribe((halls) => {
      this.createdHalls.set(halls);
    });
    return obs;
  }

  /** POST: Add a new hall */
  addHall(hall: Hall): Observable<Hall> {
    return this.http.post<Hall>(this.baseUrl, hall, {
      withCredentials: true,
    });
  }
}
