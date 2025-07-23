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
import { MoviesAdmin } from './pages/administration/movies/movies';
import { NewMovie } from './pages/administration/movies/new-movie/new-movie';

import { ScreeningsAdmin } from './pages/administration/screenings/screenings';
import { ScreeningsList } from './pages/administration/screenings/screenings-list/screenings-list';
import { NewScreening } from './pages/administration/screenings/new-screening/new-screening';
import { Movies } from './pages/movies/movies';
import { MoviesList } from './components/movies-list/movies-list';
import { MoviesAdminList } from './pages/administration/movies/movies-list/movies-list';
import { MovieDetails } from './pages/movies/movie-detail/movie-details';
import { BookingsAdmin } from './pages/bookings/bookings';
import { BookingsList } from './pages/bookings/bookings-list/bookings-list';
import { NewBooking } from './pages/bookings/new-booking/new-booking';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { TermsAndConditions } from './pages/terms-and-conditions/terms-and-conditions';
import { LegalNotices } from './pages/legal-notices/legal-notices';
import { CookiePolicy } from './pages/cookie-policy/cookie-policy';
import { CommentsAdmin } from './pages/administration/comments/comments';
import { CommentsList } from './pages/administration/comments/comments-list/comments-list';
import { TheatersMoviesSearch } from './pages/theaters/theaters';
import { UsersAdmin } from './pages/administration/users/users';
import { UsersList } from './pages/administration/users/users-list/users-list';
import { NewUser } from './pages/administration/users/new-user/new-user';
import { Dashboard } from './pages/administration/dashboard/dashboard';
import { EditUser } from './pages/administration/users/edit-user/edit-user';
import { UserDashboard } from './pages/user-dashboard/user-dashboard';
import path from 'path';
import { UserComponent } from './pages/user-dashboard/user/user';
import { UserBookings } from './pages/user-dashboard/user-bookings/user-bookings';
import { UserComments } from './pages/user-dashboard/user-comments/user-comments';
import { UserBookingsList } from './pages/user-dashboard/user-bookings/user-bookings-list/user-bookings-list';
import { UpdateHall } from './pages/administration/halls/update-hall/update-hall';

export const routes: Routes = [
  // Home
  { path: '', component: Home },

  // Admin Section
  {
    path: 'admin',
    component: Administration,
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
      },
      // Theaters admin
      {
        path: 'theaters',
        component: TheatersAdmin,
        children: [
          { path: 'search', component: TheatersList },
          { path: 'new-theater', component: NewTheater },
          { path: '', redirectTo: 'search', pathMatch: 'full' },
        ],
      },
      // Halls admin
      {
        path: 'halls',
        component: HallsAdmin,
        children: [
          { path: 'search', component: HallsList },
          { path: 'new-hall', component: NewHall },
          // NEW: Edit/Update route
          { path: ':theaterId/:hallId/edit', component: UpdateHall },
          { path: '', redirectTo: 'search', pathMatch: 'full' },
        ],
      },
      // Movies admin
      {
        path: 'movies',
        component: MoviesAdmin,
        children: [
          { path: 'search', component: MoviesAdminList },
          { path: 'new-movie', component: NewMovie },
          { path: '', redirectTo: 'search', pathMatch: 'full' },
        ],
      },
      // Screenings admin
      {
        path: 'screenings',
        component: ScreeningsAdmin,
        children: [
          { path: 'search', component: ScreeningsList },
          { path: 'new-screening', component: NewScreening },
          { path: '', redirectTo: 'search', pathMatch: 'full' },
        ],
      },
      // Comments admin
      {
        path: 'comments',
        component: CommentsAdmin,
        children: [{ path: 'search', component: CommentsList }],
      },
      {
        path: 'users',
        component: UsersAdmin,
        children: [
          { path: 'search', component: UsersList },
          { path: 'new-user', component: NewUser },
          { path: ':userId/edit', component: EditUser },
          { path: '', redirectTo: 'search', pathMatch: 'full' },
        ],
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // Auth Section
  {
    path: 'auth',
    component: Authentication,
    children: [
      { path: 'login', component: LoginForm },
      { path: 'register', component: SignUpForm },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: 'user',
    component: UserDashboard,
    children: [
      {
        path: ':userId',
        component: UserComponent,
      },
      {
        path: ':userId/bookings',
        component: UserBookings,
        children: [
          { path: 'search', component: UserBookingsList },
          { path: '', redirectTo: 'search', pathMatch: 'full' },
        ],
      },
      {
        path: ':userId/comments',
        component: UserComments,
      },
    ],
  },

  // Public Movies Section
  {
    path: 'movies',
    component: Movies,
    children: [
      { path: 'search', component: MoviesList },
      { path: ':movieId', component: MovieDetails },
      { path: '', redirectTo: 'search', pathMatch: 'full' },
    ],
  },

  {
    path: 'theaters',
    component: TheatersMoviesSearch,
    children: [
      { path: 'search', component: TheatersList },
      { path: '', redirectTo: 'search', pathMatch: 'full' },
    ],
  },

  // Bookings Section (for users)
  {
    path: 'bookings',
    component: BookingsAdmin,
    children: [
      { path: 'new-booking', component: NewBooking },
      { path: '', redirectTo: 'new-booking', pathMatch: 'full' },
    ],
  },

  // Static/Legal Pages
  { path: 'privacy-policy', component: PrivacyPolicy },
  { path: 'terms-and-conditions', component: TermsAndConditions },
  { path: 'legal-notices', component: LegalNotices },
  { path: 'cookie-policy', component: CookiePolicy },

  // Fallback or error route
  //{ path: '**', redirectTo: '' },
];
