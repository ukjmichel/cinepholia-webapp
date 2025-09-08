import { Component, effect, inject, Signal } from '@angular/core';
import { ScreeningService } from '../../../../services/screening.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ScreeningWithDetails } from '../../../../models/screening.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-screenings-list',
  templateUrl: './screenings-list.html',
  styleUrl: './screenings-list.css',
  standalone: true,
  imports: [MatCardModule, MatIconModule, CommonModule],
})
export class ScreeningsList {
  screeningService = inject(ScreeningService);
  filteredScreenings = this.screeningService.filteredScreenings as Signal<
    ScreeningWithDetails[]
  >;

  constructor() {
    effect(() => {
      console.log('[Screening list updated]', this.filteredScreenings());
    });
  }
}
