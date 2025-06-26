import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http'; // ✅ new API
//
// bootstrapApplication(AppComponent, appConfig)
//   .catch((err) => console.error(err));
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import {AuthInterceptor} from './app/services/auth.interceptor'; // <--- Import provideCharts


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // ✅ use this instead of HttpClientModule
    provideCharts(withDefaultRegisterables()), // <--- Provide charts here
    provideHttpClient(
      withInterceptors([AuthInterceptor])  // ✅ provide interceptors
    ),
  ]
})
