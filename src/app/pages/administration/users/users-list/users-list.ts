// src/app/pages/administration/users/users-list/users-list.ts

import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  UserService,
  User,
  UserSearchFilters,
} from '../../../../services/user.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.css'],
})
export class UsersList {
  filters: UserSearchFilters = {
    userId: '',
    username: '',
    firstName: '',
    lastName: '',
    email: '',
  };

  users:Signal<User[]>;

  constructor(public userService: UserService) {
    // Load all users on init
    this.users = this.userService.users;
  }

  onFilter() {
    this.userService.searchUsers({ ...this.filters });
  }
}
