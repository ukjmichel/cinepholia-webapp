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
    console.log('User data:', userData);
    return userData;
  });

  // Debugging: Log the role
  role = computed(() => {
    const userRole = this.user()?.role;
    console.log('User role:', userRole);
    return userRole;
  });

  // Debugging: Log the computed navlinks
  navlinks = computed(() => {
    const currentRole = this.role();
    console.log('Computed role for navlinks:', currentRole);

    switch (currentRole) {
      case 'utilisateur':
        console.log('Setting navlinks to USER_NAV_LINKS');
        return USER_NAV_LINKS;
      case 'employé':
        console.log('Setting navlinks to EMPLOYEE_NAV_LINKS');
        return EMPLOYYEE_NAV_LINKS;
      case 'administrateur':
        console.log('Setting navlinks to ADMIN_NAV_LINKS');
        return ADMIN_NAV_LINKS;
      default:
        console.log('Setting navlinks to BASE_NAV_LINKS');
        return BASE_NAV_LINKS;
    }
  });

  logout() {
    this.authFacade.logout();
    console.log('Logged out');
    console.log('Is logged in:', this.isLogged());
  }
}
