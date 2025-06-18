import { Component } from '@angular/core';
import { SampleChartComponent } from '../sample-chart/sample-chart.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    SampleChartComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
