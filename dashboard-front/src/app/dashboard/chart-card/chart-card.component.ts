import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart-card',
  templateUrl: './chart-card.component.html',
  styleUrls: ['./chart-card.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ChartCardComponent {
  @Input() showDownloadButtons = true;
  @Input() onDownloadCSV: (() => void) | undefined = undefined;
  @Input() onDownloadPNG: (() => void) | undefined = undefined;

  handleCSVDownload() {
    console.log('CSV download button clicked');
    if (this.onDownloadCSV) {
      this.onDownloadCSV();
    } else {
      console.warn('onDownloadCSV function is not defined');
    }
  }

  handlePNGDownload() {
    console.log('PNG download button clicked');
    if (this.onDownloadPNG) {
      this.onDownloadPNG();
    } else {
      console.warn('onDownloadPNG function is not defined');
    }
  }
} 