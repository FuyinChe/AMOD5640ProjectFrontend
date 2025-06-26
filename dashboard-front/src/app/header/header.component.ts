import { Component } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from '../services/auth.service';


@Component({
  selector: 'app-header',
  standalone: true,

  imports: [
    RouterLinkActive,
    RouterLink,
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
  // dropdownOpen = false;

  dropdownOpen = true;

  // 🔒 Hardcoded login status
  isLoggedIn = true;
  username = 'Alice';


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

}
