import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { initialAuthState } from './auth.state';
import { Role } from './auth.state'; // Import the Role type

// Helper function to ensure the role is one of the allowed values
function getValidRole(role: string): Role {
  switch (role) {
    case 'administrateur':
    case 'employé':
    case 'utilisateur':
      return role;
    default:
      return 'utilisateur'; // Default role if the provided role is not valid
  }
}

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
    role: getValidRole(data.user.role),
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isLogged: false,
    user: null,
    role: 'utilisateur' as Role,
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
    role: response.data.role,
    loading: false,
    error: null,
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isLogged: false,
    user: null,
    role: 'utilisateur' as Role, // Reset to default role
  })),

  // --- Get User ---
  on(AuthActions.getUser, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.getUserSuccess, (state, { data }) => ({
    ...state,
    isLogged: true,
    user: data.user,
    role: getValidRole(data.user.role), // Use the helper function to ensure type safety
    loading: false,
    error: null,
  })),
  on(AuthActions.getUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isLogged: false,
    user: null,
    role: 'utilisateur' as Role, // Reset to default role
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
