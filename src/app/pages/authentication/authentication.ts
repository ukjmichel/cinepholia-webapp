import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-authentication',
  imports: [RouterModule,CommonModule],
  templateUrl: './authentication.html',
  styleUrl: './authentication.css'
})
export class Authentication {

}
