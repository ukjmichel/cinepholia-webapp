import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AuthFacade } from '../store/auth/auth.facade';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private authService: AuthService,
    private authFacade: AuthFacade
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(false);

            // Try to refresh the token
            return this.authService.refreshToken().pipe(
              switchMap(() => {
                this.isRefreshing = false;
                this.refreshTokenSubject.next(true);
                // Retry the original request
                return next.handle(req);
              }),
              catchError((err) => {
                this.isRefreshing = false;
                // Redirect to login or handle as needed
                this.authFacade.logout();
                return throwError(() => err);
              })
            );
          } else {
            // If a refresh is already happening, wait until it's done
            return this.refreshTokenSubject.pipe(
              filter((status) => status),
              take(1),
              switchMap(() => next.handle(req))
            );
          }
        } else {
          return throwError(() => error);
        }
      })
    );
  }
}
