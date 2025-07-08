import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataset, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ChartCardComponent } from '../chart-card/chart-card.component';
import { RainfallService } from '../../services/rainfall.service';

@Component({
  selector: 'app-rainfall-chart',
  templateUrl: './rainfall-chart.component.html',
  standalone: true,
  imports: [BaseChartDirective, ChartCardComponent],
  styleUrls: ['./rainfall-chart.component.css']
})
export class RainfallChartComponent implements OnChanges {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Input() limit: number = 1000;

  chartData: ChartDataset<'line', { x: Date; y: number }[]>[] = [];
  chartType: 'line' = 'line';

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Rainfall (mm) Over Time'
      },
      legend: { display: false }
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Period'
        }
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Rainfall (mm)'
        }
      }
    }
  };

  private latestRainfallRawData: { period: string, avg_rainfall_mm: number }[] = [];

  constructor(private rainfallService: RainfallService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.startDate && this.endDate) {
      this.rainfallService.getHourlyRainfallData(this.startDate, this.endDate).subscribe((response: any) => {
        this.latestRainfallRawData = response.data;
        const avgPoints = response.data.map((d: { period: string, avg: number }) => ({ x: d.period, y: d.avg }));
        const values = response.data.map((d: { avg: number }) => d.avg);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.2 || 1;
        this.chartData = [
          {
            data: avgPoints,
            label: `Avg Rainfall (${response.unit || 'mm'})`,
            borderColor: '#0088cc',
            backgroundColor: 'rgba(0, 136, 204, 0.2)',
            tension: 0.3,
            pointRadius: 3,
            borderWidth: 3,
            fill: true
          }
        ];
        this.chartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Rainfall (mm) Over Time'
            },
            legend: { display: true }
          },
          scales: {
            x: {
              type: 'category',
              title: {
                display: true,
                text: 'Period'
              }
            },
            y: {
              type: 'linear',
              min: 0,
              max: max + padding,
              title: {
                display: true,
                text: `Rainfall (${response.unit || 'mm'})`
              }
            }
          }
        };
      });
    }
  }

  downloadCSV() {
    const headers = ['Period', 'Avg Rainfall (mm)'];
    const rows = this.latestRainfallRawData.map((d: { period: string, avg_rainfall_mm: number }) => [d.period, d.avg_rainfall_mm]);
    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map((e: (string | number)[]) => e.join(',')).join('\n');
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
