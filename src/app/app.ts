import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { AuthFacade } from './store/auth/auth.facade';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MainLayout],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected title = 'cinepholia-webapp';
  constructor(private authFacade: AuthFacade) {}

  ngOnInit() {
    this.authFacade.getUser();
  }
}
