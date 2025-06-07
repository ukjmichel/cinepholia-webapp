import { Component } from '@angular/core';
import { MoviesFilter } from '../../filters/movies-filter/movies-filter';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-movies',
  imports: [ MoviesFilter, RouterModule],
  templateUrl: './movies.html',
  styleUrl: './movies.css',
})
export class Movies {}
