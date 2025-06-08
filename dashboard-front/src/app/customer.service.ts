import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable} from 'rxjs';
import {API_BASE_URL} from '../api.config';


@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = `${API_BASE_URL}/customers`
  constructor(private http:HttpClient) { }
  getCustomers():Observable<any>{

    return this.http.get(this.apiUrl);}

}
