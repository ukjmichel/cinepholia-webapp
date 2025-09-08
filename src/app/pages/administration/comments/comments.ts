import { Component, signal, ViewChild, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { CommentService } from '../../../services/comment.service';
import { MovieService } from '../../../services/movie.service';
import {
  BookingComment,
  BookingCommentWithMovieAndUser,
} from '../../../models/comment.model';
import { Movie } from '../../../models/movie.model';
import { Observable } from 'rxjs';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

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
    MatProgressSpinnerModule
],
  templateUrl: './comments.html',
  styleUrls: ['./comments.css'],
})
export class CommentsAdmin implements OnInit {
  @ViewChild('drawer') drawer!: MatDrawer;
  filterForm: FormGroup;
  apiError = signal<string>('');
  comments = signal<BookingComment[]>([]);
  allMovies = signal<Movie[]>([]);
  isLoading = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private commentService: CommentService,
    private movieService: MovieService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filterForm = this.fb.group({
      movieId: [''], // '' = tous les films
      status: [''], // '' = tous les statuts
    });
  }

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.isLoading.set(true);
    this.movieService.getAllMovies().subscribe({
      next: (movies: Movie[]) => {
        this.allMovies.set(movies);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.apiError.set('Erreur lors du chargement des films.');
      },
    });
  }

  onSubmit(): void {
    this.isLoading.set(true);
    this.apiError.set('');
    const { movieId, status } = this.filterForm.value;

    const params: { status?: string; movieId?: string } = {};
    if (status) params.status = status;
    if (movieId) params.movieId = movieId;

    this.commentService.searchComments(params).subscribe({
      next: (comments: BookingComment[]) => {
        // <-- Change ici
        this.comments.set(comments);
        this.isLoading.set(false);
        if (this.drawer) this.drawer.close();
        this.router.navigate(['search'], { relativeTo: this.route });
      },
      error: () => {
        this.isLoading.set(false);
        this.apiError.set('Erreur lors de la récupération des commentaires.');
        this.comments.set([]);
      },
    });
  }

  onDrawerOpenedChange(opened: boolean): void {
    if (opened) this.apiError.set('');
  }
}
