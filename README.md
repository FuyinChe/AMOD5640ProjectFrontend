# Environmental Data Dashboard - Frontend

A modern Angular-based web application for visualizing and analyzing environmental data from agricultural monitoring systems. This project provides an intuitive interface for researchers, farmers, and environmental scientists to access, analyze, and download environmental data.

## 🌟 Features

### 📊 Data Visualization
- **Interactive Charts**: Real-time environmental data visualization using Chart.js
- **Multiple Metrics**: Air temperature, humidity, rainfall, soil temperature, wind speed, and solar radiation
- **Date Range Filtering**: Customizable time periods for data analysis
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🔐 User Management
- **Secure Registration**: Email verification system with two-step registration process
- **User Authentication**: Login system with email validation
- **Password Security**: Confirmation password validation and security warnings

### 📥 Data Export
- **CSV Export**: Download environmental data in CSV format
- **Excel Export**: Export data to Excel spreadsheets
- **Sample Data**: Access to sample environmental datasets for testing

### 🎨 Modern UI/UX
- **BEM Methodology**: Clean, maintainable CSS architecture
- **SCSS Styling**: Advanced styling with variables, nesting, and mixins
- **Trent University Branding**: Consistent with institutional design guidelines
- **Responsive Layout**: Adaptive design for all screen sizes

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Angular 19.2.12
- **Styling**: SCSS with BEM methodology
- **Charts**: Chart.js with ng2-charts
- **HTTP Client**: Angular HttpClient for API communication
- **Routing**: Angular Router for navigation

### Project Structure
```
dashboard-front/
├── src/
│   ├── app/
│   │   ├── about/                 # About page component
│   │   ├── dashboard/             # Main dashboard with charts
│   │   │   ├── dashboard/         # Dashboard container
│   │   │   ├── humidity-chart/    # Humidity visualization
│   │   │   ├── rainfall-chart/    # Rainfall visualization
│   │   │   ├── sample-chart/      # Sample data chart
│   │   │   ├── snow-depth-chart/  # Snow depth visualization
│   │   │   └── soil-temp5cm-chart/# Soil temperature chart
│   │   ├── download/              # Data download component
│   │   ├── environmental-data/    # Environmental data display
│   │   ├── environmental-sample-data/ # Sample data management
│   │   ├── footer/                # Footer component
│   │   ├── header/                # Header component
│   │   ├── interfaces/            # TypeScript interfaces
│   │   ├── nav/                   # Navigation component
│   │   ├── services/              # API services
│   │   ├── user-login/            # User authentication
│   │   ├── user-registration/     # User registration
│   │   └── welcome/               # Landing page
│   ├── assets/                    # Static assets
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
   - Update API endpoints in `src/api.config.ts`

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
2. Navigate to the dashboard
3. Use date range filters to select time periods
4. View interactive charts for different environmental metrics
5. Hover over chart elements for detailed information

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

### API Configuration
Update the API base URL in `src/api.config.ts`:
```typescript
export const API_BASE_URL = 'http://your-api-endpoint.com/api';
```

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

5. **Update `src/api.config.ts` to use environment variables**
   ```typescript
   export const API_BASE_URL = process.env['API_BASE_URL'] || 'http://localhost:8000/api';
   export const NODE_ENV = process.env['NODE_ENV'] || 'development';
   export const NG_APP_ENVIRONMENT = process.env['NG_APP_ENVIRONMENT'] || 'development';
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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

### Development Team
- **Frontend Development**: Angular, TypeScript, SCSS
- **UI/UX Design**: Responsive design, accessibility
- **Data Visualization**: Chart.js integration
- **Testing**: Unit and integration testing

### Project Support
For questions, issues, or contributions, please contact the development team or create an issue in the repository.

## 🔗 Related Links

- [Angular Documentation](https://angular.dev/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [BEM Methodology](https://en.bem.info/methodology/)
- [SCSS Documentation](https://sass-lang.com/documentation)

## 📈 Future Enhancements

- **Real-time Data**: WebSocket integration for live updates
- **Advanced Analytics**: Statistical analysis tools
- **Mobile App**: React Native or Flutter companion app
- **Data Comparison**: Multi-site data comparison features
- **Export Formats**: Additional export options (JSON, XML)
- **User Roles**: Role-based access control
- **Notifications**: Email alerts for data thresholds

---

**Built with ❤️ for environmental research and agricultural monitoring**
