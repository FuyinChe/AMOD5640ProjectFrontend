import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts'; // <--- Import BaseChartDirective, NOT NgCharts
import {ChartConfiguration, ChartDataset, ChartType} from 'chart.js';
import { ChartEvent } from 'chart.js'; // <--- Add this import
import { ChartCardComponent } from '../chart-card/chart-card.component';


interface ChartData<TType extends ChartType, TData, TLabel> {
  labels?: TLabel[];
  datasets: ChartDataset<TType, TData>[];
}

@Component({
  selector: 'app-sample-chart',
  imports: [BaseChartDirective, ChartCardComponent],
  standalone: true, // <--- This indicates it's a standalone component
  templateUrl: './sample-chart.component.html',
  styleUrl: './sample-chart.component.css'
})
export class SampleChartComponent {
  public barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: 'Sample Chart'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year'
        },
        grid: {
          display: true,
          color: '#e0e0e0',
          lineWidth: 1
        }
      },
      y: {
        title: {
          display: true,
          text: 'Value'
        },
        grid: {
          display: true,
          color: '#e0e0e0',
          lineWidth: 1
        },
        ticks: {
          stepSize: 0.1,
          autoSkip: false,
          callback: function(value: string | number) {
            return Number(value).toFixed(1);
          }
        }
      }
    }
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

  downloadCSV() {
    const headers = ['Label', ...this.barChartData.datasets.map(ds => ds.label)];
    const rows = this.barChartLabels.map((label, i) => {
      return [label, ...this.barChartData.datasets.map(ds => ds.data[i])];
    });
    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-chart-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadPNG() {
    const canvas = document.querySelector('app-sample-chart .chart-container canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'sample-chart.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }
}
