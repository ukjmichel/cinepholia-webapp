import { Injectable, signal, effect } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Theater } from '../models/theater.model';

@Injectable({ providedIn: 'root' })
export class TheaterService {
  private baseUrl = `${environment.apiUrl}movie-theaters/search`;
  private createUrl = `${environment.apiUrl}movie-theaters`;

  public filteredTheaters = signal<Theater[]>([]);
  public allTheaters = signal<Theater[]>([]); // <-- Pluriel et cohérent

  constructor(private http: HttpClient) {}

  /** GET: Get all theaters */
  getAllTheaters(): Observable<Theater[]> {
    const obs = this.http.get<Theater[]>(this.createUrl, {
      withCredentials: true,
    });
    obs.subscribe((theaters) => {
      this.allTheaters.set(theaters); // <-- Correction ici
    });
    return obs;
  }

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

    const obs = this.http.get<Theater[]>(this.baseUrl, { params });
    obs.subscribe((theaters) => {
      this.filteredTheaters.set(theaters);
    });

    return obs;
  }

  /** POST: Add a new theater */
  addTheater(theater: Theater): Observable<Theater> {
    return this.http.post<Theater>(this.createUrl, theater, {
      withCredentials: true,
    });
  }
}
