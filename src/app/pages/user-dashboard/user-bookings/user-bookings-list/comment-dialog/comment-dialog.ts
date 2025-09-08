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

import DOMPurify from 'dompurify';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

  /** Sanitized version of the loaded comment */
  sanitizedComment: SafeHtml | null = null;

  constructor(
    public dialogRef: MatDialogRef<CommentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { bookingId: string },
    private bookingService: BookingService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.bookingService.getComment(this.data.bookingId).subscribe({
      next: (result) => {
        if (result && result.comment) {
          this.loadedComment = result;
          // ✅ Sanitize comment to prevent XSS
          const clean = DOMPurify.sanitize(result.comment, {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: [],
          });
          this.sanitizedComment = this.sanitizer.bypassSecurityTrustHtml(clean);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  submitForm() {
    if (this.comment && this.rating !== null) {
      // ✅ Sanitize user input before sending to API
      const cleanComment = DOMPurify.sanitize(this.comment, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });

      this.bookingService
        .saveComment(this.data.bookingId, {
          comment: cleanComment,
          rating: this.rating,
        })
        .subscribe(() => {
          this.dialogRef.close({ comment: cleanComment, rating: this.rating });
        });
    }
  }
}
