import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {FooterComponent} from './footer/footer.component';
import {NavComponent} from './nav/nav.component';
import {HeaderComponent} from './header/header.component';
// @ts-ignore
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import {DashboardComponent} from './dashboard/dashboard/dashboard.component';
import 'chartjs-adapter-luxon';
import {UserRegistrationComponent} from './user-registration/user-registration.component'; // <-- Import the time adapter here


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent, HeaderComponent,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'dashboard-front';
}
