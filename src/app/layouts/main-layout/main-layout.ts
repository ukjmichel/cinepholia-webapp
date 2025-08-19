import {
  Component,
  computed,
  inject,
  signal,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterModule } from '@angular/router';

import {
  BASE_NAV_LINKS,
  USER_NAV_LINKS,
  EMPLOYYEE_NAV_LINKS,
  ADMIN_NAV_LINKS,
} from '../../shared/nav-links';
import { AuthFacade } from '../../store/auth/auth.facade';
import { Footer } from '../../components/footer/footer';
import { CommonModule } from '@angular/common';
import { ContactInfos } from "../../components/contact-infos/contact-infos";

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatSelectModule,
    RouterModule,
    Footer,
    ContactInfos
],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css'],
})
export class MainLayout implements AfterViewInit {
  authFacade = inject(AuthFacade);
  router = inject(Router);

  // Access drawer instance to control it programmatically
  @ViewChild('drawer') drawer!: MatDrawer;

  isLogged = this.authFacade.isLogged;

  // Get user data from the store
  user = computed(() => this.authFacade.user());

  // Get role from user object
  role = computed(() => this.user()?.role);

  // Determine nav links based on role
  navlinks = computed(() => {
    switch (this.role()) {
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

  ngAfterViewInit() {
    // Close drawer when navigating to a new route
    this.router.events.subscribe(() => {
      if (this.drawer?.opened) {
        this.drawer.close();
      }
    });
  }

  logout() {
    this.authFacade.logout();
    console.log('Logged out');
    console.log('Is logged in:', this.isLogged());
    this.drawer.close(); // Close drawer on logout
  }
}
