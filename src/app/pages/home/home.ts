import { Component } from '@angular/core';

import { UpcommingMoviesCarouselComponent } from './upcomming-movies-carousel/upcomming-movies-carousel';
import { BookingForm } from './booking-form/booking-form';

@Component({
  selector: 'app-home',
  imports: [UpcommingMoviesCarouselComponent, BookingForm],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  standalone: true,
})
export class Home {}
