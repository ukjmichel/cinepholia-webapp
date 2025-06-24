import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  BookingComment,
  CreateBookingCommentDto,
} from '../models/comment.model';
import { CommentService } from './comment.service';

export interface BookingPayload {
  userId: string;
  screeningId: string;
  seatsNumber: number;
  seatIds: string[];
  totalPrice: number;
}

export interface BookingAttributes {
  bookingId: string;
  userId: string;
  screeningId: string;
  seatsNumber: number;
  seatIds: string[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  // Add more fields as your API returns
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl = `${environment.apiUrl}bookings/`;

  public latestBookingResult = signal<any>(null);
  public userBookings = signal<BookingAttributes[]>([]);

  constructor(
    private http: HttpClient,
    private commentService: CommentService
  ) {}

  createBooking(payload: BookingPayload): Observable<any> {
    const obs = this.http.post<any>(this.baseUrl, payload, {
      withCredentials: true,
    });

    return obs;
  }

  /** Search bookings by userId */
  searchBookingsByUserId(userId: string): Observable<BookingAttributes[]> {
    let params = new HttpParams().set('userId', userId);

    const obs = this.http
      .get<{ message: string; data: BookingAttributes[] }>(
        this.baseUrl + 'search',
        {
          params,
        }
      )
      .pipe(map((res) => res.data));

    obs.subscribe({
      next: (bookings) => this.userBookings.set(bookings),
      error: () => this.userBookings.set([]),
    });

    return obs;
  }
  getBookingsByUserId(userId: string): Observable<BookingAttributes[]> {
    const url = `${this.baseUrl}user/${userId}`;
    return this.http
      .get<{ message: string; data: BookingAttributes[] }>(url, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  /** Get comment for a booking */
  getComment(bookingId: string): Observable<BookingComment> {
    return this.http
      .get<{ message: string; data: BookingComment }>(
        `${this.baseUrl}${bookingId}/comment`,
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((res) => res.data) // <--- Only pass the data object to components
      );
  }

  /** Save comment for a booking */
  saveComment(
    bookingId: string,
    comment: CreateBookingCommentDto
  ): Observable<BookingComment> {
    return this.commentService.createComment(bookingId, comment);
  }
}
