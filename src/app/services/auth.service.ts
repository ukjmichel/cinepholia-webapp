import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}auth/`;
  constructor(private http: HttpClient) {}

  refreshToken(): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}refresh/`,
      {},
      { withCredentials: true }
    );
  }
}
