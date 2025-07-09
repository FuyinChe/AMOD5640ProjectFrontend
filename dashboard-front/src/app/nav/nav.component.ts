import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav',
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent {
  constructor(public auth: AuthService) {}
}
