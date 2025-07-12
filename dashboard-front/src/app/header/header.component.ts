import { Component } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {CommonModule} from '@angular/common';
import {NavComponent} from '../nav/nav.component';


@Component({
  selector: 'app-header',
  standalone: true,

  imports: [
    RouterLinkActive,
    RouterLink,
    CommonModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  // Inject AuthService publicly so it's accessible in the template
  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  dropdownOpen = false;

  // Called when user clicks the "Logout" button
  logout() {
    this.auth.logout();                // Clear token and username from localStorage
    this.router.navigate(['/']).then(success => {
      if (success) {
        console.log('Navigation successful');
      } else {
        console.warn('Navigation failed');
      }
    });      // Navigate to home (or login page if you prefer)
    this.dropdownOpen = false;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  formatUsername(email: string | null): string {
    if (!email) return '';
    
    // If email is short, display as is
    if (email.length <= 20) return email;
    
    // For longer emails, show first part + @ + domain
    const atIndex = email.indexOf('@');
    if (atIndex === -1) return email;
    
    const username = email.substring(0, atIndex);
    const domain = email.substring(atIndex + 1);
    
    if (username.length <= 12) {
      return email;
    } else {
      return `${username.substring(0, 12)}...@${domain}`;
    }
  }

  handleDashboardClick(event: Event, route: string): void {
    if (!this.auth.isLoggedIn()) {
      event.preventDefault();
      localStorage.setItem('redirectAfterLogin', route);
      this.router.navigate(['/login']);
    }
    // If logged in, let the normal navigation happen
  }
}
