// auth.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Action } from '@ngrx/store';
import { Observable, of, concat } from 'rxjs';
import {
  catchError,
  exhaustMap,
  map,
  switchMap,
  tap,
  concatMap,
} from 'rxjs/operators';

import * as AuthActions from './auth.actions';
import { environment } from '../../environments/environment';
import { LoginResponse, User } from '../../models/auth.model';
import { ApiEnvelope } from '../../models/api.model';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private router = inject(Router);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Login
   * API: ApiEnvelope<{ user: User }>
   */
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ email, password }) =>
        this.http
          .post<ApiEnvelope<{ user: User }>>(
            `${this.apiUrl}auth/login`,
            { emailOrUsername: email, password },
            { withCredentials: true }
          )
          .pipe(
            map((res) =>
              AuthActions.loginSuccess({
                message: res.message,
                data: res.data, // { user }
              })
            ),
            catchError((error) =>
              of(
                AuthActions.loginFailure({
                  error:
                    error?.error?.message || error?.message || 'Login failed',
                })
              )
            )
          )
      )
    )
  );

  /**
   * Register then login
   * Register API: ApiEnvelope<User>
   * Login API: ApiEnvelope<{ user: User }>
   */
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      exhaustMap(({ email, username, password, firstName, lastName }) =>
        this.http
          .post<ApiEnvelope<User>>(
            `${this.apiUrl}auth/register`,
            { email, username, password, firstName, lastName },
            { withCredentials: true }
          )
          .pipe(
            // 1) emit registerSuccess
            // 2) call /auth/login and emit loginSuccess (so isLogged = true)
            concatMap((res): Observable<Action> => {
              const registerPayload: LoginResponse = {
                message: res.message,
                data: { user: res.data },
              };
              const registerAction =
                AuthActions.registerSuccess(registerPayload);

              const login$: Observable<
                | ReturnType<typeof AuthActions.loginSuccess>
                | ReturnType<typeof AuthActions.loginFailure>
              > = this.http
                .post<ApiEnvelope<{ user: User }>>(
                  `${this.apiUrl}auth/login`,
                  { emailOrUsername: email, password },
                  { withCredentials: true }
                )
                .pipe(
                  map((loginRes) =>
                    AuthActions.loginSuccess({
                      message: loginRes.message,
                      data: loginRes.data, // { user }
                    })
                  ),
                  catchError((err) =>
                    of(
                      AuthActions.loginFailure({
                        error:
                          err?.error?.message ??
                          err?.message ??
                          'Login failed after registration',
                      })
                    )
                  )
                );

              return concat(of(registerAction), login$);
            }),
            catchError((err) =>
              of(
                AuthActions.registerFailure({
                  error:
                    err?.error?.message ??
                    err?.message ??
                    'Registration failed',
                })
              )
            )
          )
      )
    )
  );

  /**
   * Load current user (session check)
   * API: ApiEnvelope<{ user: User }>
   */
  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.getUser),
      switchMap(() =>
        this.http
          .get<ApiEnvelope<{ user: User }>>(`${this.apiUrl}users/me`, {
            withCredentials: true,
          })
          .pipe(
            map((res) =>
              AuthActions.getUserSuccess({
                message: res.message,
                data: { user: res.data.user },
              })
            ),
            catchError((error) => {
              if (error?.status === 401) {
                return of(AuthActions.refreshToken());
              }
              return of(
                AuthActions.getUserFailure({
                  error: 'Failed to fetch user data',
                })
              );
            })
          )
      )
    )
  );

  /**
   * Refresh token
   */
  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      switchMap(() =>
        this.http
          .post(`${this.apiUrl}auth/refresh`, {}, { withCredentials: true })
          .pipe(
            map(() => AuthActions.getUser()),
            catchError(() => of(AuthActions.refreshTokenFailure()))
          )
      )
    )
  );

  /**
   * Redirect after successful auth
   * (listen only to loginSuccess to avoid double navigation)
   */
  redirectAfterAuth$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => {
          const returnUrl =
            this.router.routerState.snapshot.root.queryParamMap.get(
              'returnUrl'
            ) || '/';
          this.router.navigateByUrl(returnUrl);
        })
      ),
    { dispatch: false }
  );

  /**
   * Logout
   */
  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        exhaustMap(() =>
          this.http
            .post(`${this.apiUrl}auth/logout`, {}, { withCredentials: true })
            .pipe(
              tap(() => this.router.navigate(['/auth/login'])),
              catchError(() => {
                this.router.navigate(['/auth/login']);
                return of();
              })
            )
        )
      ),
    { dispatch: false }
  );
}
