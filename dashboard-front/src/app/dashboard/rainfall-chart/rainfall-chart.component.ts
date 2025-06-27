import { Component, Input, OnChanges } from '@angular/core';
import { ChartDataset, ChartOptions } from 'chart.js';
import { EnvironmentalRecord } from '../../interfaces/environmental-record';
import 'chartjs-adapter-luxon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartCardComponent } from '../chart-card/chart-card.component';

@Component({
  selector: 'app-rainfall-chart',
  templateUrl: './rainfall-chart.component.html',
  standalone: true,
  imports: [BaseChartDirective, ChartCardComponent],
  styleUrls: ['./rainfall-chart.component.css']
})
export class RainfallChartComponent implements OnChanges {
  @Input() envData: EnvironmentalRecord[] = [];

  chartData: ChartDataset<'line', { x: Date; y: number }[]>[] = [];
  chartType: 'line' = 'line';

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Rainfall (mm) Over Time'
      },
      legend: { display: false }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          tooltipFormat: 'MMM dd, HH:mm',
          displayFormats: {
            hour: 'HH:mm',
            day: 'MMM dd'
          }
        },
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Rainfall (mm)'
        }
      }
    }
  };

  ngOnChanges(): void {
    const pad = (n: number) => n.toString().padStart(2, '0');

    const rainfallPoints = this.envData
      .filter(d => d.Rainfall_mm !== null)
      .map(d => {
        const dateStr = `${d.Year}-${pad(d.Month)}-${pad(d.Day)}T${d.Time}`;
        const date = new Date(dateStr);
        return {
          x: date,
          y: d.Rainfall_mm as number
        };
      })
      .sort((a, b) => a.x.getTime() - b.x.getTime());

    this.chartData = [
      {
        data: rainfallPoints,
        label: 'Rainfall (mm)',
        borderColor: '#17a2b8',
        backgroundColor: 'rgba(23, 162, 184, 0.1)',
        tension: 0.3
      }
    ];

    if (rainfallPoints.length > 0) {
      const firstDate = rainfallPoints[0].x;
      const minTime = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate(), 0).getTime();
      const maxTime = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() + 1, 0).getTime();

      this.chartOptions = {
        ...this.chartOptions,
        scales: {
          ...this.chartOptions.scales,
          ['x']: {
            ...this.chartOptions.scales!['x']!,
            min: minTime,
            max: maxTime
          }
        }
      };
    }
  }

  downloadCSV() {
    const headers = ['Date', 'Rainfall'];
    const rows = this.envData.map(d => [d.Year + '-' + d.Month + '-' + d.Day + ' ' + d.Time, d.Rainfall_mm]);
    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rainfall-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadPNG() {
    const canvas = document.querySelector('.rainfall-chart .chart-container canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'rainfall-chart.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }
}
