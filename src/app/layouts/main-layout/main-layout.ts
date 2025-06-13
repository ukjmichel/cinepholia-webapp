import { Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {
  BASE_NAV_LINKS,
  USER_NAV_LINKS,
  EMPLOYYEE_NAV_LINKS,
  ADMIN_NAV_LINKS,
} from '../../shared/nav-links';
import { RouterModule } from '@angular/router';
import { AuthFacade } from '../../store/auth/auth.facade';

@Component({
  selector: 'app-main-layout',
  imports: [
    MatIconModule,
    MatSidenavModule,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css'],
  standalone: true,
})
export class MainLayout {
  authFacade = inject(AuthFacade);
  isLogged = this.authFacade.isLogged;

  // Debugging: Log the user data
  user = computed(() => {
    const userData = this.authFacade.user();
    return userData;
  });

  // Debugging: Log the role
  role = computed(() => {
    const userRole = this.user()?.role;
    return userRole;
  });

  // Debugging: Log the computed navlinks
  navlinks = computed(() => {
    const currentRole = this.role();

    switch (currentRole) {
      case 'utilisateur':
        return USER_NAV_LINKS;
      case 'employé':
        return EMPLOYYEE_NAV_LINKS;
      case 'administrateur':
        return ADMIN_NAV_LINKS;
      default:
        return BASE_NAV_LINKS;
    }
  });

  logout() {
    this.authFacade.logout();
    console.log('Logged out');
    console.log('Is logged in:', this.isLogged());
  }
}
