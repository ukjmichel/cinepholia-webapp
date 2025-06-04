import { Component, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { Theater } from '../../../models/theater.model';
import { TheaterService } from '../../../services/theater.service';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-theater-admin',
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
  templateUrl: './theaters.html',
  styleUrls: ['./theaters.css'],
})
export class TheatersAdmin {
  @ViewChild('drawer') drawer!: MatDrawer;
  filterForm: FormGroup;
  apiError = '';

  constructor(
    private fb: FormBuilder,
    private theaterService: TheaterService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filterForm = this.fb.group({
      theaterId: [''],
      postalCode: [''],
      city: [''],
    });
  }

  onSubmit() {
    if (
      !this.filterForm.value.theaterId &&
      !this.filterForm.value.postalCode &&
      !this.filterForm.value.city
    ) {
      this.apiError = 'Veuillez remplir au moins un champ pour filtrer.';
      return;
    }
    this.apiError = '';

    const filters: { theaterId?: string; city?: string; postalCode?: string } =
      {};
    const { theaterId, postalCode, city } = this.filterForm.value;
    if (theaterId) filters.theaterId = theaterId;
    if (postalCode) filters.postalCode = postalCode;
    if (city) filters.city = city;

    this.theaterService.searchMovieTheaters(filters).subscribe({
      next: () => {
        if (this.drawer) this.drawer.close();
        this.router.navigate(['search'], { relativeTo: this.route });
      },
      error: () => {
        this.apiError = 'Erreur lors de la récupération des cinémas.';
        this.theaterService.filteredTheaters.set([]);
      },
    });
  }

  onDrawerOpenedChange(opened: boolean) {
    if (opened) {
      this.apiError = '';
    }
  }
}
