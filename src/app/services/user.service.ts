import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiEnvelope } from '../models/api.model';

/** Possible user roles for access control. */
export type UserRole = 'administrateur' | 'employé' | 'utilisateur';

/** Interface representing a user object. */
export interface User {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  verified: boolean;
  role?: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

/** DTO for updating user fields (admin or self). */
export interface UpdateUserDto {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
}

/** DTO for creating a new user (public registration). */
export interface CreateUserDto {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/** DTO for creating a new employee (admin/staff). */
export interface CreateEmployeeDto {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/** Search filters for querying users. */
export interface UserSearchFilters {
  q?: string;
  userId?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  verified?: boolean | string;
  page?: number;
  pageSize?: number;
}

/** Format for paginated user results. */
export interface PaginatedUserResult {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * UserService
 * - CRUD for users
 * - Search & list (with pagination)
 * - Password change
 * - Lightweight cache for single user fetches
 * - Uses API response format `{ message, data }` consistently
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  /** Base API endpoint for user operations */
  private baseUrl = `${environment.apiUrl}users/`;

  /** Reactive signal holding the latest user list */
  public users = signal<User[]>([]);

  /** Reactive signal for tracking the last user-related API error */
  public usersApiError = signal<string>('');

  /** In-memory cache for individual users, by userId */
  private userCache = new Map<string, User>();

  constructor(private http: HttpClient) {}

  /** Register a new public user. */
  createUser(dto: CreateUserDto): Observable<User> {
    const url = `${environment.apiUrl}auth/register`;
    return this.http
      .post<ApiEnvelope<{ user: User }>>(url, dto, { withCredentials: true })
      .pipe(map((res) => res.data.user));
  }

  /** Register a new employee (admin/staff action). */
  createEmployee(dto: CreateEmployeeDto): Observable<User> {
    const url = `${environment.apiUrl}auth/register-employee`;
    return this.http
      .post<ApiEnvelope<{ user: User }>>(url, dto, { withCredentials: true })
      .pipe(map((res) => res.data.user));
  }

  /**
   * Fetch a user by ID.
   * Uses in-memory cache to avoid unnecessary API calls.
   */
  getUserById(userId: string): Observable<User> {
    const cached = this.userCache.get(userId);
    if (cached) return of(cached);

    return this.http
      .get<ApiEnvelope<{ user: User }>>(
        `${this.baseUrl}${encodeURIComponent(userId)}`,
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((res) => res.data.user), // Changed from res.data to res.data.user
        tap((user) => this.userCache.set(userId, user))
      );
  }

  /** Update a user by ID and invalidate their cached entry. */
  updateUser(userId: string, dto: UpdateUserDto): Observable<User> {
    return this.http
      .put<ApiEnvelope<User>>(
        `${this.baseUrl}${encodeURIComponent(userId)}`,
        dto,
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((res) => res.data),
        tap(() => this.userCache.delete(userId))
      );
  }

  /** Delete a user by ID. */
  deleteUser(userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}${encodeURIComponent(userId)}`,
      { withCredentials: true }
    );
  }

  /** Change a user's password. */
  changePassword(
    userId: string,
    newPassword: string
  ): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.baseUrl}${encodeURIComponent(userId)}/password`,
      { newPassword },
      { withCredentials: true }
    );
  }

  /**
   * List users (same endpoint also supports filters).
   * Updates the `users` signal with the returned list.
   * Note: backend returns `{ message, data: { users, total, page, pageSize } }`.
   */
  listUsers(options?: {
    page?: number;
    pageSize?: number;
    username?: string;
    email?: string;
  }): void {
    let params = new HttpParams();
    if (options) {
      Object.entries(options).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          params = params.set(k, String(v));
        }
      });
    }

    this.http
      .get<ApiEnvelope<PaginatedUserResult>>(this.baseUrl, {
        params,
        withCredentials: true,
      })
      .pipe(map((res) => res.data.users))
      .subscribe({
        next: (list) => {
          this.users.set(list ?? []);
          this.usersApiError.set('');
        },
        error: (err) => {
          this.users.set([]);
          this.usersApiError.set(
            err?.error?.message || 'Erreur lors du chargement des utilisateurs.'
          );
        },
      });
  }

  /**
   * Search users with flexible filters.
   * Uses the SAME `/users` endpoint (no `/users/search` on backend).
   * Updates `users` signal with the returned list.
   */
  searchUsers(filters: UserSearchFilters = {}): void {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });

    this.http
      .get<ApiEnvelope<PaginatedUserResult>>(this.baseUrl, {
        params,
        withCredentials: true,
      })
      .pipe(map((res) => res.data.users))
      .subscribe({
        next: (list) => {
          this.users.set(list ?? []);
          this.usersApiError.set('');
        },
        error: (err) => {
          this.users.set([]);
          this.usersApiError.set(
            err?.error?.message || 'Erreur lors du chargement des utilisateurs.'
          );
        },
      });
  }
}
