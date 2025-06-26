import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink, RouterOutlet} from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-welcome',
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent {}
