import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Administration } from './pages/administration/administration';
import { Authentication } from './pages/authentication/authentication';
import { LoginForm } from './pages/authentication/login-form/login-form';
import { SignUpForm } from './pages/authentication/sign-up-form/sign-up-form';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'admin',
    component: Administration,
  },
  {
    path: 'auth',
    component: Authentication,
    children: [
      { path: 'login', component: LoginForm },
      { path: 'signup', component: SignUpForm },
      { path: '', redirectTo: 'login', pathMatch: 'full' }, // default: /auth => /auth/login
    ],
  },
];
