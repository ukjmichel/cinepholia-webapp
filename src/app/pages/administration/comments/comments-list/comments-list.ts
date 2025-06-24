import { Component, Signal, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CommentService } from '../../../../services/comment.service';
import { BookingComment } from '../../../../models/comment.model';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-comments-list',
  standalone: true,
  imports: [MatIconModule, CommonModule, MatButtonModule],
  templateUrl: './comments-list.html',
  styleUrl: './comments-list.css',
})
export class CommentsList {
  comments: Signal<BookingComment[]>;
  selectedComment: BookingComment | null = null;

  constructor(public commentService: CommentService) {
    this.comments = commentService.commentsList;
    effect(() => {
      console.log('Comments:', this.comments());
    });
  }

  confirmComment(comment: BookingComment, event: MouseEvent) {
    event.stopPropagation(); // Prevent card selection
    this.commentService.confirmComment(comment.bookingId).subscribe({
      next: (updatedComment) => {
        // Update the comment in the signal's array (immutable update)
        const current = this.comments();
        const updated = current.map((c) =>
          c.bookingId === updatedComment.bookingId ? updatedComment : c
        );
        this.commentService.commentsList.set(updated);
      },
      error: () => {
        // Optionally handle error, e.g., show a message
        alert('Erreur lors de la confirmation du commentaire.');
      },
    });
  }
  deleteComment(comment: BookingComment, event: MouseEvent) {
    event.stopPropagation(); // Prevent card selection
    if (confirm('Voulez-vous vraiment supprimer ce commentaire ?')) {
      this.commentService.deleteComment(comment.bookingId).subscribe({
        next: () => {
          // Remove the deleted comment from the list
          const current = this.comments();
          const updated = current.filter(
            (c) => c.bookingId !== comment.bookingId
          );
          this.commentService.commentsList.set(updated);
        },
        error: () => {
          alert('Erreur lors de la suppression du commentaire.');
        },
      });
    }
  }
}
