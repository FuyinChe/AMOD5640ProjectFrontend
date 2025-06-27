import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL } from '../../api.config';
import {RouterOutlet, Router, RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [CommonModule,
        FormsModule,
        RouterOutlet,
        RouterLink],
  // templateUrl: './user-registration.component.html',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationComponent {
  user = {
    email: '',
    password: ''
  };

  retryPassword: string = '';
  verificationCode: string = '';
  showVerificationStep: boolean = false;
  passwordsMatch: boolean = true;
  responseMessage: string = '';
  isSuccess: boolean = false;
  isLoading: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  checkPasswordsMatch() {
    this.passwordsMatch = this.user.password === this.retryPassword;
  }

  register() {
    // Check if passwords match
    if (this.user.password !== this.retryPassword) {
      this.responseMessage = 'Passwords do not match. Please try again.';
      this.isSuccess = false;
      return;
    }

    this.isLoading = true;
    this.responseMessage = '';

    if (!this.showVerificationStep) {
      // First step: Submit email and password
      this.http.post(`${API_BASE_URL}/register/`, this.user).subscribe({
        next: () => {
          this.showVerificationStep = true;
          this.responseMessage = 'Registration initiated! Please check your email for verification code.';
          this.isSuccess = true;
          this.isLoading = false;
        },
        error: (err) => {
          this.responseMessage = 'Registration failed. Please try again.';
          this.isSuccess = false;
          this.isLoading = false;
          console.error('Error:', err);
        }
      });
    } else {
      // Second step: Submit verification code
      this.http.post(`${API_BASE_URL}/verify/`, {
        email: this.user.email,
        code: this.verificationCode
      }).subscribe({
        next: () => {
          this.responseMessage = 'User registered successfully! Redirecting to home page...';
          this.isSuccess = true;
          this.showVerificationStep = false;
          this.resetForm();
          this.isLoading = false;
          
          // Redirect to home page after successful registration
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        },
        error: (err) => {
          this.responseMessage = 'Verification failed. Please check your code and try again.';
          this.isSuccess = false;
          this.isLoading = false;
          console.error('Error:', err);
        }
      });
    }
  }

  resetForm() {
    this.user.email = '';
    this.user.password = '';
    this.retryPassword = '';
    this.verificationCode = '';
    this.showVerificationStep = false;
    this.passwordsMatch = true;
    this.responseMessage = '';
    this.isSuccess = false;
  }
}
