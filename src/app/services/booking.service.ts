import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  BookingComment,
  CreateBookingCommentDto,
} from '../models/comment.model';
import { CommentService } from './comment.service';
import { ApiEnvelope } from '../models/api.model';

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
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl = `${environment.apiUrl}bookings/`;

  /** Last created/updated booking (or null) */
  public latestBookingResult = signal<BookingAttributes | null>(null);

  /** Cached list of bookings for the current user */
  public userBookings = signal<BookingAttributes[]>([]);

  constructor(
    private http: HttpClient,
    private commentService: CommentService
  ) {}

  /**
   * Create a booking.
   * Expects API response format: `{ message: string, data: BookingAttributes }`.
   */
  createBooking(payload: BookingPayload): Observable<BookingAttributes> {
    const obs = this.http
      .post<ApiEnvelope<BookingAttributes>>(this.baseUrl, payload, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));

    // keep a copy in signal
    obs.subscribe({
      next: (booking) => this.latestBookingResult.set(booking),
      error: () => this.latestBookingResult.set(null),
    });

    return obs;
  }

  /**
   * Search bookings via query endpoint `/bookings/search?userId=...`
   * Response format: `{ message, data }`
   */
  searchBookingsByUserId(userId: string): Observable<BookingAttributes[]> {
    const params = new HttpParams().set('userId', userId);

    const obs = this.http
      .get<ApiEnvelope<BookingAttributes[]>>(this.baseUrl + 'search', {
        params,
        withCredentials: true,
      })
      .pipe(map((res) => res.data));

    obs.subscribe({
      next: (bookings) => this.userBookings.set(bookings ?? []),
      error: () => this.userBookings.set([]),
    });

    return obs;
  }

  /**
   * Get bookings for a user via RESTful endpoint `/bookings/user/:userId`
   * Response format: `{ message, data }`
   */
  getBookingsByUserId(userId: string): Observable<BookingAttributes[]> {
    const url = `${this.baseUrl}user/${encodeURIComponent(userId)}`;
    return this.http
      .get<ApiEnvelope<BookingAttributes[]>>(url, { withCredentials: true })
      .pipe(map((res) => res.data ?? []));
  }

  /**
   * Get a booking's comment.
   * Response format: `{ message, data }`
   */
  getComment(bookingId: string): Observable<BookingComment> {
    return this.http
      .get<ApiEnvelope<BookingComment>>(
        `${this.baseUrl}${encodeURIComponent(bookingId)}/comment`,
        { withCredentials: true }
      )
      .pipe(map((res) => res.data));
  }

  /**
   * Save a booking comment (delegates to CommentService).
   * Assumes CommentService already maps to `data`.
   */
  saveComment(
    bookingId: string,
    comment: CreateBookingCommentDto
  ): Observable<BookingComment> {
    return this.commentService.createComment(bookingId, comment);
  }
}
