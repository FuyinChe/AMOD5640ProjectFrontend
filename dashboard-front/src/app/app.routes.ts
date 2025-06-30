import { Routes } from '@angular/router';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {UserRegistrationComponent} from './user-registration/user-registration.component';
import {UserLoginComponent} from './user-login/user-login.component';
import {EnvironmentalDataComponent} from './environmental-data/environmental-data.component';
import {EnvironmentalSampleDataComponent} from './environmental-sample-data/environmental-sample-data.component';
import {DashboardComponent} from './dashboard/dashboard/dashboard.component';
import {AboutComponent} from './about/about.component';
import {WelcomeComponent} from './welcome/welcome.component';

export const routes: Routes = [
  { path: 'environmentalData', loadComponent: () => import('./environmental-data/environmental-data.component').then(m => m.EnvironmentalDataComponent) },
  { path: 'environmentalSampleData', loadComponent: () => import('./environmental-sample-data/environmental-sample-data.component').then(m => m.EnvironmentalSampleDataComponent) },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'about', loadComponent: () => import('./about/about.component').then(m => m.AboutComponent) },
  { path: 'register', loadComponent: () => import('./user-registration/user-registration.component').then(m => m.UserRegistrationComponent) },
  { path: 'login', loadComponent: () => import('./user-login/user-login.component').then(m => m.UserLoginComponent) },
  // { path: '', redirectTo: '/environmentalSampleData', pathMatch: 'full' },
  { path: 'welcome', loadComponent: () => import('./welcome/welcome.component').then(m => m.WelcomeComponent)},
  { path: 'download', loadComponent: () => import('./download/download.component').then(m => m.DownloadComponent) },
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];



@NgModule({
  imports:[RouterModule.forRoot(routes)],
  exports:[RouterModule]
})

export class AppRoutes{}
