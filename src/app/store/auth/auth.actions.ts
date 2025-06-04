import { createAction, props } from '@ngrx/store';

import { LoginResponse, User } from '../../models/auth.model';

// Login Actions
export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<LoginResponse>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Register Actions
export const register = createAction(
  '[Auth] Register',
  props<{
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
  }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<LoginResponse>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

// Get User Actions
export const getUser = createAction('[Auth] Get User');

export const getUserSuccess = createAction(
  '[Auth] Get User Success',
  props<LoginResponse>()
);

export const getUserFailure = createAction(
  '[Auth] Get User Failure',
  props<{ error: string }>()
);

// Logout Action
export const logout = createAction('[Auth] Logout');

// Clear Error
export const clearError = createAction('[Auth] Clear Error');
