import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-environmental-matrix-table',
  templateUrl: './environmental-matrix-table.component.html',
  styleUrls: ['./environmental-matrix-table.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class EnvironmentalMatrixTableComponent {
  @Input() metrics: { name: string; unit: string; values: (number | null)[] }[] = [];
  @Input() months: string[] = [];
  @ViewChild('matrixTable', { static: false }) matrixTableRef!: ElementRef;

  // Map value to color (blue for low, red for high, per row)
  getCellColor(value: number | null, min: number, max: number): string {
    if (value === null || min === max) return '#eee';
    const t = (value - min) / (max - min);
    const r = Math.round(255 * t);
    const g = Math.round(200 * (1 - t) + 100 * t);
    const b = Math.round(255 * (1 - t));
    console.log({value, min, max, color: `rgb(${r},${g},${b})`});
    return `rgb(${r},${g},${b})`;
  }

  getMin(metric: { values: (number | null)[] }) {
    return Math.min(...metric.values.filter((v): v is number => v !== null));
  }
  getMax(metric: { values: (number | null)[] }) {
    return Math.max(...metric.values.filter((v): v is number => v !== null));
  }

  downloadCSV() {
    const rows = [];
    const header = ['Metric', ...this.months];
    rows.push(header);
    for (const metric of this.metrics) {
      const row = [
        metric.unit ? `${metric.name} (${metric.unit})` : metric.name,
        ...metric.values.map(v => v === null ? '' : v)
      ];
      rows.push(row);
    }
    const csvContent = rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'matrix-table.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async downloadPNG() {
    const html2canvas = (await import('html2canvas')).default;
    const tableElem = this.matrixTableRef?.nativeElement as HTMLElement;
    if (!tableElem) return;
    html2canvas(tableElem).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'matrix-table.png';
      link.click();
    });
  }
} 