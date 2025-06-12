// halls-list.ts
import { Component, effect, inject } from '@angular/core';

import { Hall } from '../../../../models/hall.model';
import { HallService } from '../../../../services/halls.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-halls-list',
  imports: [MatIcon],
  templateUrl: './halls-list.html',
  styleUrl: './halls-list.css',
  standalone: true,
})
export class HallsList {
  hallService = inject(HallService);
  createdHalls = this.hallService.createdHalls;

  constructor() {
    effect(() => {
      console.log('Hall list updated:', this.hallService.createdHalls());
    });
  }

  getSeatCount(hall: Hall): number {
    return hall.seatsLayout
      ? hall.seatsLayout.reduce(
          (total, row) => total + row.filter((s) => s !== 'x').length,
          0
        )
      : 0;
  }
}
