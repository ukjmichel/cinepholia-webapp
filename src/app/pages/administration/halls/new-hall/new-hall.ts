// new-hall.ts
import {
  Component,
  Signal,
  signal,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { Hall } from '../../../../models/hall.model';

type HallFormValue = {
  theaterId: string;
  hallId: string;
  rows: number;
  columns: number;
  quality: Hall['quality'];
};

@Component({
  selector: 'app-new-hall',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
  ],
  templateUrl: './new-hall.html',
  styleUrls: ['./new-hall.css'],
})
export class NewHall implements OnInit {
  apiError = signal('');
  successMessage = signal('');
  isLoading = signal(false);

  hallForm: FormGroup;
  seatsGrid: string[][] = [];
  theaters: Signal<Theater[]>;

  constructor(
    private fb: FormBuilder,
    private hallService: HallService,
    private theaterService: TheaterService,
    private cdr: ChangeDetectorRef
  ) {
    this.theaters = this.theaterService.allTheaters;

    this.hallForm = this.fb.group({
      theaterId: ['', Validators.required],
      hallId: ['', Validators.required],
      rows: this.fb.control(5, {
        validators: [Validators.required, Validators.min(1)],
      }),
      columns: this.fb.control(10, {
        validators: [Validators.required, Validators.min(1)],
      }),
      quality: this.fb.control('2D' as Hall['quality'], {
        validators: [Validators.required],
      }),
    });

    if (
      !this.theaterService.allTheaters() ||
      this.theaterService.allTheaters().length === 0
    ) {
      this.theaterService.getAllTheaters().subscribe();
    }
  }

  ngOnInit(): void {
    // Fresh defaults on refresh
    this.hallForm.reset(
      {
        theaterId: '',
        hallId: '',
        rows: 5,
        columns: 10,
        quality: '2D' as Hall['quality'],
      },
      { emitEvent: false }
    );
    this.seatsGrid = [];
    this.buildGrid();
    this.cdr.markForCheck();
  }

  /** Rebuild grid; preserve existing labels; number new seats sequentially */
  buildGrid() {
    const rawRows = Number(this.hallForm.get('rows')!.value);
    const rawCols = Number(this.hallForm.get('columns')!.value);
    const rows = Number.isFinite(rawRows) && rawRows >= 1 ? rawRows : 1;
    const columns = Number.isFinite(rawCols) && rawCols >= 1 ? rawCols : 1;

    const oldGrid = this.seatsGrid;

    // Highest existing numeric label
    let maxNum = 0;
    for (const row of oldGrid) {
      for (const cell of row ?? []) {
        if (typeof cell === 'string' && /^\d+$/.test(cell)) {
          const n = Number(cell);
          if (n > maxNum) maxNum = n;
        }
      }
    }

    let seatNum = maxNum + 1;
    const newGrid: string[][] = Array.from({ length: rows }, (_, i) =>
      Array.from(
        { length: columns },
        (_, j) => oldGrid[i]?.[j] ?? String(seatNum++)
      )
    );

    this.seatsGrid = newGrid;
    this.cdr.markForCheck(); // ensure DOM updates immediately
  }

  /** Triggered by (change)/(blur)/(keyup.enter) on rows/columns */
  onDimsChange(): void {
    this.buildGrid();
  }

  onSeatChange(i: number, j: number, value: string) {
    this.seatsGrid[i][j] = value;
    this.cdr.markForCheck();
  }

  onSeatInputChange(event: Event, i: number, j: number) {
    const target = event.target as HTMLInputElement;
    if (target) this.onSeatChange(i, j, target.value);
  }

  onSubmit() {
    if (this.hallForm.invalid) return;

    this.isLoading.set(true);
    this.apiError.set('');
    this.successMessage.set('');

    const { theaterId, hallId, quality } =
      this.hallForm.getRawValue() as HallFormValue;

    this.hallService
      .addHall({
        theaterId,
        hallId,
        seatsLayout: this.seatsGrid,
        quality,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('La salle a été créée avec succès !');
          setTimeout(() => this.resetForm(), 3000);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.apiError.set(
            err?.error?.message ?? 'Erreur lors de la création de la salle.'
          );
        },
      });
  }

  resetForm() {
    this.hallForm.reset({
      theaterId: '',
      hallId: '',
      rows: 5,
      columns: 10,
      quality: '2D' as Hall['quality'],
    });
    this.seatsGrid = [];
    this.buildGrid();
    this.successMessage.set('');
    this.apiError.set('');
    this.cdr.markForCheck();
  }

  clearMessages() {
    this.apiError.set('');
    this.successMessage.set('');
  }
}
