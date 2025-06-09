import { Component } from '@angular/core';

import {OnInit} from '@angular/core';

import {CustomerService} from '../customer.service';
import {NgForOf, NgIf} from '@angular/common';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-customer',
  imports: [
    RouterOutlet,
    NgIf,
    NgForOf
  ],
  standalone: true, // stadalone mode
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css'
})
export class CustomerComponent implements OnInit{
  customers: any[] = [];

  constructor(private customerService:CustomerService){}

  ngOnInit() {
    this.customerService.getCustomers().subscribe({
      next: data => this.customers = data,
      error: err => console.error(err)
    });
  }

}
