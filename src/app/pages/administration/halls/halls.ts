import { Component, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { Hall } from '../../../models/hall.model';

import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HallService } from '../../../services/halls.service';

@Component({
  selector: 'app-hall-admin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSidenavModule,
    RouterModule,
  ],
  templateUrl: './halls.html',
  styleUrls: ['./halls.css'],
})
export class HallsAdmin {
  @ViewChild('drawer') drawer!: MatDrawer;
  filterForm: FormGroup;
  apiError = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private hallService: HallService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filterForm = this.fb.group({
      theaterId: [''],
    });
  }

  onSubmit() {
    const { theaterId } = this.filterForm.value;

    if (!theaterId) {
      this.apiError.set(
        'Veuillez entrer un Cinéma ID pour filtrer les salles.'
      );
      return;
    }
    this.apiError.set('');

    this.hallService.getHallsByTheaterId(theaterId).subscribe({
      next: () => {
        if (this.drawer) this.drawer.close();
        this.router.navigate(['search'], { relativeTo: this.route });
      },
      error: () => {
        this.apiError.set('Erreur lors de la récupération des salles.');
        this.hallService.createdHalls.set([]);
      },
    });
  }

  onDrawerOpenedChange(opened: boolean) {
    if (opened) {
      this.apiError.set('');
    }
  }
}
