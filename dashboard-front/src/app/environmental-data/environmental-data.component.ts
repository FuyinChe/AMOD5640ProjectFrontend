import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {EnvironmentalDataService} from '../services/environmental-data.service';
import {NgForOf, NgIf} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {EnvironmentalRecord} from '../interfaces/environmental-record';

@Component({
  selector: 'app-environmental-data',
  imports: [
    NgForOf,
    NgIf,
    RouterOutlet
  ],
  templateUrl: './environmental-data.component.html',
  styleUrl: './environmental-data.component.scss'
})
export class EnvironmentalDataComponent implements OnInit {
  environmentalData:EnvironmentalRecord [] = [];
  constructor(
    private environmentalDataService:EnvironmentalDataService,
    public auth: AuthService,
    private router: Router
  ){}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      // Store the intended destination before redirecting to login
      localStorage.setItem('intendedDestination', '/environmentalData');
      this.router.navigate(['/login']);
      return;
    }
    
    this.environmentalDataService.getEnvironmentalData().subscribe({
      next: data => this.environmentalData = data,
      error: err => console.error(err)
    });
  }
}
