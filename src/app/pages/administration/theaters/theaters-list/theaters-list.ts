import { Component, effect, inject, OnInit } from '@angular/core';
import { TheaterService } from '../../../../services/theater.service';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-theaters-list',
  imports: [MatIcon],
  templateUrl: './theaters-list.html',
  styleUrls: ['./theaters-list.css'],
  standalone: true,
})
export class TheatersList implements OnInit {
  theaterService = inject(TheaterService);
  filteredTheaters = this.theaterService.filteredTheaters;
  router = inject(Router);

  ngOnInit() {
    // Load all theaters on component init, which will update filteredTheaters
    if (
      !this.theaterService.allTheaters() ||
      this.theaterService.allTheaters().length === 0
    ) {
      this.theaterService.getAllTheaters().subscribe();
    } else {
      // If already loaded, set filteredTheaters to allTheaters (for safety)
      this.theaterService.filteredTheaters.set(
        this.theaterService.allTheaters()
      );
    }
  }

  constructor() {
    effect(() => {
      console.log('Theater list updated:', this.filteredTheaters());
    });
  }
  // Navigate to /bookings passing theaterId as query parameter
  goToBookings(theaterId: string) {
    this.router.navigate(['/bookings','new-booking'], { queryParams: { theaterId } });
  }
}
