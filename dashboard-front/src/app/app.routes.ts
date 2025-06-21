import { Routes } from '@angular/router';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {UserRegistrationComponent} from './user-registration/user-registration.component';
import {UserLoginComponent} from './user-login/user-login.component';
import {EnvironmentalDataComponent} from './environmental-data/environmental-data.component';
import {EnvironmentalSampleDataComponent} from './environmental-sample-data/environmental-sample-data.component';
import {DashboardComponent} from './dashboard/dashboard/dashboard.component';
import {AboutComponent} from './about/about.component';

export const routes: Routes = [
  {path:'environmentalData', component:EnvironmentalDataComponent,},
  {path:'environmentalSampleData', component:EnvironmentalSampleDataComponent,},
  {path:'dashboard', component:DashboardComponent,},
  {path:'about', component:AboutComponent,},

  {path: '', redirectTo:'/environmentalSampleData', pathMatch:'full'},
  {path:'register', component: UserRegistrationComponent},
  {path:'login', component:UserLoginComponent},
  {path: '**', redirectTo: 'login' }

];


@NgModule({
  imports:[RouterModule.forRoot(routes)],
  exports:[RouterModule]
})

export class AppRoutes{}
