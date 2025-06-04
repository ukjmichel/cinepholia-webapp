import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HallService } from '../../../../services/halls.service';

@Component({
  selector: 'app-new-hall',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './new-hall.html',
  styleUrl: './new-hall.css',
})
export class NewHall {
  apiError = signal('');
  successMessage = signal('');
  isLoading = signal(false);
  hallForm: FormGroup;
  seatsGrid: string[][] = [];

  constructor(private fb: FormBuilder, private hallService: HallService) {
    this.hallForm = this.fb.group({
      theaterId: ['', Validators.required],
      hallId: ['', Validators.required],
      rows: [5, [Validators.required, Validators.min(1)]],
      columns: [10, [Validators.required, Validators.min(1)]],
    });

    // Whenever rows or columns change, update the grid
    this.hallForm.get('rows')!.valueChanges.subscribe(() => this.buildGrid());
    this.hallForm
      .get('columns')!
      .valueChanges.subscribe(() => this.buildGrid());
    this.buildGrid();
  }

  buildGrid() {
    const rows = this.hallForm.get('rows')!.value || 0;
    const columns = this.hallForm.get('columns')!.value || 0;
    // Preserve previous values if possible
    const oldGrid = this.seatsGrid;
    const newGrid: string[][] = [];
    let seatNum = 1;
    for (let i = 0; i < rows; i++) {
      newGrid[i] = [];
      for (let j = 0; j < columns; j++) {
        // Reuse old value or default to incremented seat number
        newGrid[i][j] = oldGrid[i]?.[j] ?? String(seatNum++);
      }
    }
    this.seatsGrid = newGrid;
  }

  onSeatChange(i: number, j: number, value: string) {
    this.seatsGrid[i][j] = value;
  }

  onSubmit() {
    if (this.hallForm.invalid) return;

    this.isLoading.set(true);
    this.apiError.set('');
    this.successMessage.set('');

    const { theaterId, hallId } = this.hallForm.value;

    this.hallService
      .addHall({
        theaterId,
        hallId,
        seatsLayout: this.seatsGrid,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('La salle a été créée avec succès !');
          // Optional: Reset form and grid after success
          setTimeout(() => {
            this.resetForm();
          }, 3000);
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err.error && err.error.message) {
            this.apiError.set(err.error.message);
          } else {
            this.apiError.set('Erreur lors de la création de la salle.');
          }
        },
      });
  }

  resetForm() {
    this.hallForm.reset({
      theaterId: '',
      hallId: '',
      rows: 5,
      columns: 10,
    });
    this.buildGrid();
    this.successMessage.set('');
    this.apiError.set('');
  }

  clearMessages() {
    this.apiError.set('');
    this.successMessage.set('');
  }

  onSeatInputChange(event: Event, i: number, j: number) {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.onSeatChange(i, j, target.value);
    }
  }
}
