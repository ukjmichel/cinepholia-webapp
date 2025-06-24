import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscribe-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatButtonModule],
  templateUrl: './subscribe-form.html',
  styleUrls: ['./subscribe-form.css'],
})
export class SubscribeForm {
  email: string = '';

  router = inject(Router);

  onSubmit(): void {
    if (this.email) {
      this.router.navigate(['/auth', 'login'], {
        queryParams: { email: this.email },
      });
    }
  }
}
