import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plotly-chart-card',
  templateUrl: './plotly-chart-card.component.html',
  styleUrls: ['./plotly-chart-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PlotlyChartCardComponent {
  @Input() showDownloadButtons = true;
  @Input() chartTitle: string = '';
  @Input() chartData: any[] = [];
  @Input() chartElement: HTMLElement | null = null;
  @Output() downloadCSV = new EventEmitter<void>();
  @Output() downloadPNG = new EventEmitter<void>();

  handleCSVDownload() {
    console.log('CSV download button clicked');
    this.downloadCSV.emit();
  }

  handlePNGDownload() {
    console.log('PNG download button clicked');
    this.downloadPNG.emit();
  }
} 