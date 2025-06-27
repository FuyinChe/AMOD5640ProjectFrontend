import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink, RouterOutlet} from '@angular/router';

interface Testimonial {
  image: string;
}

interface BlogPost {
  image: string;
  title: string;
  description: string;
  link: string;
}

@Component({
  standalone: true,
  selector: 'app-welcome',
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent {
  testimonials: Testimonial[] = [
    {
      image: './images/farm1.jpg',     
    },
    {
      image: './images/farm2.jpg',     
    },
    {
      image: './images/farm3.jpg',     
    },
    {
      image: './images/farm4.jpg',     
    },
  ];

  currentTestimonial = 0;

  blogPosts: BlogPost[] = [
    {
      image: './images/chart.jpg',
      title: 'Real-time Charts',
      description: 'Visualize temperature, humidity, rainfall and more with dynamic dashboards.',
      link: '/dashboard'
    },
    {
      image: './images/download-s.jpg',
      title: 'Easy Downloads',
      description: 'Export environmental data as CSV or Excel for offline analysis.',
      link: '/download'
    },
    {
      image: './images/research-s.jpg',
      title: 'Research Ready',
      description: 'Perfect for agriculture, climate science, and environmental education.',
      link: '/dashboard'
    }
  ];

  nextTestimonial() {
    this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length;
  }

  prevTestimonial() {
    this.currentTestimonial = (this.currentTestimonial - 1 + this.testimonials.length) % this.testimonials.length;
  }
}
