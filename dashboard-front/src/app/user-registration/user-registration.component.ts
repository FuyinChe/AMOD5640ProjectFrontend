import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {API_BASE_URL} from '../../api.config';


@Component({
  selector: 'app-user-registration',
  imports: [
    FormsModule
  ],
  templateUrl: './user-registration.component.html',
  styleUrl: './user-registration.component.css'
})
export class UserRegistrationComponent {
  user = {
    username: '',
    email: '',
    password: ''
  };

  constructor(private http: HttpClient) {}

  register() {
    this.http.post('' +
      '' +
      `${API_BASE_URL}/register/`, this.user)
      .subscribe(response => {
        alert('User registered successfully!');
      }, error => {
        alert('Registration failed');
        console.error(error);
      });
  }
}
