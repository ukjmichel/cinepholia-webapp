export type Role = 'administrateur' | 'employé' | 'utilisateur';

export interface User {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}



export interface LoginResponse {
  message: string;
  data: {
    user: User;
  };
}
