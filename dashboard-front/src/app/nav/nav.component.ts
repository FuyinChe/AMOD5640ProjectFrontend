import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
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
export class NavComponent implements OnInit {
  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Force navigation refresh
    console.log('Navigation component loaded');
  }

  handleDashboardClick(event: Event, route: string): void {
    if (!this.auth.isLoggedIn()) {
      event.preventDefault();
      // Store the intended destination for redirect after login
      localStorage.setItem('redirectAfterLogin', route);
      this.router.navigate(['/login']);
    }
    // If logged in, let the normal navigation happen
  }
}
