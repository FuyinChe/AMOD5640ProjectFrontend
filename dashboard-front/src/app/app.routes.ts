import { Routes } from '@angular/router';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CustomerComponent} from './customer/customer.component';


export const routes: Routes = [
  {path:'customers', component:CustomerComponent,},
  {path: '', redirectTo:'/customers', pathMatch:'full'}
];


@NgModule({
  imports:[RouterModule.forRoot(routes)],
  exports:[RouterModule]
})

export class AppRoutes{}
