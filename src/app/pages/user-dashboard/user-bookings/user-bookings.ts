import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-bookings',
  imports: [MatIcon, RouterModule],
  templateUrl: './user-bookings.html',
  styleUrl: './user-bookings.css',
})
export class UserBookings {}
