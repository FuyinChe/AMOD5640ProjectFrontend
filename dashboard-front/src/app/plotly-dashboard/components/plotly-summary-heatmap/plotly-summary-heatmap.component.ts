import { Component, Input, ElementRef, ViewChild } from '@angular/core';
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
  @ViewChild('heatmapTable', { static: false }) heatmapTableRef!: ElementRef;
  isLoading = false;
  error: string | null = null;

  // Calculate if table should use fixed width or auto width
  get shouldUseFixedWidth(): boolean {
    // Use fixed width (with scrollbar) if more than 12 months (multiple years scenario)
    // This ensures all 12 months are visible for single year, scrolling for multiple years
    return this.months.length > 12;
  }

  // Calculate dynamic table width based on number of months
  get tableWidth(): string {
    if (this.shouldUseFixedWidth) {
      // Calculate width for multiple years with scrolling
      const monthWidth = 75; // Reduced width per month column to ensure all 12 months fit
      const metricWidth = 320; // Increased width of metric column to ensure full metric name display
      const totalWidth = metricWidth + (this.months.length * monthWidth);
      return `${totalWidth}px`;
    } else {
      // Calculate width based on number of months for single year
      const monthWidth = 75; // Reduced width per month column to ensure all 12 months fit
      const metricWidth = 320; // Increased width of metric column to ensure full metric name display
      const totalWidth = metricWidth + (this.months.length * monthWidth);
      return `${totalWidth}px`;
    }
  }

  // Get container overflow style
  get containerOverflow(): string {
    return this.shouldUseFixedWidth ? 'auto' : 'visible';
  }

  // Scroll table horizontally
  scrollTable(direction: 'left' | 'right'): void {
    // Find the scrollable container (parent of the table)
    const tableElement = this.heatmapTableRef?.nativeElement;
    if (tableElement) {
      const scrollableContainer = tableElement.closest('.summary-heatmap-table__container');
      if (scrollableContainer) {
        const scrollAmount = 300; // Scroll by 300px
        const currentScroll = scrollableContainer.scrollLeft;
        const newScroll = direction === 'left' 
          ? Math.max(0, currentScroll - scrollAmount)
          : currentScroll + scrollAmount;
        
        scrollableContainer.scrollTo({
          left: newScroll,
          behavior: 'smooth'
        });
      }
    }
  }

  // Scroll left
  scrollLeft(): void {
    this.scrollTable('left');
  }

  // Scroll right
  scrollRight(): void {
    this.scrollTable('right');
  }

  // Returns the background color for a cell based on value, min, max
  getCellColor(value: number|null, min: number, max: number): string {
    if (value === null || isNaN(value)) return '#f8fafc';
    
    // Handle edge case where all values are the same
    if (max === min) return '#e2e8f0';
    
    // Normalize value to 0-1 range
    const normalizedValue = (value - min) / (max - min);
    
    // Use a more modern and vibrant color scale
    if (normalizedValue <= 0.3) {
      // Deep blue to light blue (low values)
      const t = normalizedValue / 0.3;
      return this.interpolateColor('#1e40af', '#3b82f6', t);
    } else if (normalizedValue <= 0.7) {
      // Light blue to white to light orange (mid values)
      const t = (normalizedValue - 0.3) / 0.4;
      if (t <= 0.5) {
        // Blue to white
        const t2 = t * 2;
        return this.interpolateColor('#3b82f6', '#ffffff', t2);
      } else {
        // White to orange
        const t2 = (t - 0.5) * 2;
        return this.interpolateColor('#ffffff', '#f97316', t2);
      }
    } else {
      // Light orange to deep orange (high values)
      const t = (normalizedValue - 0.7) / 0.3;
      return this.interpolateColor('#f97316', '#ea580c', t);
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

  // Generate accessible aria-label for table cells
  getCellAriaLabel(value: number|null, metricName: string, month: string): string {
    if (value === null || value === undefined) {
      return `No data available for ${metricName} in ${month}`;
    }
    return `${metricName} value ${value.toFixed(2)} for ${month}`;
  }

  // Extract month name from label (e.g., "Jan 2023" -> "Jan")
  getMonthFromLabel(label: string): string {
    if (label.includes(' ')) {
      return label.split(' ')[0];
    }
    return label;
  }

  // Extract year from label (e.g., "Jan 2023" -> "2023")
  getYearFromLabel(label: string): string {
    if (label.includes(' ')) {
      return label.split(' ')[1];
    }
    return '';
  }

  // Download CSV data
  downloadCSV(): void {
    if (!this.metrics || this.metrics.length === 0) {
      console.warn('No data available for CSV download');
      return;
    }

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
    
    const csvContent = '\uFEFF' + rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'plotly_summary_heatmap.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Download PNG image
  async downloadPNG(): Promise<void> {
    const html2canvas = (await import('html2canvas')).default;
    const tableElem = this.heatmapTableRef?.nativeElement as HTMLElement;
    if (!tableElem) return;
    
    html2canvas(tableElem).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'plotly_summary_heatmap.png';
      link.click();
    });
  }
} 