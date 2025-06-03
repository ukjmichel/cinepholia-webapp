import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import * as AuthSelectors from './auth.selectors';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  isLogged;
  user;
  loading;
  error;

  constructor(private store: Store) {
    this.isLogged = this.store.selectSignal(AuthSelectors.selectIsLogged);
    this.user = this.store.selectSignal(AuthSelectors.selectAuthUser);
    this.loading = this.store.selectSignal(AuthSelectors.selectAuthLoading);
    this.error = this.store.selectSignal(AuthSelectors.selectAuthError);
  }

  login(email: string, password: string) {
    this.store.dispatch(AuthActions.login({ email, password }));
  }

  register(
    email: string,
    username: string,
    password: string,
    firstName: string,
    lastName: string
  ) {
    this.store.dispatch(
      AuthActions.register({ email, username, password, firstName, lastName })
    );
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }

  getUser() {
    this.store.dispatch(AuthActions.getUser());
  }

  clearError() {
    this.store.dispatch(AuthActions.clearError());
  }
}
