import { Component } from '@angular/core';

import { BookingForm } from './booking-form/booking-form';
import { FavoriteMovie } from './favorite-movie/favorite-movie';
import { UpcommingMoviesCarousel } from './upcomming-movies-carousel/upcomming-movies-carousel';
import { CurrentMoviesCarousel } from './current-movies-carousel/current-movies-carousel';
import { SubscribeForm } from './subscribe-form/subscribe-form';
import { ContactForm } from './contact-form/contact-form';
import { SocialIcons } from "./social-icons/social-icons";


@Component({
  selector: 'app-home',
  imports: [
    UpcommingMoviesCarousel,
    BookingForm,
    FavoriteMovie,
    CurrentMoviesCarousel,
    SubscribeForm,
    ContactForm,
    SocialIcons
],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  standalone: true,
})
export class Home {}
