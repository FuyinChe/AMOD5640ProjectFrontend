import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {API_BASE_URL} from '../../api.config';

@Component({
  selector: 'app-user-login',
  imports: [
    FormsModule
  ],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})
export class UserLoginComponent {
  credentials = {
    username: '',
    password: ''
  };

  constructor(private http: HttpClient) {}

  login() {
    this.http.post(`${API_BASE_URL}/token/`, this.credentials)
      .subscribe((response: any) => {
        localStorage.setItem('access_token', response.access);
        alert('Logged in successfully!');
      }, error => {
        alert('Login failed');
        console.error(error);
      });
  }
}
