import { Component, Input, OnChanges } from '@angular/core';
import { ChartDataset, ChartOptions } from 'chart.js';
import { EnvironmentalRecord } from '../../interfaces/environmental-record';
import 'chartjs-adapter-luxon';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-rainfall-chart',
  templateUrl: './rainfall-chart.component.html',
  standalone: true,
  imports: [BaseChartDirective],
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
}
