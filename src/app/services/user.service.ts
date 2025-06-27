import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';

/**
 * User role types for authorization.
 */
export type UserRole = 'administrateur' | 'employé' | 'utilisateur';

/**
 * Core User model for authentication and user management.
 */
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

/**
 * Data Transfer Object for updating a user (Self or Staff).
 */
export interface UpdateUserDto {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
}

/**
 * Data Transfer Object for creating a new user (Admin/Staff action).
 */
export interface CreateUserDto {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Data Transfer Object for creating a new employee.
 */
export interface CreateEmployeeDto {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Flexible search filters for the user search endpoint.
 */
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

/**
 * Paginated result for user list/search.
 */
export interface PaginatedUserResult {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * User Service
 *
 * Provides methods for:
 * - Creating, getting, updating, deleting, and changing password of users
 * - Listing users (with pagination and filters)
 * - Flexible search by any combination of fields or global text
 * - Reactive state for user list and API error
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  /** Base API URL for user endpoints */
  private baseUrl = `${environment.apiUrl}users/`;

  /** Signal holding the current user list (for search/filter/list) */
  public users = signal<User[]>([]);
  /** Signal for last API error message */
  public usersApiError = signal<string>('');

  constructor(private http: HttpClient) {}

  /**
   * Create a new user (public registration).
   * Calls the `/auth/register` endpoint.
   * @param dto New user data
   * @returns Observable emitting the created user
   */
  createUser(dto: CreateUserDto): Observable<User> {
    // Use the auth/register endpoint
    const url = `${environment.apiUrl}auth/register`;
    return this.http
      .post<{ message: string; data: User }>(url, dto, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  /**
   * Create a new employee (admin/staff action).
   * Calls the `/auth/register-employee` endpoint.
   * @param dto New employee data
   * @returns Observable emitting the created user (employee)
   */
  createEmployee(dto: CreateEmployeeDto): Observable<User> {
    const url = `${environment.apiUrl}auth/register-employee`;
    return this.http
      .post<{ message: string; data: User }>(url, dto, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  /**
   * Get user by their unique ID.
   * @param userId The user ID (UUID)
   * @returns Observable emitting the user object
   */
  getUserById(userId: string): Observable<User> {
    return this.http
      .get<{ message: string; data: User }>(`${this.baseUrl}${userId}`, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  /**
   * Update a user (Self or Staff only)
   * @param userId The user ID
   * @param dto Partial user update data
   * @returns Observable emitting the updated user object
   */
  updateUser(userId: string, dto: UpdateUserDto): Observable<User> {
    return this.http
      .put<{ message: string; data: User }>(`${this.baseUrl}${userId}`, dto, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  /**
   * Delete a user (Self or Staff only)
   * @param userId The user ID
   * @returns Observable emitting a confirmation message
   */
  deleteUser(userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}${userId}`, {
      withCredentials: true,
    });
  }

  /**
   * Change a user's password (Self or Staff only)
   * @param userId The user ID
   * @param newPassword The new password to set
   * @returns Observable emitting a confirmation message
   */
  changePassword(
    userId: string,
    newPassword: string
  ): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.baseUrl}${userId}/password`,
      { newPassword },
      { withCredentials: true }
    );
  }

  /**
   * List users with pagination and filters (Admin/Staff only)
   * Updates the `users` signal.
   * @param options Filtering and pagination options (page, pageSize, username, email)
   */
  listUsers(options?: {
    page?: number;
    pageSize?: number;
    username?: string;
    email?: string;
  }): void {
    let params = new HttpParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    this.http
      .get<{ message: string; data: PaginatedUserResult }>(this.baseUrl, {
        params,
        withCredentials: true,
      })
      .pipe(map((res) => res.data.users))
      .subscribe({
        next: (users) => {
          this.users.set(users);
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
   * Flexible user search by global query or any combination of fields.
   * Updates the `users` signal with the results.
   * @param filters See UserSearchFilters.
   */
  searchUsers(filters: UserSearchFilters = {}): void {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    this.http
      .get<{ message: string; data: User[] }>(`${this.baseUrl}search`, {
        params,
        withCredentials: true,
      })
      .pipe(map((res) => res.data))
      .subscribe({
        next: (users) => {
          this.users.set(users);
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
