import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'acess_token';
  constructor(private http: HttpClient) { }

  login(username: string, password: string){
    return this.http.post<any>('http://localhost:8080/api/token/',{
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
