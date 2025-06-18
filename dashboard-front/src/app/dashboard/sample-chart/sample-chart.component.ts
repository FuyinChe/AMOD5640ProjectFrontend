import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts'; // <--- Import BaseChartDirective, NOT NgCharts
import {ChartConfiguration, ChartDataset, ChartType} from 'chart.js';
import { ChartEvent } from 'chart.js'; // <--- Add this import


interface ChartData<TType extends ChartType, TData, TLabel> {
  labels?: TLabel[];
  datasets: ChartDataset<TType, TData>[];
}

@Component({
  selector: 'app-sample-chart',
  imports: [BaseChartDirective],
  standalone: true, // <--- This indicates it's a standalone component
  templateUrl: './sample-chart.component.html',
  styleUrl: './sample-chart.component.css'
})
export class SampleChartComponent {
  public barChartOptions = {
    responsive: true,
    // Add other Chart.js options
  };
  public barChartLabels: string[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  public barChartType: ChartType = 'bar'; // Use ChartType for type safety
  public barChartLegend = true;

  // FIX: Wrap your data series in an object with a 'datasets' property
  public barChartData: ChartData<'bar', any, any> = { // Explicitly type it as ChartData<'bar'> for better type checking
    labels: this.barChartLabels, // It's good practice to include labels here too, though ng2-charts also takes it separately
    datasets: [
      { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
      { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
    ]
  };

  public chartClicked({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
    console.log(event, active);
  }
}
