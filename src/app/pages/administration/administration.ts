import { Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-administration',
  imports: [MatFormFieldModule, MatSelectModule, RouterModule],
  templateUrl: './administration.html',
  styleUrl: './administration.css',
})
export class Administration {
  selected = 'dashboard';

  constructor(private router: Router) {}

  onModuleChange(value: string) {
    if (value === 'theaters' || 'halls') {
      this.router.navigate(['/' + 'admin/' + value]);
    } else {
      this.router.navigate(['/' + 'admin/']);
    }
  }
}
