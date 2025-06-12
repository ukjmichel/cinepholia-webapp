import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { NgxQrcodeComponent } from 'angularx-qrcode'; // NEW (standalone)
import { BookingService } from '../../../services/booking.service';
import { AuthFacade } from '../../../store/auth/auth.facade';

@Component({
  selector: 'app-bookings-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule, NgxQrcodeComponent],
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
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      )
  );

  // Computed: confirmed bookings, sorted by date DESC
  confirmedBookings = computed(() =>
    this.allBookings()
      .filter((b) => b.status === 'confirmed')
      .sort(
        (a, b) =>
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      )
  );

  constructor(
    private bookingService: BookingService,
    private authFacade: AuthFacade
  ) {
    const userId = this.authFacade.user()?.userId;
    if (userId) {
      this.bookingService
        .getBookingsByUserId(userId)
        .subscribe((bookings) => this.allBookings.set(bookings));
    }
  }
}
