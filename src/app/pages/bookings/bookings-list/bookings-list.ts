import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';
import { BookingService } from '../../../services/booking.service';
import { AuthFacade } from '../../../store/auth/auth.facade';
import { CommentDialog } from './comment-dialog/comment-dialog';

@Component({
  selector: 'app-bookings-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    QRCodeComponent,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './bookings-list.html',
  styleUrls: ['./bookings-list.css'],
})
export class BookingsList {
  // Signals
  allBookings = signal<any[]>([]);

  // Dependency injection
  private bookingService = inject(BookingService);
  private authFacade = inject(AuthFacade);
  private dialog = inject(MatDialog);

  // Computed: pending bookings, sorted by date ASC
  pendingBookings = computed(() =>
    this.allBookings()
      .filter((b) => b.status === 'pending')
      .sort(
        (a, b) =>
          new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime()
      )
  );

  // Computed: used bookings, sorted by date DESC
  usedBookings = computed(() =>
    this.allBookings()
      .filter((b) => b.status === 'used')
      .sort(
        (a, b) =>
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      )
  );

  constructor() {
    const user = this.authFacade.user?.();
    const userId = user?.userId;
    if (userId) {
      this.bookingService
        .getBookingsByUserId(userId)
        .subscribe((bookings) => this.allBookings.set(bookings));
    }
  }

  openComment(booking: any) {
    this.dialog
      .open(CommentDialog, {
        width: '350px',
        data: { bookingId: booking.bookingId },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          booking.comment = result.comment;
          booking.rating = result.rating;
        }
      });
  }
}
