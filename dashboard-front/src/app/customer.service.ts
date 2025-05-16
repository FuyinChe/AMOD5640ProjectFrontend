import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'http://localhost:8000/api/customers'
  constructor(private http:HttpClient) { }
  getCustomers():Observable<any>{

    return this.http.get(this.apiUrl);}

}
