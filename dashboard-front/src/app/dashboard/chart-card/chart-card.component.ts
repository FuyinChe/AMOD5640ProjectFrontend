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
  @Input() onDownloadCSV?: () => void;
  @Input() onDownloadPNG?: () => void;
} 