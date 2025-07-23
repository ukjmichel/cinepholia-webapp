import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, tap } from 'rxjs';
import { environment } from '../environments/environment';

/**
 * Possible user roles for access control.
 */
export type UserRole = 'administrateur' | 'employé' | 'utilisateur';

/**
 * Interface representing a user object.
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
 * DTO for updating user fields (admin or self).
 */
export interface UpdateUserDto {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
}

/**
 * DTO for creating a new user (public registration).
 */
export interface CreateUserDto {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * DTO for creating a new employee (admin/staff).
 */
export interface CreateEmployeeDto {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Search filters for querying users.
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
 * Format for paginated user results.
 */
export interface PaginatedUserResult {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * UserService is responsible for:
 * - Managing CRUD operations for users
 * - Searching and listing users
 * - Handling authentication-related actions like password change
 * - Caching user data to reduce redundant requests
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

  /**
   * Registers a new public user.
   * @param dto New user details
   * @returns Observable emitting the created User
   */
  createUser(dto: CreateUserDto): Observable<User> {
    const url = `${environment.apiUrl}auth/register`;
    return this.http
      .post<{ message: string; data: User }>(url, dto, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  /**
   * Registers a new employee (admin/staff action).
   * @param dto New employee details
   * @returns Observable emitting the created User
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
   * Fetch a user by ID.
   * Uses in-memory cache to avoid unnecessary API calls.
   * @param userId User's unique identifier
   * @returns Observable emitting the User
   */
  getUserById(userId: string): Observable<User> {
    const cachedUser = this.userCache.get(userId);
    if (cachedUser) {
      return of(cachedUser);
    }

    return this.http
      .get<{ message: string; data: User }>(`${this.baseUrl}${userId}`, {
        withCredentials: true,
      })
      .pipe(
        map((res) => res.data),
        tap((user) => this.userCache.set(userId, user))
      );
  }

  /**
   * Update a user by ID and clear their cached data.
   * @param userId ID of the user to update
   * @param dto Fields to update
   * @returns Observable emitting the updated User
   */
  updateUser(userId: string, dto: UpdateUserDto): Observable<User> {
    return this.http
      .put<{ message: string; data: User }>(`${this.baseUrl}${userId}`, dto, {
        withCredentials: true,
      })
      .pipe(
        map((res) => res.data),
        tap(() => this.userCache.delete(userId)) // Invalidate cache after update
      );
  }

  /**
   * Deletes a user by ID.
   * @param userId ID of the user to delete
   * @returns Observable with confirmation message
   */
  deleteUser(userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}${userId}`, {
      withCredentials: true,
    });
  }

  /**
   * Changes a user's password.
   * @param userId ID of the user
   * @param newPassword The new password
   * @returns Observable with confirmation message
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
   * Lists users with optional pagination and filters.
   * Updates the `users` signal with the result.
   * @param options Pagination and filter options
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
   * Searches users using a global query or specific filters.
   * Updates the `users` signal with the result.
   * @param filters Flexible search filters
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
