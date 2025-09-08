import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes'; // Fichier qui définit les routes de l'application

import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser'; // Hydratation côté client pour SSR

import { provideStore } from '@ngrx/store';
import { reducers } from './store'; // Réducteurs NGRX (état global)
import { provideEffects } from '@ngrx/effects';
import { AuthEffects } from './store/auth/auth.effects'; // Effets liés à l'authentification

import { HTTP_INTERCEPTORS, provideHttpClient, withFetch } from '@angular/common/http'; // Gestion des requêtes HTTP + Interceptors

import { AuthInterceptor } from './interceptors/auth.interceptor'; // Ton interceptor d'authentification

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), // Capture les erreurs globales (console.error, uncaught exceptions)
    provideZonelessChangeDetection(), // Change detection sans zone.js (performances)

    provideHttpClient(withFetch()), // ⚠️ Obligatoire pour HttpClient + permet aux interceptors de fonctionner

    provideRouter(routes, withViewTransitions()), // Routing Angular avec transition de vues activée

    provideClientHydration(withEventReplay()), // Nécessaire si tu utilises SSR (Server Side Rendering)

    provideStore(reducers), // Configuration du store NgRx (état global)

    provideEffects(AuthEffects), // Activation des effets liés à l'authentification (login, logout, etc.)

    provideAnimations(), // Active les animations Angular (nécessaire pour Angular Material)

    provideNativeDateAdapter(), // Fournit l'adaptateur de date natif (utile pour DatePicker par ex.)

    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }, // Définit le format de date en français

    {
      provide: HTTP_INTERCEPTORS, // Enregistre ton interceptor d'authentification
      useClass: AuthInterceptor,
      multi: true, // Important : permet d'empiler plusieurs interceptors
    },
  ],
};
