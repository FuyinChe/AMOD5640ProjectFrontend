import { Component, Input, OnChanges } from '@angular/core';
import { ChartDataset, ChartOptions } from 'chart.js';
import { EnvironmentalRecord } from '../../interfaces/environmental-record';
import 'chartjs-adapter-luxon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartCardComponent } from '../chart-card/chart-card.component';

@Component({
  selector: 'app-snow-depth-chart',
  templateUrl: './snow-depth-chart.component.html',
  standalone: true,
  imports: [BaseChartDirective, ChartCardComponent],
  styleUrls: ['./snow-depth-chart.component.css']
})
export class SnowDepthChartComponent implements OnChanges {
  @Input() envData: EnvironmentalRecord[] = [];
  chartType: 'line' = 'line';

  chartData: ChartDataset<'line', { x: Date; y: number }[]>[] = [];

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      title: {
        display: false,
        text: 'Snow Depth (cm) Over Time'
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
          text: 'Snow Depth (cm)'
        }
      }
    }
  };

  chartLabels: string[] = [];

  ngOnChanges(): void {
    console.log('envData:', this.envData);
    // const snowPoints = this.envData
    //   .filter(d => d.SnowDepth_cm !== null && d.SnowDepth_cm > -100)
    //   .map(d => ({
    //     x: new Date(`${d.Year}-${d.Month}-${d.Day}T${d.Time}`),
    //     y: d.SnowDepth_cm as number
    //   }))
    //   .sort((a, b) => a.x.getTime() - b.x.getTime());

    const snowPoints = this.envData
      .filter(d => d.SnowDepth_cm !== null && d.SnowDepth_cm > -100)
      .map(d => {
        const dateStr = `${d.Year}-${String(d.Month).padStart(2, '0')}-${String(d.Day).padStart(2, '0')}T${d.Time}`;
        const x = new Date(dateStr);
        if (isNaN(x.getTime())) {
          console.warn('Invalid date:', dateStr);
        }
        return { x, y: d.SnowDepth_cm as number };
      })
      .sort((a, b) => a.x.getTime() - b.x.getTime());

    this.chartData = [
      {
        data: snowPoints,
        label: 'Snow Depth (cm)',
        borderColor: '#007bff',
        backgroundColor: 'rgba(0,123,255,0.1)',
        tension: 0.3
      }
    ];

    if (snowPoints.length > 0) {
      const firstDate = snowPoints[0].x;
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

  downloadCSV() {
    // Replace with your actual data variable and structure
    const headers = ['Date', 'Snow Depth'];
    const rows = this.envData.map(d => [d.Year + '-' + d.Month + '-' + d.Day + ' ' + d.Time, d.SnowDepth_cm]); // Adjust property names as needed

    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snow-depth-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadPNG() {
    const canvas = document.querySelector('.snow-depth-chart__canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'snow-depth-chart.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }
}
