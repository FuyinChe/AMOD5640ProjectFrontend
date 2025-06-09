import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {API_BASE_URL} from '../api.config';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'access_token';
  constructor(private http: HttpClient) { }

  login(username: string, password: string){
    return this.http.post<any>(`${API_BASE_URL}/token/`,{
      username,
      password
    });
  }

  storeToken(token:string){
    localStorage.setItem(this.tokenKey, token);
  }

  getToken():string | null{
    return localStorage.getItem(this.tokenKey)
  }

  logout(){
    localStorage.removeItem(this.tokenKey)
  }


}
