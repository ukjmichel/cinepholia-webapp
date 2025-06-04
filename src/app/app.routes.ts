import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Administration } from './pages/administration/administration';
import { Authentication } from './pages/authentication/authentication';
import { LoginForm } from './pages/authentication/login-form/login-form';
import { SignUpForm } from './pages/authentication/sign-up-form/sign-up-form';
import { TheatersAdmin } from './pages/administration/theaters/theaters';
import { TheatersList } from './pages/administration/theaters/theaters-list/theaters-list';
import { NewTheater } from './pages/administration/theaters/new-theater/new-theater';
import { HallsAdmin } from './pages/administration/halls/halls';
import { HallsList } from './pages/administration/halls/halls-list/halls-list';
import { NewHall } from './pages/administration/halls/new-hall/new-hall';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'admin',
    component: Administration,
    children: [
      {
        path: 'theaters',
        component: TheatersAdmin,
        children: [
          {
            path: 'search',
            component: TheatersList,
          },
          {
            path: 'new-theater',
            component: NewTheater,
          },
          {
            path: '',
            redirectTo: 'search',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'halls',
        component: HallsAdmin,
        children: [
          {
            path: 'search',
            component: HallsList,
          },
          {
            path: 'new-hall',
            component: NewHall,
          },
          {
            path: '',
            redirectTo: 'search',
            pathMatch: 'full',
          },
        ],
      },
    ],
  },
  {
    path: 'auth',
    component: Authentication,
    children: [
      { path: 'login', component: LoginForm },
      { path: 'register', component: SignUpForm },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];
