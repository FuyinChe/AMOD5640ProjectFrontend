import { Injectable } from '@angular/core';
import {environment} from '../environments/environments';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentalSampleDataService {

  //this is the sample data
  private apiUrl = `${environment.API_BASE_URL}/sample/environmental-data`

  constructor(private http:HttpClient) { }

  getEnvironmentalData():Observable<any>{

    return this.http.get(this.apiUrl);}
}
