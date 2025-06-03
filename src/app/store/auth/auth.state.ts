import { User } from '../../models/auth.model';

export type Role = 'administrateur' | 'employé' | 'utilisateur';

export interface AuthState {
  isLogged: boolean;
  role: Role;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  isLogged: false,
  role: 'utilisateur',
  user: null,
  loading: false,
  error: null,
};
