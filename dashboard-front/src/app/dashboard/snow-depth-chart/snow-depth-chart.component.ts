import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataset, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ChartCardComponent } from '../chart-card/chart-card.component';
import { SnowDepthService } from '../../services/snow-depth.service';

@Component({
  selector: 'app-snow-depth-chart',
  templateUrl: './snow-depth-chart.component.html',
  standalone: true,
  imports: [BaseChartDirective, ChartCardComponent],
  styleUrls: ['./snow-depth-chart.component.css']
})
export class SnowDepthChartComponent implements OnChanges {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Input() groupBy: string = 'hour';

  chartData: ChartDataset<'line', { x: Date; y: number }[]>[] = [];
  chartType: 'line' = 'line';
  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Snow Depth Over Time'
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
          text: 'Snow Depth'
        }
      }
    }
  };

  private latestSnowDepthRawData: { period: string, avg: number, max: number, min: number }[] = [];
  private unit: string = 'cm';

  constructor(private snowDepthService: SnowDepthService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.startDate && this.endDate) {
      this.snowDepthService.getSnowDepthData(this.startDate, this.endDate, this.groupBy).subscribe((response: any) => {
        this.latestSnowDepthRawData = response.data;
        this.unit = response.unit || 'cm';
        const avgPoints = response.data.map((d: { period: string, avg: number }) => ({ x: d.period, y: d.avg }));
        const values = response.data.map((d: { avg: number }) => d.avg);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.2 || 1;
        this.chartData = [
          {
            data: avgPoints,
            label: `Avg Snow Depth (${this.unit})`,
            borderColor: '#0056b3',
            backgroundColor: 'rgba(0, 86, 179, 0.2)',
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
              text: 'Snow Depth Over Time'
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
                text: `Snow Depth (${this.unit})`
              }
            }
          }
        };
      });
    }
  }

  // Helper to parse 'period' (e.g., '01-01 00:00') to Date using the year from startDate
  private parsePeriodToDate(period: string, startDate: string): Date {
    const year = new Date(startDate).getFullYear();
    return new Date(`${year}-${period}:00`); // e.g., '2023-01-01 00:00:00'
  }

  downloadCSV() {
    const headers = ['Period', `Avg Snow Depth (${this.unit})`];
    const rows = this.latestSnowDepthRawData.map((d: { period: string, avg: number }) => [d.period, d.avg]);
    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map((e: (string | number)[]) => e.join(',')).join('\n');
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
