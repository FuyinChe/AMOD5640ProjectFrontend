import { Injectable } from '@angular/core';
import {environment} from '../../environments/environments';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {EnvironmentalRecord} from '../interfaces/environmental-record';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentalSampleDataService {

  //this is the sample data
  private apiUrl = `${environment.API_BASE_URL}/sample/environmental-data`

  constructor(private http:HttpClient) { }

  getEnvironmentalData(): Observable<EnvironmentalRecord[]> {
    return this.http.get<EnvironmentalRecord[]>(this.apiUrl);
  }
}
