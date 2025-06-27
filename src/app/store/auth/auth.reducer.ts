import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { initialAuthState, AuthState, Role } from './auth.state';

// Helper to ensure valid role values
function getValidRole(role: string): Role {
  switch (role) {
    case 'administrateur':
    case 'employé':
    case 'utilisateur':
      return role as Role;
    default:
      return 'utilisateur';
  }
}

// Auth reducer handles all auth actions and updates state accordingly
export const authReducer = createReducer(
  initialAuthState,

  // --- Login ---
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { data }) => ({
    ...state,
    isLogged: true,
    user: data.user,
    role: getValidRole(data.user.role ?? 'utilisateur'), // <-- fixed
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLogged: false,
    user: null,
    role: 'utilisateur' as Role,
    loading: false,
    error,
  })),

  // --- Register ---
  on(AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.registerSuccess, (state, { response }) => ({
    ...state,
    isLogged: true,
    user: response.data,
    role: getValidRole(response.data.role ?? 'utilisateur'), // <-- fixed
    loading: false,
    error: null,
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    isLogged: false,
    user: null,
    role: 'utilisateur' as Role,
    loading: false,
    error,
  })),

  // --- Get User (session check) ---
  on(AuthActions.getUser, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.getUserSuccess, (state, { data }) => ({
    ...state,
    isLogged: true,
    user: data.user,
    role: getValidRole(data.user.role ?? 'utilisateur'), // <-- fixed
    loading: false,
    error: null,
  })),
  on(AuthActions.getUserFailure, (state, { error }) => ({
    ...state,
    isLogged: false,
    user: null,
    role: 'utilisateur' as Role,
    loading: false,
    error,
  })),

  // --- Refresh Token ---
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.refreshTokenSuccess, (state) => ({
    ...state,
    loading: false,
  })),
  on(AuthActions.refreshTokenFailure, (state) => ({
    ...state,
    loading: false,
    isLogged: false,
    user: null,
    role: 'utilisateur' as Role,
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
