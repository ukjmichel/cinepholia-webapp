import { Component, ViewChild, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

import { HallService } from '../../../services/halls.service';
import { TheaterService } from '../../../services/theater.service';
import { CommonModule } from '@angular/common';

/**
 * Admin component to filter halls by cinema.
 * Uses a form and drawer to select a cinema from a dropdown list.
 */
@Component({
  selector: 'app-hall-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSidenavModule,
    MatSelectModule,
    RouterModule,
  ],
  templateUrl: './halls.html',
  styleUrls: ['./halls.css'],
})
export class HallsAdmin {
  /** Reference to the side drawer */
  @ViewChild('drawer') drawer!: MatDrawer;

  /** Form used to filter halls */
  filterForm: FormGroup;

  /** Signal for displaying API error messages */
  apiError = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private hallService: HallService,
    private theaterService: TheaterService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filterForm = this.fb.group({
      theaterId: [''],
    });
  }

  /** Expose the list of theaters from the service */
  get allTheaters() {
    return this.theaterService.allTheaters;
  }

  /** Expose the filtered halls from the service */
  get halls() {
    return this.hallService.createdHalls;
  }

  /**
   * Handle filter form submission.
   * Triggers hall search by selected theater ID.
   */
  onSubmit() {
    const { theaterId } = this.filterForm.value;

    if (!theaterId) {
      this.apiError.set(
        'Veuillez sélectionner un cinéma pour filtrer les salles.'
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

  /**
   * Fetch cinemas when the drawer is opened.
   * @param opened Whether the drawer is opened or not
   */
  onDrawerOpenedChange(opened: boolean) {
    if (opened) {
      this.apiError.set('');
      this.theaterService.getAllTheaters().subscribe();
    }
  }
}
