import { Component, Inject, OnInit, signal } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { BookingComment } from '../../../../../models/comment.model';
import { BookingService } from '../../../../../services/booking.service';

@Component({
  selector: 'app-comment-dialog',
  standalone: true,
  templateUrl: './comment-dialog.html',
  styleUrl: './comment-dialog.css',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
  ],
})
export class CommentDialog implements OnInit {
  comment = '';
  rating: number | null = null;
  ratings = [0, 1, 2, 3, 4, 5];
  loading = signal(true);
  loadedComment: BookingComment | null = null;

  constructor(
    public dialogRef: MatDialogRef<CommentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { bookingId: string },
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    // Fetch comment when dialog opens
    console.log('CommentDialog opened with data:', this.data);
    this.bookingService.getComment(this.data.bookingId).subscribe({
      next: (result) => {
        console.log('Fetched comment from API:', result);
        if (result && result.comment) {
          this.loadedComment = result;
        }
        this.loading.set(false);
      },
      error: () => {
        // No comment found (404) -> show form
        this.loading.set(false);
      },
    });
  }

  submitForm() {
    if (this.comment && this.rating !== null) {
      this.bookingService
        .saveComment(
          this.data.bookingId, // First argument: bookingId
          {
            comment: this.comment,
            rating: this.rating,
          }
        )
        .subscribe(() => {
          this.dialogRef.close({ comment: this.comment, rating: this.rating });
        });
    }
  }
}
