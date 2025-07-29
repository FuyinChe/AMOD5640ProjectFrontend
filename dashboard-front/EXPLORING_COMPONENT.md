# Exploring Component

## Overview
The Exploring component integrates air temperature data and crops yield data to provide comprehensive insights into the relationship between environmental conditions and agricultural productivity in Peterborough County. This component features advanced data visualization that combines temperature trends with crop yield patterns over time.

## Features

### Data Integration
- **Crops Yield Data**: Reads from `crops_yield.csv` file containing historical crop yield data for Peterborough County
- **Air Temperature Data**: Fetches temperature data from the backend API for multiple years
- **Integrated Analysis**: Combines both datasets to show correlations and trends over time

### Interactive Controls
- **Year Range Selection**: Choose start and end years (1949-2024) to analyze specific time periods
- **Crop Selection**: Select from available crops (corn, soybean, wheat) to analyze specific crop yields
- **Dynamic Updates**: Real-time data refresh when parameters change

### Advanced Data Visualization
- **Integrated Temperature-Yield Chart**: Custom SVG visualization showing temperature trends (line chart) and yield data (bar chart) overlaid
- **Statistical Analysis**: Correlation coefficients, averages, and ranges for both temperature and yield data
- **Summary Cards**: Display key metrics including crop yield and average temperature
- **Detailed Data Tables**: Comprehensive tables showing all data points with precise values

## Technical Implementation

### Services
- `CropsYieldService`: Handles CSV parsing and data filtering for crops yield data
- `AirTemperatureService`: Manages API calls to fetch temperature data
- `AuthService`: Ensures user authentication for accessing temperature data

### Component Structure
```
exploring/
├── exploring.component.ts      # Main component logic
├── exploring.component.html    # Template with BEM CSS classes
├── exploring.component.scss    # Styles following BEM convention
└── components/
    └── temperature-yield-chart/
        ├── temperature-yield-chart.component.ts      # Chart component logic
        ├── temperature-yield-chart.component.html    # Chart template
        └── temperature-yield-chart.component.scss    # Chart styles
```

### Data Flow
1. Component loads crops yield data from CSV file
2. User selects year range and crop from dropdown controls
3. Component fetches temperature data for all years in the selected range (requires authentication)
4. Data is combined and analyzed for correlations and trends
5. Integrated visualization displays temperature trends and yield patterns together
6. Statistical analysis provides insights into the relationship between environmental conditions and agricultural productivity

## Usage

### Navigation
The Exploring component is accessible via the "EXPLORING" tab in the main navigation header, located between "DOWNLOAD" and "SAMPLE DATA".

### Authentication
- Crops yield data is publicly accessible
- Temperature data requires user login
- Unauthenticated users will see an error message prompting them to log in

### Data Sources
- **Crops Yield**: Local CSV file (`/assets/crops_yield.csv`)
- **Temperature Data**: Backend API endpoint (`/charts/air-temperature/`)

## Styling
The component follows the BEM (Block Element Modifier) naming convention for CSS classes, ensuring consistency with the existing codebase.

## Error Handling
- Loading states with spinner animation
- Error messages with retry functionality
- Graceful handling of missing or invalid data
- Null safety checks for all data properties 