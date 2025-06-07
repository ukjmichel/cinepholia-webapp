import { Component, effect, signal, Signal } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { HallService } from '../../../../services/halls.service';
import { TheaterService } from '../../../../services/theater.service';
import { Theater } from '../../../../models/theater.model';

@Component({
  selector: 'app-new-hall',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
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
  theaters: Signal<Theater[]>; // <-- Ajout du signal pour les cinémas

  constructor(
    private fb: FormBuilder,
    private hallService: HallService,
    private theaterService: TheaterService
  ) {
    this.theaters = this.theaterService.allTheaters; // <-- Récupère les cinémas
    this.hallForm = this.fb.group({
      theaterId: ['', Validators.required],
      hallId: ['', Validators.required],
      rows: [5, [Validators.required, Validators.min(1)]],
      columns: [10, [Validators.required, Validators.min(1)]],
    });

    // Charge les cinémas si la liste est vide
    if (
      !this.theaterService.allTheaters() ||
      this.theaterService.allTheaters().length === 0
    ) {
      this.theaterService.getAllTheaters().subscribe();
    }

    this.hallForm.get('rows')!.valueChanges.subscribe(() => this.buildGrid());
    this.hallForm
      .get('columns')!
      .valueChanges.subscribe(() => this.buildGrid());
    this.buildGrid();
  }

  buildGrid() {
    const rows = this.hallForm.get('rows')!.value || 0;
    const columns = this.hallForm.get('columns')!.value || 0;
    const oldGrid = this.seatsGrid;
    const newGrid: string[][] = [];
    let seatNum = 1;
    for (let i = 0; i < rows; i++) {
      newGrid[i] = [];
      for (let j = 0; j < columns; j++) {
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
          setTimeout(() => this.resetForm(), 3000);
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
