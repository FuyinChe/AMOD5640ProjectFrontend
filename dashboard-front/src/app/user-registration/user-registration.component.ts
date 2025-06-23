import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL } from '../../api.config';
import {RouterOutlet} from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [CommonModule,
        FormsModule,
        RouterOutlet],
  // templateUrl: './user-registration.component.html',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.css']
})
export class UserRegistrationComponent {
  user = {
    username: '',
    email: '',
    password: ''
  };

  emailPrefix: string = '';

  constructor(private http: HttpClient) {}

  register() {
    this.user.email = `${this.emailPrefix}@trentu.ca`;

    this.http.post(`${API_BASE_URL}/register/`, this.user).subscribe({
      next: () => alert('User registered successfully!'),
      error: (err) => {
        alert('Registration failed');
        console.error('Error:', err);
      }
    });
  }
}
