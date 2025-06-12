import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hall } from '../models/hall.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class HallService {
  private baseUrl = `${environment.apiUrl}movie-halls/`;

  public createdHalls = signal<Hall[]>([]);
  public allHalls = signal<Hall[]>([]);

  constructor(private http: HttpClient) {}

  /** GET: Get all halls */
  getAllHalls(): Observable<Hall[]> {
    const url = this.baseUrl;
    const obs = this.http.get<Hall[]>(url, { withCredentials: true });
    obs.subscribe((halls) => {
      this.allHalls.set(halls); // <-- stocke dans allHalls
    });
    return obs;
  }

  /** GET: Get halls by theater ID */
  getHallsByTheaterId(theaterId: string): Observable<Hall[]> {
    const url = `${this.baseUrl}theater/${encodeURIComponent(theaterId)}`;
    const obs = this.http.get<Hall[]>(url, { withCredentials: true });
    obs.subscribe((halls) => {
      this.createdHalls.set(halls); // <-- stocke dans createdHalls
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
