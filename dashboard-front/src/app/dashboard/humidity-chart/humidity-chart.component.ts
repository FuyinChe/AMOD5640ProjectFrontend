import { Component, Input, OnChanges } from '@angular/core';
import { ChartDataset, ChartOptions } from 'chart.js';
import { EnvironmentalRecord } from '../../interfaces/environmental-record';
import 'chartjs-adapter-luxon';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-humidity-chart',
  templateUrl: './humidity-chart.component.html',
  standalone: true,
  imports: [BaseChartDirective],
  styleUrls: ['./humidity-chart.component.css']
})
export class HumidityChartComponent implements OnChanges {
  @Input() envData: EnvironmentalRecord[] = [];
  chartLabels: string[] = [];

  chartData: ChartDataset<'line', { x: Date; y: number }[]>[] = [];
  chartType: 'line' = 'line';

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Relative Humidity (%) Over Time'
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
        },
        min: undefined,
        max: undefined
      },
      y: {
        title: {
          display: true,
          text: 'Humidity (%)'
        }
      }
    }
  };

  ngOnChanges(): void {
    const humidityPoints = this.envData
      .filter(d => d.RelativeHumidity_Pct !== null)
      .map(d => ({
        x: new Date(`${d.Year}-${d.Month}-${d.Day}T${d.Time}`),
        y: d.RelativeHumidity_Pct as number
      }))
      .sort((a, b) => a.x.getTime() - b.x.getTime());

    this.chartData = [
      {
        data: humidityPoints,
        label: 'Relative Humidity (%)',
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        tension: 0.3
      }
    ];

    if (humidityPoints.length > 0) {
      const firstDate = humidityPoints[0].x;
      const year = firstDate.getFullYear();
      const month = firstDate.getMonth();
      const day = firstDate.getDate();

      const minTime = new Date(year, month, day, 0, 0, 0).getTime();
      const maxTime = new Date(year, month, day + 1, 0, 0, 0).getTime();

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
