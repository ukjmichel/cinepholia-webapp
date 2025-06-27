import { Component, Signal } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, RouterModule } from '@angular/router';
import { AuthFacade } from '../../store/auth/auth.facade';
@Component({
  selector: 'app-administration',
  imports: [MatFormFieldModule, MatSelectModule, RouterModule],
  templateUrl: './administration.html',
  styleUrl: './administration.css',
})
export class Administration {
  selected = 'dashboard';
  role: string;

  constructor(private router: Router, private authFacade: AuthFacade) {
    this.role = this.authFacade.user()?.role || '';
  }

  onModuleChange(value: string) {
    this.router.navigate(['/' + 'admin/' + value]);
  }
}
