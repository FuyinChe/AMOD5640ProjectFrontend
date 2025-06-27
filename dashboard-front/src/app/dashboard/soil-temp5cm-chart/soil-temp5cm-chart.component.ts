import { Component, Input, OnChanges } from '@angular/core';
import { ChartDataset, ChartOptions } from 'chart.js';
import { EnvironmentalRecord } from '../../interfaces/environmental-record';
import 'chartjs-adapter-luxon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartCardComponent } from '../chart-card/chart-card.component';

@Component({
  selector: 'app-soil-temp5cm-chart',
  templateUrl: './soil-temp5cm-chart.component.html',
  standalone: true,
  imports: [BaseChartDirective, ChartCardComponent],
  styleUrls: ['./soil-temp5cm-chart.component.css']
})
export class SoilTemp5cmChartComponent implements OnChanges {
  @Input() envData: EnvironmentalRecord[] = [];

  chartData: ChartDataset<'line', { x: Date; y: number }[]>[] = [];
  chartType: 'line' = 'line';

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Soil Temperature (5cm) °C Over Time'
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
          text: 'Soil Temp (°C)'
        }
      }
    }
  };

  ngOnChanges(): void {
    const pad = (n: number) => n.toString().padStart(2, '0');

    const tempPoints = this.envData
      .filter(d => d.SoilTemperature_5cm_degC !== null)
      .map(d => {
        const dateStr = `${d.Year}-${pad(d.Month)}-${pad(d.Day)}T${d.Time}`;
        const date = new Date(dateStr);
        return {
          x: date,
          y: d.SoilTemperature_5cm_degC as number
        };
      })
      .sort((a, b) => a.x.getTime() - b.x.getTime());

    this.chartData = [
      {
        data: tempPoints,
        label: 'Soil Temp (5cm)',
        borderColor: '#fd7e14',
        backgroundColor: 'rgba(253, 126, 20, 0.1)',
        tension: 0.3
      }
    ];

    if (tempPoints.length > 0) {
      const firstDate = tempPoints[0].x;
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
    const headers = ['Date', 'Soil Temp 5cm'];
    const rows = this.envData.map(d => [d.Year + '-' + d.Month + '-' + d.Day + ' ' + d.Time, d.SoilTemperature_5cm_degC]);
    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'soil-temp5cm-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadPNG() {
    const canvas = document.querySelector('.soil-temp5cm-chart .chart-container canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'soil-temp5cm-chart.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }
}
