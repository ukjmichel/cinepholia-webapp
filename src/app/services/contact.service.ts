import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

export interface ContactMessage {
  theaterId: string;
  email: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private baseUrl = `${environment.apiUrl}contact`;

  constructor(private http: HttpClient) {}

  /** POST: Send a contact message about a theater */
  sendMessage(data: ContactMessage): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.baseUrl, data, {
      withCredentials: true,
    });
  }
}
