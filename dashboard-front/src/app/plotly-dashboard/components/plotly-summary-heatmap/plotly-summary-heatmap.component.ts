import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plotly-summary-heatmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plotly-summary-heatmap.component.html',
  styleUrls: ['./plotly-summary-heatmap.component.scss']
})
export class PlotlySummaryHeatmapComponent {
  @Input() metrics: Array<{name: string, unit: string, values: (number | null)[]}> = [];
  @Input() months: string[] = [];

  // Returns the background color for a cell based on value, min, max
  getCellColor(value: number|null, min: number, max: number): string {
    if (value === null || isNaN(value)) return '#f8f9fa';
    // Diverging color scale: blue (low) - white (mid) - orange (high)
    const mid = (min + max) / 2;
    if (max === min) return '#fff';
    let t: number;
    if (value <= mid) {
      // Blue to white
      t = (value - min) / (mid - min || 1);
      return this.interpolateColor('#2c9cff', '#fff', t);
    } else {
      // White to orange
      t = (value - mid) / (max - mid || 1);
      return this.interpolateColor('#fff', '#ff7f2c', t);
    }
  }

  // Linear interpolation between two hex colors
  interpolateColor(color1: string, color2: string, t: number): string {
    t = Math.max(0, Math.min(1, t));
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    return `rgb(${r},${g},${b})`;
  }

  hexToRgb(hex: string): {r: number, g: number, b: number} {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(x => x + x).join('');
    }
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  // Get min/max for a metric row (ignoring nulls)
  getRowMinMax(values: (number|null)[]): {min: number, max: number} {
    const filtered = values.filter(v => v !== null && !isNaN(v)) as number[];
    if (!filtered.length) return {min: 0, max: 0};
    return {
      min: Math.min(...filtered),
      max: Math.max(...filtered)
    };
  }
} 