import { Component, Signal, effect, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AuthFacade } from '../../store/auth/auth.facade';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard {
  selected = 'informations';
  user!: Signal<User | null>;
  loaded = signal(false);

  constructor(private router: Router, private authFacade: AuthFacade) {
    // ✅ now we can use authFacade safely
    this.user = this.authFacade.user;

    // Ensure user is fetched on reload
    this.authFacade.getUser();

    // Reactive redirect when user loads
    effect(() => {
      const u = this.user();

      // Mark as loaded once we receive the first result (even null)
      this.loaded.set(true);

      if (!this.loaded()) return;

      if (u && this.router.url === '/user') {
        this.router.navigate([`/user/${u.userId}`]);
      } else if (!u && this.router.url.startsWith('/user')) {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  onModuleChange(value: string): void {
    const u = this.user();
    if (!u) return;

    const base = `/user/${u.userId}`;
    const path =
      {
        informations: base,
        reservations: `${base}/bookings`,
        avis: `${base}/comments`,
      }[value] || base;

    this.router.navigate([path]);
  }
}
