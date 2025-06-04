import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import {  initialAuthState } from './auth.state';



export const authReducer = createReducer(
  initialAuthState,

  // --- Login ---
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { message, data }) => ({
    ...state,
    isLogged: true,
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isLogged: false,
    user: null,
  })),

  // --- Register ---
  on(AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.registerSuccess, (state, { message, data }) => ({
    ...state,
    isLogged: true,
    user: data.user,
    loading: false,
    error: null,
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isLogged: false,
    user: null,
  })),

  // --- Get User ---
  on(AuthActions.getUser, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.getUserSuccess, (state, { message, data }) => ({
    ...state,
    isLogged: true,
    user: data.user,
    loading: false,
    error: null,
  })),
  on(AuthActions.getUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isLogged: false,
    user: null,
  })),

  // --- Logout ---
  on(AuthActions.logout, () => ({
    ...initialAuthState,
  })),

  // --- Clear Error ---
  on(AuthActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);
