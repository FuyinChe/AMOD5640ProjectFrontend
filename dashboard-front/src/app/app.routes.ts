import { Routes } from '@angular/router';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CustomerComponent} from './customer/customer.component';
import {UserRegistrationComponent} from './user-registration/user-registration.component';
import {UserLoginComponent} from './user-login/user-login.component';

export const routes: Routes = [
  {path:'customers', component:CustomerComponent,},
  {path: '', redirectTo:'/customers', pathMatch:'full'},
  {path:'register', component: UserRegistrationComponent},
  {path:'login', component:UserLoginComponent},
  {path: '**', redirectTo: 'login' }

];


@NgModule({
  imports:[RouterModule.forRoot(routes)],
  exports:[RouterModule]
})

export class AppRoutes{}
