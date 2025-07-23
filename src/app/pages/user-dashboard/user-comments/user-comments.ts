import { Component, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommentService } from '../../../services/comment.service';
import { BookingCommentWithMovieAndUser } from '../../../models/comment.model';
import { AuthFacade } from '../../../store/auth/auth.facade';

import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-comments',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule, MatIconModule],
  templateUrl: './user-comments.html',
  styleUrl: './user-comments.css',
})
export class UserComments {
  comments: Signal<BookingCommentWithMovieAndUser[]>;

  constructor(
    private commentService: CommentService,
    private authFacade: AuthFacade
  ) {
    const user = this.authFacade.user();

    this.comments = user
      ? toSignal(this.commentService.getCommentsByUserId(user.userId), {
          initialValue: [],
        })
      : computed(() => []); 
  }
}
