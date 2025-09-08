// src/app/app.routes.server.ts
import { RenderMode, type ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // prerender static pages
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'movies', renderMode: RenderMode.Prerender },
  { path: 'theaters', renderMode: RenderMode.Prerender },
  { path: 'auth', renderMode: RenderMode.Prerender },
  { path: 'bookings', renderMode: RenderMode.Prerender },
  { path: 'privacy-policy', renderMode: RenderMode.Prerender },
  { path: 'terms-and-conditions', renderMode: RenderMode.Prerender },
  { path: 'legal-notices', renderMode: RenderMode.Prerender },
  { path: 'cookie-policy', renderMode: RenderMode.Prerender },

  // dynamic -> SSR
  { path: 'movies/:movieId', renderMode: RenderMode.Server },
  { path: 'user/:userId', renderMode: RenderMode.Server },
  { path: 'user/:userId/bookings', renderMode: RenderMode.Server },
  { path: 'user/:userId/bookings/search', renderMode: RenderMode.Server },
  { path: 'user/:userId/comments', renderMode: RenderMode.Server },
  {
    path: 'admin/halls/:theaterId/:hallId/edit',
    renderMode: RenderMode.Server,
  },
  { path: 'admin/users/:userId/edit', renderMode: RenderMode.Server },

  // fallback
  { path: '**', renderMode: RenderMode.Server },
];
