import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { catchError, exhaustMap, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {
  getUser,
  getUserFailure,
  getUserSuccess,
  login,
  loginFailure,
  loginSuccess,
  logout,
  register,
  registerFailure,
  registerSuccess,
} from './auth.actions';

import { LoginResponse } from '../../models/auth.model';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private router = inject(Router);
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  /** Login Effect */
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      tap(({ email }) =>
        console.log('[AuthEffects] Login action received:', email)
      ),
      exhaustMap(({ email, password }) =>
        this.http
          .post<LoginResponse>(`${this.apiUrl}auth/login`, {
            emailOrUsername: email,
            password,
          })
          .pipe(
            tap((response) =>
              console.log('[AuthEffects] API Response:', response)
            ),
            map((response) => {
              console.log(
                '[AuthEffects] Dispatching loginSuccess with:',
                response
              );
              return loginSuccess(response); // Pass the full response to the action
            }),
            catchError((error) => {
              console.error('[AuthEffects] Login failed:', error);
              return of(
                loginFailure({
                  error:
                    error?.error?.message || error?.message || 'Login failed',
                })
              );
            })
          )
      )
    )
  );

  /** Register Effect */
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(register),
      tap(({ email }) =>
        console.log('[AuthEffects] Register action received:', email)
      ),
      exhaustMap(({ email, username, password, firstName, lastName }) =>
        this.http
          .post<LoginResponse>(`${this.apiUrl}auth/register`, {
            email,
            username,
            password,
            firstName,
            lastName,
          })
          .pipe(
            tap((response) =>
              console.log('[AuthEffects] API Response:', response)
            ),
            map((response) => registerSuccess(response)),
            catchError((error) => {
              console.error('[AuthEffects] Register failed:', error);
              return of(
                registerFailure({
                  error:
                    error?.error?.message ||
                    error?.message ||
                    'Registration failed',
                })
              );
            })
          )
      )
    )
  );

  /** Get User Effect */
  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getUser),
      switchMap(() => {
        const token = localStorage.getItem('token');
        if (!token) {
          return of(getUserFailure({ error: 'No authentication token found' }));
        }
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });
        return this.http
          .get<LoginResponse>(`${this.apiUrl}auth/user`, { headers })
          .pipe(
            tap((response) =>
              console.log('[AuthEffects] API Response:', response)
            ),
            map((response) => getUserSuccess(response)),
            catchError((error) => {
              console.error('[AuthEffects] API Error:', error);
              return of(getUserFailure({ error: 'Failed to fetch user data' }));
            })
          );
      })
    )
  );

  /** Save tokens after login/register */
  setToken$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess, registerSuccess),
        tap(({ data }) => {
          if (data?.tokens?.accessToken) {
            localStorage.setItem('token', data.tokens.accessToken);
          }
        })
      ),
    { dispatch: false }
  );

  /** Clear tokens on logout */
  clearToken$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logout),
        tap(() => {
          localStorage.removeItem('token');
        })
      ),
    { dispatch: false }
  );

  /** Redirect after login/register */
  redirectAfterAuth$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess, registerSuccess),
        tap(() => this.router.navigate(['/']))
      ),
    { dispatch: false }
  );

  /** Redirect after logout */
  redirectAfterLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logout),
        tap(() => this.router.navigate(['/auth/login']))
      ),
    { dispatch: false }
  );
}
