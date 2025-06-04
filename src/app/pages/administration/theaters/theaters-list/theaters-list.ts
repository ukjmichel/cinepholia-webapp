import { Component, effect, inject } from '@angular/core';
import { TheaterService } from '../../../../services/theater.service';

@Component({
  selector: 'app-theaters-list',
  imports: [],
  templateUrl: './theaters-list.html',
  styleUrl: './theaters-list.css',
  standalone: true,
})
export class TheatersList {
  theaterService = inject(TheaterService);
  filteredTheaters = this.theaterService.filteredTheaters;
  constructor() {
    effect(() => {
      console.log(
        'Theater list updated:',
        this.theaterService.filteredTheaters()
      );
    });
  }
}
