import { Routes } from '@angular/router';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {UserRegistrationComponent} from './user-registration/user-registration.component';
import {UserLoginComponent} from './user-login/user-login.component';
import {EnvironmentalDataComponent} from './environmental-data/environmental-data.component';
import {EnvironmentalSampleDataComponent} from './environmental-sample-data/environmental-sample-data.component';

export const routes: Routes = [
  {path:'environmentalData', component:EnvironmentalDataComponent,},
  {path:'environmentalSampleData', component:EnvironmentalSampleDataComponent,},
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
