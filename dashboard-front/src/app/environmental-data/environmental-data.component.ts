import {Component, OnInit} from '@angular/core';
import {EnvironmentalDataService} from '../environmental-data.service';
import {NgForOf, NgIf} from '@angular/common';
import {RouterOutlet} from '@angular/router';


@Component({
  selector: 'app-environmental-data',
  imports: [
    NgForOf,
    NgIf,
    RouterOutlet
  ],
  templateUrl: './environmental-data.component.html',
  styleUrl: './environmental-data.component.css'
})
export class EnvironmentalDataComponent implements OnInit {
  environmentalData:any [] = [];
  constructor(private environmentalDataService:EnvironmentalDataService){}

  ngOnInit() {
    this.environmentalDataService.getEnvironmentalData().subscribe({
      next: data => this.environmentalData = data,
      error: err => console.error(err)
    });
  }
}
