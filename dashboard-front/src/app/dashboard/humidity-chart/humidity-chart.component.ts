import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataset, ChartOptions } from 'chart.js';
import { EnvironmentalRecord } from '../../interfaces/environmental-record';
import 'chartjs-adapter-luxon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartCardComponent } from '../chart-card/chart-card.component';
import { HumidityService } from '../../services/humidity.service';

@Component({
  selector: 'app-humidity-chart',
  templateUrl: './humidity-chart.component.html',
  standalone: true,
  imports: [BaseChartDirective, ChartCardComponent],
  styleUrls: ['./humidity-chart.component.css']
})
export class HumidityChartComponent implements OnChanges {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Input() groupBy: string = 'hour';

  chartData: ChartDataset<'line', { x: string; y: number }[]>[] = [];
  chartType: 'line' = 'line';
  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Humidity Over Time'
      },
      legend: { display: false }
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Period'
        },
        grid: {
          display: true,
          color: '#e0e0e0',
          lineWidth: 1
        }
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Humidity (%)'
        },
        ticks: {
          // stepSize: 0.1, // Removed to let Chart.js auto-calculate
          autoSkip: true,
          maxTicksLimit: 8,
          callback: function(value: string | number) {
            return Number(value).toFixed(1);
          }
        },
        grid: {
          display: true,
          color: '#e0e0e0',
          lineWidth: 1
        }
      }
    }
  };

  private latestHumidityRawData: { period: string, avg: number }[] = [];

  constructor(private humidityService: HumidityService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.startDate && this.endDate) {
      this.humidityService.getHumidityData(this.startDate, this.endDate, this.groupBy).subscribe((response: any) => {
        this.latestHumidityRawData = response.data;
        const avgPoints = response.data.map((d: { period: string, avg: number }) => ({ x: d.period, y: d.avg }));
        const values = response.data.map((d: { avg: number }) => d.avg);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.2 || 1;
        this.chartData = [
          {
            data: avgPoints,
            label: `Avg Humidity (${response.unit || '%'})`,
            borderColor: '#00a085',
            backgroundColor: 'rgba(0, 160, 133, 0.2)',
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
              text: 'Humidity Over Time'
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
                text: `Humidity (${response.unit || '%'})`
              },
              ticks: {
                // stepSize: 0.1, // Removed to let Chart.js auto-calculate
                autoSkip: true,
                maxTicksLimit: 8,
                callback: function(value: string | number) {
                  return Number(value).toFixed(1);
                }
              },
              grid: {
                display: true,
                color: '#e0e0e0',
                lineWidth: 1
              }
            }
          }
        };
      });
    }
  }

  downloadCSV() {
    if (!this.latestHumidityRawData || this.latestHumidityRawData.length === 0) {
      console.warn('No data available for CSV download');
      return;
    }
    
    const headers = ['Period', 'Avg Humidity'];
    const rows = this.latestHumidityRawData.map((d: { period: string, avg: number }) => [d.period, d.avg]);
    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map((e: (string | number)[]) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'humidity-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadPNG() {
    const canvas = document.querySelector('app-humidity-chart .humidity-chart__container canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'humidity-chart.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else {
      console.warn('Canvas element not found for PNG download');
    }
  }
}
