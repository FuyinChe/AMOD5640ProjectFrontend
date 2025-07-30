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
  @ViewChild('legendContainer', { static: false }) legendContainerRef!: ElementRef;
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

  // Group months by year for merged year header cells
  get yearGroups(): Array<{ year: string, startIndex: number, count: number }> {
    const groups: Array<{ year: string, startIndex: number, count: number }> = [];
    let lastYear = '';
    let startIndex = 0;
    for (let i = 0; i < this.months.length; i++) {
      const year = this.getYearFromLabel(this.months[i]);
      if (year !== lastYear) {
        if (i > 0) {
          groups.push({ year: lastYear, startIndex, count: i - startIndex });
        }
        lastYear = year;
        startIndex = i;
      }
    }
    if (lastYear && startIndex < this.months.length) {
      groups.push({ year: lastYear, startIndex, count: this.months.length - startIndex });
    }
    return groups;
  }

  // Group metrics for row grouping in the table
  get groupedMetrics(): Array<{ group: string, metrics: {name: string, unit: string, values: (number|null)[]}[] }> {
    const groupDefs = [
      { group: 'Air Temperature', keywords: ['Air Temp Max', 'Air Temp Min', 'Mean Air Temp', 'Air Temp Std'] },
      { group: 'Humidity', keywords: ['Humidity Max', 'Humidity Min', 'Mean Humidity', 'Humidity Std'] },
      { group: 'Shortwave Radiation', keywords: ['Shortwave Radiation Max', 'Shortwave Radiation Min', 'Shortwave Radiation Mean', 'Shortwave Radiation Std'] },
      { group: 'Rainfall', keywords: ['Rainfall Total', 'Rainfall Max', 'Rainfall Mean', 'Rainfall Std'] },
      { group: 'Soil Temp 5cm', keywords: ['Soil Temp 5cm Max', 'Soil Temp 5cm Min', 'Soil Temp 5cm Mean', 'Soil Temp 5cm Std'] },
      { group: 'Wind Speed', keywords: ['Wind Speed Max', 'Wind Speed Min', 'Wind Speed Mean', 'Wind Speed Std'] },
      { group: 'Snow Depth', keywords: ['Snow Depth Max', 'Snow Depth Min', 'Snow Depth Mean', 'Snow Depth Std'] },
      { group: 'Atmospheric Pressure', keywords: ['Atmospheric Pressure Max', 'Atmospheric Pressure Min', 'Atmospheric Pressure Mean', 'Atmospheric Pressure Std'] },
    ];
    const grouped: Array<{ group: string, metrics: {name: string, unit: string, values: (number|null)[]}[] }> = [];
    const used = new Set();
    for (const def of groupDefs) {
      const groupMetrics = this.metrics.filter(m => def.keywords.some(k => m.name.includes(k)));
      groupMetrics.forEach(m => used.add(m));
      if (groupMetrics.length) {
        grouped.push({ group: def.group, metrics: groupMetrics });
      }
    }
    // Add any remaining metrics as their own group
    const remaining = this.metrics.filter(m => !used.has(m));
    for (const m of remaining) {
      grouped.push({ group: m.name, metrics: [m] });
    }
    return grouped;
  }

  // Returns the background color for a cell based on value, min, max
  getCellColor(value: number|null, min: number, max: number): string {
    if (value === null || isNaN(value)) return '#f8fafc';
    
    // Handle edge case where all values are the same
    if (max === min) return '#e2e8f0';
    
    // Normalize value to 0-1 range
    const normalizedValue = (value - min) / (max - min);
    
    // Use a high contrast color scale with more vibrant colors
    if (normalizedValue <= 0.25) {
      // Deep navy to medium blue (low values)
      const t = normalizedValue / 0.25;
      return this.interpolateColor('#0f172a', '#1e40af', t);
    } else if (normalizedValue <= 0.5) {
      // Medium blue to light blue (low-mid values)
      const t = (normalizedValue - 0.25) / 0.25;
      return this.interpolateColor('#1e40af', '#3b82f6', t);
    } else if (normalizedValue <= 0.75) {
      // Light blue to light orange (mid-high values)
      const t = (normalizedValue - 0.5) / 0.25;
      return this.interpolateColor('#3b82f6', '#f97316', t);
    } else {
      // Light orange to deep red (high values)
      const t = (normalizedValue - 0.75) / 0.25;
      return this.interpolateColor('#f97316', '#dc2626', t);
    }
  }

  // Returns the appropriate text color for a given background color
  getTextColor(backgroundColor: string): string {
    let rgb: {r: number, g: number, b: number};
    
    // Handle both hex and RGB color formats
    if (backgroundColor.startsWith('rgb(')) {
      // Parse RGB format: "rgb(r, g, b)"
      const matches = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (matches) {
        rgb = {
          r: parseInt(matches[1]),
          g: parseInt(matches[2]),
          b: parseInt(matches[3])
        };
      } else {
        // Fallback to default
        return '#1e293b';
      }
    } else {
      // Handle hex format
      rgb = this.hexToRgb(backgroundColor);
    }
    
    // Calculate relative luminance using the sRGB formula
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    // Use white text for dark backgrounds, dark text for light backgrounds
    return luminance > 0.5 ? '#1e293b' : '#ffffff';
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

  // Extracts the suffix (e.g., Max, Min, Mean, Std) from a metric name
  getMetricSuffix(metricName: string): string {
    const match = metricName.match(/(Max|Min|Mean|Std)(?![a-zA-Z])/i);
    if (match) {
      return match[0][0].toUpperCase() + match[0].slice(1).toLowerCase();
    }
    return metricName;
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
    const legendElem = this.legendContainerRef?.nativeElement as HTMLElement;
    
    if (!tableElem) return;
    
    // Store original styles to restore later
    const originalStyles = new Map<HTMLElement, string>();
    
    // Temporarily remove sticky positioning and shadows for clean PNG
    const stickyElements = tableElem.querySelectorAll('.summary-heatmap-table__metric-header, .summary-heatmap-table__year-header, .summary-heatmap-table__month-header, .summary-heatmap-table__metric-name');
    
    stickyElements.forEach((element: Element) => {
      const el = element as HTMLElement;
      originalStyles.set(el, el.style.cssText);
      el.style.position = 'static';
      el.style.top = '';
      el.style.left = '';
      el.style.zIndex = '';
      el.style.boxShadow = 'none';
    });
    
    try {
      // Create a temporary container to hold both legend and table
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.background = '#fff';
      tempContainer.style.padding = '20px';
      tempContainer.style.fontFamily = 'Museo Sans, Arial, sans-serif';
      tempContainer.style.fontSize = '14px';
      tempContainer.style.lineHeight = '1.4';
      tempContainer.style.borderRadius = '8px';
      tempContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      
      // Clone the legend and table
      const legendClone = legendElem ? legendElem.cloneNode(true) as HTMLElement : null;
      const tableClone = tableElem.cloneNode(true) as HTMLElement;
      
      // Fix table layout for PNG export
      tableClone.style.width = 'auto';
      tableClone.style.minWidth = 'auto';
      tableClone.style.maxWidth = 'none';
      tableClone.style.tableLayout = 'auto';
      
      // Fix metric column width
      const metricHeaders = tableClone.querySelectorAll('.summary-heatmap-table__metric-header, .summary-heatmap-table__metric-group, .summary-heatmap-table__metric-name');
      metricHeaders.forEach((element: Element) => {
        const el = element as HTMLElement;
        el.style.position = 'static';
        el.style.width = 'auto';
        el.style.minWidth = 'auto';
        el.style.maxWidth = 'none';
        el.style.left = '';
        el.style.zIndex = '';
      });
      
      // Add some spacing between legend and table
      if (legendClone) {
        legendClone.style.marginBottom = '20px';
        tempContainer.appendChild(legendClone);
      }
      
      tempContainer.appendChild(tableClone);
      document.body.appendChild(tempContainer);
      
      // Capture the combined image with high quality settings
      const canvas = await html2canvas(tempContainer, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: tempContainer.offsetWidth,
        height: tempContainer.offsetHeight
      });
      
      // Clean up
      document.body.removeChild(tempContainer);
      
      // Create high-resolution canvas for better quality (similar to scale: 4)
      const highResCanvas = document.createElement('canvas');
      const ctx = highResCanvas.getContext('2d');
      const scale = 4; // High DPI scaling factor
      
      highResCanvas.width = canvas.width * scale;
      highResCanvas.height = canvas.height * scale;
      
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(canvas, 0, 0, highResCanvas.width, highResCanvas.height);
      }
      
      // Create high-quality PNG with maximum quality
      const link = document.createElement('a');
      link.href = highResCanvas.toDataURL('image/png', 1.0); // Maximum quality
      link.download = 'plotly_summary_heatmap_with_legend.png';
      link.click();
    } finally {
      // Restore original styles
      stickyElements.forEach((element: Element) => {
        const el = element as HTMLElement;
        const originalStyle = originalStyles.get(el);
        if (originalStyle !== undefined) {
          el.style.cssText = originalStyle;
        }
      });
    }
  }
} 