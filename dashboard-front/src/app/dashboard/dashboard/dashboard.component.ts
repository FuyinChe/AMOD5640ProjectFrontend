import {Component, OnInit} from '@angular/core';
import { SampleChartComponent } from '../sample-chart/sample-chart.component';
import {SnowDepthChartComponent} from '../snow-depth-chart/snow-depth-chart.component';
import {FormsModule} from '@angular/forms';
import {EnvironmentalDataService} from '../../services/environmental-data.service';
import {EnvironmentalRecord} from '../../interfaces/environmental-record';
import {EnvironmentalSampleDataService} from '../../services/environmental-sample-data.service';
import {HumidityChartComponent} from '../humidity-chart/humidity-chart.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    SnowDepthChartComponent,
    FormsModule,
    HumidityChartComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  rawData: EnvironmentalRecord[] = [];
  filteredData: EnvironmentalRecord[] = [];

  dateRange = {
    start: '',
    end: ''
  };

  // the real data for production
  // constructor(private dataService: EnvironmentalDataService) {}

  //the sample data for demo
  constructor(private dataService: EnvironmentalSampleDataService) {}

  ngOnInit(): void {
    this.dataService.getEnvironmentalData().subscribe({
      next: (data) => {
        this.rawData = data;
        this.filteredData = [...data];
      },
      error: (err) => {
        console.error('Error loading data:', err);
      }
    });
  }

  applyDateFilter(): void {
    const start = new Date(this.dateRange.start);
    const end = new Date(this.dateRange.end);

    this.filteredData = this.rawData.filter(record => {
      const date = new Date(`${record.Year}-${record.Month}-${record.Day}T${record.Time}`);
      return date >= start && date <= end;
    });
  }
}
