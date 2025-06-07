import { Component, effect, inject } from '@angular/core';
import { MoviesList } from '../../../../components/movies-list/movies-list';

@Component({
  selector: 'app-admin-movie-list',
  standalone: true,
  imports: [MoviesList],
  templateUrl: './movies-list.html',
  styleUrl: './movies-list.css',
})
export class MoviesAdminList {}
