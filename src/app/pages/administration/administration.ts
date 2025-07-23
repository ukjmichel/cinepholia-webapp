import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, RouterModule } from '@angular/router';
import { AuthFacade } from '../../store/auth/auth.facade';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-administration',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, RouterModule],
  templateUrl: './administration.html',
  styleUrl: './administration.css',
})
export class Administration implements OnInit {
  selected = 'dashboard';
  role: string | null = null;

  constructor(
    private router: Router,
    private authFacade: AuthFacade,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.role = this.authFacade.user()?.role || null;
    this.cdr.detectChanges();
  }

  onModuleChange(value: string): void {
    this.router.navigate(['/admin/' + value]);
  }

  isAdmin(): boolean {
    return this.role === 'administrateur';
  }
}
