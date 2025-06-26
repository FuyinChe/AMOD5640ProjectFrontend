import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  imports: [
    FormsModule, CommonModule, RouterOutlet
  ],
  styleUrls: ['./user-login.component.scss'],
  standalone: true
})
export class UserLoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  login() {
    const email = this.credentials.email.trim();

    if (!email) {
      alert('Please enter your email.');
      return;
    }

    // Basic email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    console.log('Logging in with:', email, this.credentials.password);

    // Add your login logic here, e.g., call API
  }
}
