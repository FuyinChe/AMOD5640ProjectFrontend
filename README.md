# Environmental Data Dashboard - Frontend

A modern Angular-based web application for visualizing and analyzing environmental data from agricultural monitoring systems. This project provides an intuitive interface for researchers, farmers, and environmental scientists to access, analyze, and download environmental data.

## 🌟 Features

### 📊 Data Visualization
- **Dual Dashboard System**: 
  - **Chart.js Dashboard**: Traditional charts with ng2-charts integration(has been hidden from nav links)
  - **Plotly Dashboard**: Advanced interactive visualizations with Plotly.js
- **Multiple Environmental Metrics**: 
  - Air temperature and atmospheric pressure
  - Humidity and rainfall
  - Soil temperature (5cm depth)
  - Wind speed and direction
  - Snow depth
  - Shortwave radiation
- **Advanced Analytics**: Statistical boxplots, histograms, and summary heatmaps
- **Date Range Filtering**: Customizable time periods for data analysis
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Interactive Features**: Zoom, pan, hover tooltips, and export capabilities

### 🔐 User Management
- **Secure Registration**: Email verification system with two-step registration process
- **User Authentication**: Login system with email validation
- **Password Security**: Confirmation password validation and security warnings
- **Session Management**: Secure token-based authentication

### 📥 Data Export & Management
- **CSV Export**: Download environmental data in CSV format
- **Excel Export**: Export data to Excel spreadsheets
- **Sample Data**: Access to sample environmental datasets for testing
- **Environmental Matrix Table**: Comprehensive data display with filtering

### 🎨 Modern UI/UX
- **BEM Methodology**: Clean, maintainable CSS architecture following Block Element Modifier principles
- **SCSS Styling**: Advanced styling with variables, nesting, and mixins
- **Trent University Branding**: Consistent with institutional design guidelines
- **Responsive Layout**: Adaptive design for all screen sizes
- **Accessibility**: WCAG compliant design patterns

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Angular 19.2.12
- **Styling**: SCSS with BEM methodology
- **Charts**: 
  - Chart.js with ng2-charts (Traditional Dashboard)
  - Plotly.js (Advanced Dashboard with statistical analysis)
- **HTTP Client**: Angular HttpClient with interceptors for authentication
- **Routing**: Angular Router for navigation
- **TypeScript**: Strict typing for better code quality

### Project Structure
```
dashboard-front/
├── src/
│   ├── app/
│   │   ├── about/                 # About page component
│   │   ├── dashboard/             # Chart.js dashboard with ng2-charts
│   │   │   ├── dashboard/         # Dashboard container
│   │   │   ├── chart-card/        # Reusable chart card component
│   │   │   ├── environmental-matrix-table/ # Data table component
│   │   │   ├── humidity-chart/    # Humidity visualization
│   │   │   ├── rainfall-chart/    # Rainfall visualization
│   │   │   ├── sample-chart/      # Sample data chart
│   │   │   ├── snow-depth-chart/  # Snow depth visualization
│   │   │   └── soil-temp5cm-chart/# Soil temperature chart
│   │   ├── plotly-dashboard/      # Plotly.js dashboard
│   │   │   ├── components/        # Plotly chart components
│   │   │   │   ├── plotly-atmospheric-pressure-chart/
│   │   │   │   ├── plotly-chart-card/
│   │   │   │   ├── plotly-humidity-chart/
│   │   │   │   ├── plotly-radar-chart/
│   │   │   │   ├── plotly-rainfall-chart/
│   │   │   │   ├── plotly-shortwave-radiation-chart/
│   │   │   │   ├── plotly-snow-depth-chart/
│   │   │   │   ├── plotly-soil-temp-chart/
│   │   │   │   ├── plotly-statistical-boxplot-chart/
│   │   │   │   ├── plotly-statistical-histogram-chart/
│   │   │   │   ├── plotly-summary-heatmap/
│   │   │   │   └── plotly-wind-speed-chart/
│   │   │   └── services/          # Plotly dashboard services
│   │   ├── download/              # Data download component
│   │   ├── environmental-data/    # Environmental data display
│   │   ├── environmental-sample-data/ # Sample data management
│   │   ├── footer/                # Footer component
│   │   ├── header/                # Header component
│   │   ├── interfaces/            # TypeScript interfaces
│   │   ├── services/              # API services for all data types
│   │   ├── user-login/            # User authentication
│   │   ├── user-registration/     # User registration
│   │   └── welcome/               # Landing page
│   ├── assets/                    # Static assets (images, fonts)
│   └── environments/              # Environment configuration
```

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18 or higher
- **npm**: Package manager
- **Angular CLI**: Global installation recommended

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AMOD5640ProjectFrontend
   ```

2. **Install dependencies**
   ```bash
   cd dashboard-front
   npm install
   ```

3. **Configure environment**
   - Copy `src/environments/environment.ts` to `src/environments/environment.prod.ts`
   - Update API endpoints in environment files as needed

4. **Start development server**
   ```bash
   ng serve
   ```

5. **Open application**
   - Navigate to `http://localhost:4200/`
   - The application will automatically reload on file changes

## 📋 Usage

### User Registration
1. Navigate to the registration page
2. Enter your email address (avoid school/organization emails for verification)
3. Create and confirm your password
4. Check your email for verification code
5. Enter the verification code to complete registration

### Data Visualization
1. Log in to your account
2. Navigate to either dashboard:
   - **Dashboard (Chart.js)**: Traditional charts with ng2-charts
   - **Dashboard (Plotly)**: Advanced interactive visualizations with statistical analysis
3. Use date range filters to select time periods
4. View interactive charts for different environmental metrics:
   - Atmospheric pressure trends
   - Humidity patterns
   - Rainfall accumulation
   - Soil temperature variations
   - Wind speed and direction
   - Snow depth measurements
   - Shortwave radiation data
5. Use Plotly dashboard features:
   - Zoom and pan functionality
   - Hover tooltips with detailed information
   - Export charts as images
   - Statistical analysis with boxplots, histograms, and correlation matrices
   - Summary heatmaps for data overview

### Data Export
1. Go to the Environmental Sample Data page
2. Use the download buttons to export data
3. Choose between CSV or Excel format
4. Files will be downloaded to your default download folder

## 🔧 Development

### Code Style
- **TypeScript**: Strict typing enabled
- **SCSS**: BEM methodology for CSS organization
- **Components**: Standalone Angular components
- **Services**: Injectable services for API communication
- **Interfaces**: TypeScript interfaces for data models

### Key Commands

```bash
# Development server
ng serve

# Build for production
ng build --configuration production

# Run unit tests
ng test

# Run end-to-end tests
ng e2e

# Generate new component
ng generate component component-name

# Generate new service
ng generate service service-name
```

### API Services
The application includes dedicated services for each environmental metric:
- `atmospheric-pressure.service.ts`
- `humidity.service.ts`
- `rainfall.service.ts`
- `soil-temperature.service.ts`
- `wind-speed.service.ts`
- `snow-depth.service.ts`
- `shortwave-radiation.service.ts`
- `statistical-boxplot.service.ts`
- `statistical-histogram.service.ts`
- `environmental-monthly-summary.service.ts`

### API Documentation
For detailed information about the backend API endpoints, request/response formats, authentication, and usage examples, see the [API Documentation](API_DOCUMENTATION.md) file.

## 🧪 Testing

### Unit Tests
```bash
ng test
```
- Uses Karma test runner
- Jasmine testing framework
- Component and service testing

### End-to-End Tests
```bash
ng e2e
```
- Protractor or Playwright (configurable)
- User workflow testing
- Integration testing

## 📦 Deployment

### Production Build
```bash
ng build --configuration production
```

### Vercel Deployment

Vercel is the recommended deployment platform for this Angular application. It provides automatic deployments, preview environments, and excellent performance.

#### Prerequisites
- [Vercel CLI](https://vercel.com/cli) installed globally
- [Vercel account](https://vercel.com/signup) created
- Git repository connected to Vercel

#### Step-by-Step Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to project directory**
   ```bash
   cd dashboard-front
   ```

4. **Deploy to Vercel**
   ```bash
   vercel
   ```

5. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? `Select your account`
   - Link to existing project? `N`
   - Project name: `environmental-dashboard-frontend`
   - Directory: `./` (current directory)
   - Override settings? `N`

#### Environment Variables Setup

1. **Create `.env` file in the project root**
   ```bash
   touch .env
   ```

2. **Add environment variables to `.env`**
   ```env
   # API Configuration
   API_BASE_URL=https://your-backend-api.com/api
   
   # Environment
   NODE_ENV=production
   
   # Angular Configuration
   NG_APP_ENVIRONMENT=production
   
   # Optional: Analytics
   GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
   
   # Optional: Feature Flags
   ENABLE_REAL_TIME_DATA=false
   ENABLE_ADVANCED_CHARTS=true
   ```

3. **Create `.env.local` for local development**
   ```env
   # Local Development
   API_BASE_URL=http://localhost:8000/api
   NODE_ENV=development
   NG_APP_ENVIRONMENT=development
   ```

4. **Set up Vercel environment variables**
   ```bash
   # Set production environment variables
   vercel env add API_BASE_URL production
   vercel env add NODE_ENV production
   vercel env add NG_APP_ENVIRONMENT production
   
   # Set preview environment variables (for pull requests)
   vercel env add API_BASE_URL preview
   vercel env add NODE_ENV preview
   vercel env add NG_APP_ENVIRONMENT preview
   ```

#### Vercel Configuration

1. **Create `vercel.json` in project root**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist/dashboard-front"
         }
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ],
     "env": {
       "API_BASE_URL": "@api_base_url",
       "NODE_ENV": "@node_env",
       "NG_APP_ENVIRONMENT": "@ng_app_environment"
     }
   }
   ```

2. **Update `angular.json` for Vercel build**
   ```json
   {
     "projects": {
       "dashboard-front": {
         "architect": {
           "build": {
             "options": {
               "outputPath": "dist/dashboard-front",
               "optimization": true,
               "sourceMap": false,
               "namedChunks": false,
               "aot": true,
               "extractLicenses": true,
               "vendorChunk": false,
               "buildOptimizer": true
             }
           }
         }
       }
     }
   }
   ```

#### Automatic Deployments

1. **Connect GitHub repository to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings:
     - Framework Preset: `Angular`
     - Build Command: `ng build --configuration production`
     - Output Directory: `dist/dashboard-front`
     - Install Command: `npm install`

2. **Configure deployment settings**
   - Production Branch: `main` or `master`
   - Preview Branches: `develop`, `feature/*`
   - Environment Variables: Set through Vercel dashboard

#### Environment-Specific Configurations

1. **Production Environment**
   ```env
   API_BASE_URL=https://api.production.com
   NODE_ENV=production
   NG_APP_ENVIRONMENT=production
   ENABLE_ANALYTICS=true
   ```

2. **Staging Environment**
   ```env
   API_BASE_URL=https://api.staging.com
   NODE_ENV=staging
   NG_APP_ENVIRONMENT=staging
   ENABLE_ANALYTICS=false
   ```

3. **Development Environment**
   ```env
   API_BASE_URL=http://localhost:8000/api
   NODE_ENV=development
   NG_APP_ENVIRONMENT=development
   ENABLE_ANALYTICS=false
   ```

#### Troubleshooting

**Common Issues and Solutions:**

1. **Build Failures**
   ```bash
   # Clear cache and reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   vercel --force
   ```

2. **Environment Variables Not Loading**
   ```bash
   # Verify environment variables are set
   vercel env ls
   
   # Redeploy with environment variables
   vercel --prod
   ```

3. **Routing Issues**
   - Ensure `vercel.json` has proper route configuration
   - Check that Angular routing is configured correctly

4. **API Connection Issues**
   - Verify `API_BASE_URL` is correct
   - Check CORS configuration on backend
   - Ensure HTTPS is used in production

#### Performance Optimization

1. **Enable Vercel Analytics**
   ```bash
   vercel analytics enable
   ```

2. **Configure Edge Functions** (if needed)
   ```javascript
   // api/hello.js
   export default function handler(req, res) {
     res.status(200).json({ message: 'Hello from Vercel!' });
   }
   ```

3. **Optimize Images**
   - Use Vercel's Image Optimization
   - Configure `next.config.js` for image optimization

#### Monitoring and Logs

1. **View deployment logs**
   ```bash
   vercel logs
   ```

2. **Monitor performance**
   - Use Vercel Analytics
   - Check Core Web Vitals
   - Monitor API response times

### Other Deployment Options
- **Netlify**: Static site hosting
- **AWS S3**: Cloud storage deployment
- **Docker**: Containerized deployment

## 🔒 Security Features

- **Email Verification**: Two-step registration process
- **Password Validation**: Secure password requirements
- **HTTPS**: Secure communication protocols
- **Input Sanitization**: XSS protection
- **CORS Configuration**: Cross-origin resource sharing
- **Authentication Interceptor**: Token-based API authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Angular style guide
- Use BEM methodology for CSS
- Write unit tests for new features
- Update documentation for API changes
- Maintain TypeScript strict typing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

### Development Team
- **Frontend Development**: Angular, TypeScript, SCSS
- **UI/UX Design**: Responsive design, accessibility
- **Data Visualization**: Chart.js and Plotly.js integration
- **Testing**: Unit and integration testing

### Project Support
For questions, issues, or contributions, please contact the development team or create an issue in the repository.

## 🔗 Related Links

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference and usage guide
- [Angular Documentation](https://angular.dev/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Plotly.js Documentation](https://plotly.com/javascript/)
- [BEM Methodology](https://en.bem.info/methodology/)
- [SCSS Documentation](https://sass-lang.com/documentation)

## 📈 Future Enhancements

- **Real-time Data**: WebSocket integration for live updates
- **Advanced Analytics**: Statistical analysis tools including correlation analysis and machine learning integration
- **Mobile App**: React Native or Flutter companion app
- **Data Comparison**: Multi-site data comparison features
- **Export Formats**: Additional export options (JSON, XML, PDF reports)
- **User Roles**: Role-based access control and permissions
- **Notifications**: Email alerts for data thresholds and anomalies
- **3D Visualizations**: Plotly 3D charts for multi-dimensional analysis
- **Dashboard Customization**: User-configurable dashboard layouts and widgets
- **Advanced Plotly Features**: Subplots, animations, and statistical charts
- **Data Validation**: Real-time data quality checks and validation
- **API Rate Limiting**: Intelligent caching and request optimization
- **Offline Support**: Progressive Web App features for offline data access

---

**Built with ❤️ for environmental research and agricultural monitoring at Trent University**
