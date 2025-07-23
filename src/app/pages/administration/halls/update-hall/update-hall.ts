import { Component, signal, Signal, effect } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { HallService } from '../../../../services/halls.service';
import { Hall } from '../../../../models/hall.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-hall',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './update-hall.html',
  styleUrl: './update-hall.css',
})
export class UpdateHall {
  apiError = signal('');
  successMessage = signal('');
  isLoading = signal(false);
  hallForm: FormGroup;
  seatsGrid: string[][] = [];
  theaterId = '';
  hallId = '';
  qualityOptions: Hall['quality'][] = ['2D', '3D', 'IMAX', '4DX'];

  constructor(
    private fb: FormBuilder,
    private hallService: HallService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Initialize form
    this.hallForm = this.fb.group({
      hallId: ['', Validators.required],
      quality: ['', Validators.required],
      // Add other fields if needed
    });

    // Get params from URL (admin/halls/:theaterId/:hallId/edit)
    this.route.paramMap.subscribe((params) => {
      this.theaterId = params.get('theaterId')!;
      this.hallId = params.get('hallId')!;
      this.loadHall(); // Load existing hall data
    });
  }

  /** Fetch the hall from the API and initialize form/grid */
  loadHall() {
    this.isLoading.set(true);
    this.apiError.set('');
    this.successMessage.set('');
    this.hallService.searchHall(this.theaterId, this.hallId).subscribe({
      next: (halls) => {
        const hall = halls && halls.length ? halls[0] : null;
        if (hall) {
          this.hallForm.patchValue({
            hallId: hall.hallId,
            quality: hall.quality,
          });
          // Ensure grid is string[][]
          this.seatsGrid = hall.seatsLayout.map((row) =>
            row.map((seat) => String(seat))
          );
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.apiError.set(
          err?.error?.message || 'Erreur lors du chargement de la salle.'
        );
      },
    });
  }

  /** Handle seat grid input change */
  onSeatInputChange(event: Event, i: number, j: number) {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.seatsGrid[i][j] = target.value;
    }
  }

  /** Submit the updated hall to the API */
  onSubmit() {
    if (this.hallForm.invalid) return;
    this.isLoading.set(true);
    this.apiError.set('');
    this.successMessage.set('');

    const hallId = this.hallForm.value.hallId;
    const quality = this.hallForm.value.quality;

    // Send PATCH request
    this.hallService
      .updateHall(this.theaterId, this.hallId, {
        hallId, // support changing ID
        seatsLayout: this.seatsGrid,
        quality,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('Salle mise à jour avec succès !');
          setTimeout(() => {
            this.successMessage.set('');
            this.router.navigate(['/admin/halls']);
          }, 2000);
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err.error && err.error.message) {
            this.apiError.set(err.error.message);
          } else {
            this.apiError.set('Erreur lors de la mise à jour.');
          }
        },
      });
  }
}
