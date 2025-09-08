import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  BookingComment,
  BookingCommentWithMovieAndUser,
  CreateBookingCommentDto,
} from '../models/comment.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private apiUrl = environment.apiUrl; // Should end with '/'

  public fetchedComment = signal<BookingComment | null>(null);
  public commentsList = signal<BookingComment[]>([]);

  constructor(private http: HttpClient) {}

  /** GET: Fetch a comment by booking ID */
  getCommentByBookingId(bookingId: string): Observable<BookingComment> {
    const obs = this.http
      .get<{ message: string; data: BookingComment }>(
        `${this.apiUrl}bookings/${bookingId}/comment`,
        { withCredentials: true }
      )
      .pipe(map((res) => res.data));

    obs.subscribe((comment) => this.fetchedComment.set(comment));
    return obs;
  }

  /** GET: Fetch comments by user ID (with movie info) */
  getCommentsByUserId(
    userId: string
  ): Observable<BookingCommentWithMovieAndUser[]> {
    const obs = this.http
      .get<{ message: string; data: BookingCommentWithMovieAndUser[] }>(
        `${this.apiUrl}users/${userId}/comments`,
        { withCredentials: true }
      )
      .pipe(map((res) => res.data));
    return obs;
  }

  /** POST: Create a new comment for a booking */
  createComment(
    bookingId: string,
    comment: CreateBookingCommentDto
  ): Observable<BookingComment> {
    return this.http
      .post<{ message: string; data: BookingComment }>(
        `${this.apiUrl}bookings/${bookingId}/add-comment`,
        comment,
        { withCredentials: true }
      )
      .pipe(map((res) => res.data));
  }

  /** PUT: Update an existing comment */
  updateComment(
    bookingId: string,
    updateData: Partial<BookingComment>
  ): Observable<BookingComment> {
    return this.http
      .put<{ message: string; data: BookingComment }>(
        `${this.apiUrl}bookings/${bookingId}/comment`,
        updateData,
        { withCredentials: true }
      )
      .pipe(map((res) => res.data));
  }

  /** DELETE: Remove a comment */
  deleteComment(bookingId: string): Observable<void> {
    return this.http
      .delete<{ message: string; data: null }>(
        `${this.apiUrl}bookings/${bookingId}/comment`,
        { withCredentials: true }
      )
      .pipe(map(() => void 0));
  }

  /** GET: Fetch all comments (staff only) */
  getAllComments(): Observable<BookingComment[]> {
    const obs = this.http
      .get<{ message: string; data: BookingComment[] }>(
        `${this.apiUrl}bookings/comments`,
        { withCredentials: true }
      )
      .pipe(map((res) => res.data));

    obs.subscribe((comments) => this.commentsList.set(comments));
    return obs;
  }

  /** GET: Fetch comments for a specific movie (public) */
  getCommentsByMovie(movieId: string): Observable<BookingComment[]> {
    const obs = this.http
      .get<{ message: string; data: BookingComment[] }>(
        `${this.apiUrl}movies/${movieId}/comments`,
        { withCredentials: true }
      )
      .pipe(map((res) => res.data));

    obs.subscribe((comments) => this.commentsList.set(comments));
    return obs;
  }

  /** GET: Fetch comments by status (staff only) */
  getCommentsByStatus(
    status: 'pending' | 'confirmed'
  ): Observable<BookingComment[]> {
    const obs = this.http
      .get<{ message: string; data: BookingComment[] }>(
        `${this.apiUrl}bookings/comments/status/${status}`,
        { withCredentials: true }
      )
      .pipe(map((res) => res.data));

    obs.subscribe((comments) => this.commentsList.set(comments));
    return obs;
  }

  /** GET: Search comments with filter params (staff only) */
  searchComments(params: {
    q?: string;
    status?: string;
    bookingId?: string;
    rating?: number;
    movieId?: string;
    createdAt?: string;
  }): Observable<BookingComment[]> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value);
      }
    });

    const obs = this.http
      .get<{ message: string; data: BookingComment[] }>(
        `${this.apiUrl}bookings/comments/search`,
        {
          params: httpParams,
          withCredentials: true,
        }
      )
      .pipe(map((res) => res.data));

    obs.subscribe((comments) => this.commentsList.set(comments));
    return obs;
  }

  /** PATCH: Confirm a comment (staff only) */
  confirmComment(bookingId: string): Observable<BookingComment> {
    return this.http
      .patch<{ message: string; data: BookingComment }>(
        `${this.apiUrl}bookings/${bookingId}/comment/confirm`,
        {},
        { withCredentials: true }
      )
      .pipe(map((res) => res.data));
  }

  /** GET: Average rating for a movie */
  getAverageRatingForMovie(movieId: string): Observable<number | null> {
    return this.http
      .get<{ message: string; data: number | null }>(
        `${this.apiUrl}movies/${movieId}/comments/average`,
        { withCredentials: true }
      )
      .pipe(map((res) => res.data));
  }
}
