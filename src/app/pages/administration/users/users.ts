import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/auth.model';
import { UserSearchFilters, UserService } from '../../../services/user.service';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    RouterOutlet,
    RouterModule,
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class UsersAdmin implements OnInit {
  @ViewChild('drawer') drawer!: MatDrawer;

  // Filters used for the API request (sent as query params)
  filters: UserSearchFilters = {
    userId: '',
    username: '',
    firstName: '',
    lastName: '',
    email: '',
  };

  constructor(public userService: UserService) {}

  ngOnInit() {
    // Initial load: all users (no filter)
    this.onFilter();
  }

  /**
   * Called when the user submits the filter form (drawer).
   * Triggers the service to update its users signal.
   */
  onFilter() {
    this.userService.searchUsers({ ...this.filters });
  }

  onDrawerOpenedChange(opened: boolean) {
    if (opened) this.userService.usersApiError.set('');
  }

  // Optionally, you can expose signals for use in template
  get users() {
    return this.userService.users();
  }

  get apiError() {
    return this.userService.usersApiError();
  }
}
