import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {FooterComponent} from './footer/footer.component';
import {NavComponent} from './nav/nav.component';
import {HeaderComponent} from './header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'dashboard-front';
}
