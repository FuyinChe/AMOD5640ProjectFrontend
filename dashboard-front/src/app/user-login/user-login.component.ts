import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  imports: [
    FormsModule, CommonModule, RouterOutlet, RouterLink
  ],
  styleUrls: ['./user-login.component.scss'],
  standalone: true
})
export class UserLoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';
  isSuccess = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    const email = this.credentials.email.trim();
    const password = this.credentials.password;

    // Reset states
    this.errorMessage = '';
    this.isSuccess = false;

    // Validation
    if (!email) {
      this.errorMessage = 'Please enter your email.';
      return;
    }

    if (!password) {
      this.errorMessage = 'Please enter your password.';
      return;
    }

    // Basic email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    // Start loading
    this.isLoading = true;

    // Call auth service
    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isSuccess = true;
        this.errorMessage = '';
        
        console.log('Login successful:', response);
        
        // Show success message briefly, then redirect
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.errorMessage = error.message || 'Login failed. Please try again.';
        console.error('Login error:', error);
      }
    });
  }

  clearError() {
    this.errorMessage = '';
  }

  onInputChange() {
    // Clear error when user starts typing
    if (this.errorMessage) {
      this.clearError();
    }
  }
}
