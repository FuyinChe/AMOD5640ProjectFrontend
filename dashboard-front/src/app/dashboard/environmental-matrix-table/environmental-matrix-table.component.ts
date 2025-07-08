import { Component, Input } from '@angular/core';
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
} 