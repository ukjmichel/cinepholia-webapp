import { Component, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CommentService } from '../../../services/comment.service';
import { BookingComment } from '../../../models/comment.model';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-comment-admin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSidenavModule,
    MatSelectModule,
    RouterModule,
    CommonModule,
  ],
  templateUrl: './comments.html',
  styleUrls: ['./comments.css'],
})
export class CommentsAdmin {
  @ViewChild('drawer') drawer!: MatDrawer;
  filterForm: FormGroup;
  apiError = signal<string>('');
  comments = signal<BookingComment[]>([]);

  constructor(
    private fb: FormBuilder,
    private commentService: CommentService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filterForm = this.fb.group({
      movieId: [''],
      status: [''],
      q: [''],
    });
  }

  onSubmit() {
    const { movieId, status, q } = this.filterForm.value;
    if (!movieId && !status && !q) {
      this.apiError.set('Merci de renseigner au moins un filtre.');
      return;
    }
    this.apiError.set('');

    this.commentService.searchComments({ movieId, status, q }).subscribe({
      next: (comments) => {
        this.comments.set(comments);
        if (this.drawer) this.drawer.close();
        this.router.navigate(['search'], { relativeTo: this.route });
      },
      error: () => {
        this.apiError.set('Erreur lors de la récupération des commentaires.');
        this.comments.set([]);
      },
    });
  }

  onDrawerOpenedChange(opened: boolean) {
    if (opened) this.apiError.set('');
  }
}
