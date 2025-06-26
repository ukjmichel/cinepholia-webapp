import { createAction, props } from '@ngrx/store';
import { LoginResponse, RegisterResponse, User } from '../../models/auth.model';

// =======================================
// Session/User Actions
// =======================================

/** Triggers user fetch from server using cookies (for silent login or session check) */
export const getUser = createAction('[Auth] Get User');

/** Dispatched when user fetch succeeds */
export const getUserSuccess = createAction(
  '[Auth] Get User Success',
  props<LoginResponse>()
);

/** Dispatched when user fetch fails */
export const getUserFailure = createAction(
  '[Auth] Get User Failure',
  props<{ error: string }>()
);

// =======================================
// Refresh Token Actions
// =======================================

/** Triggers a refresh token attempt (silent session recovery) */
export const refreshToken = createAction('[Auth] Refresh Token');

/** Dispatched when refresh token call succeeds */
export const refreshTokenSuccess = createAction('[Auth] Refresh Token Success');

/** Dispatched when refresh token call fails */
export const refreshTokenFailure = createAction('[Auth] Refresh Token Failure');

// =======================================
// Login Actions
// =======================================

/** Initiates login process */
export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

/** Dispatched when login succeeds */
export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<LoginResponse>()
);

/** Dispatched when login fails */
export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// =======================================
// Register Actions
// =======================================

/** Initiates registration process */
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

/** Dispatched when registration succeeds */
export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ response: RegisterResponse }>()
);

/** Dispatched when registration fails */
export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

// =======================================
// Logout Action
// =======================================

/** Initiates logout process */
export const logout = createAction('[Auth] Logout');

// =======================================
// Misc Actions
// =======================================

/** Clears error state */
export const clearError = createAction('[Auth] Clear Error');
