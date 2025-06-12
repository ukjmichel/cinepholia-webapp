import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { QRCodeComponent } from 'angularx-qrcode';
import { BookingService } from '../../../services/booking.service';
import { AuthFacade } from '../../../store/auth/auth.facade';

@Component({
  selector: 'app-bookings-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule, QRCodeComponent],
  templateUrl: './bookings-list.html',
  styleUrls: ['./bookings-list.css'],
})
export class BookingsList {
  // Holds all bookings for the user
  allBookings = signal<any[]>([]);

  // Computed: pending bookings, sorted by date DESC
  pendingBookings = computed(() =>
    this.allBookings()
      .filter((b) => b.status === 'pending')
      .sort(
        (a, b) =>
          new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime()
      )
  );

  // Computed: confirmed bookings, sorted by date DESC
  usedBookings = computed(() =>
    this.allBookings()
      .filter((b) => b.status === 'used')
      .sort(
        (a, b) =>
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      )
  );

  private bookingService = inject(BookingService);
  private authFacade = inject(AuthFacade);

  constructor() {
    const user = this.authFacade.user?.();
    const userId = user?.userId;
    if (userId) {
      this.bookingService
        .getBookingsByUserId(userId)
        .subscribe((bookings) => this.allBookings.set(bookings));
    }
  }
}
