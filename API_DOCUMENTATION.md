# API Documentation - Environmental Data Dashboard

This document provides comprehensive documentation for the API endpoints used by the Environmental Data Dashboard frontend application.

## 🔗 Base URL

```
Development: http://localhost:8000/api
Production: https://your-production-api.com/api
```

## 🔐 Authentication

The API uses JWT (JSON Web Token) authentication with access and refresh tokens.

### Authentication Endpoints

#### 1. Login
**POST** `/token/`

Authenticate user and receive access/refresh tokens.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user@example.com"
  }
}
```

#### 2. Refresh Token
**POST** `/token/refresh/`

Refresh expired access token using refresh token.

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### 3. Get User Info
**GET** `/userinfo/`

Get current user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "user@example.com"
}
```

## 📊 Environmental Data Endpoints

### Chart Data Endpoints

All chart endpoints support the following query parameters:
- `start_date`: Start date in YYYY-MM-DD format
- `end_date`: End date in YYYY-MM-DD format
- `group_by`: Data grouping (hour, day, week, month)

#### 1. Atmospheric Pressure
**GET** `/charts/atmospheric-pressure/`

**Query Parameters:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD
- `group_by`: hour | day | week | month

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "period": "2024-01-01T00:00:00",
      "avg": 101.325,
      "max": 101.5,
      "min": 101.1
    }
  ],
  "unit": "kPa"
}
```

#### 2. Humidity
**GET** `/charts/humidity/`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "period": "2024-01-01T00:00:00",
      "avg": 65.5,
      "max": 85.2,
      "min": 45.1
    }
  ],
  "unit": "%"
}
```

#### 3. Rainfall
**GET** `/charts/rainfall/`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "period": "2024-01-01T00:00:00",
      "total": 2.5,
      "max": 0.8,
      "avg": 0.3
    }
  ],
  "unit": "mm"
}
```

#### 4. Soil Temperature
**GET** `/charts/soil-temperature/`

**Query Parameters:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD
- `group_by`: hour | day | week | month
- `depth`: 5cm | 10cm | 20cm | 25cm | 50cm

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "period": "2024-01-01T00:00:00",
      "avg": 15.2,
      "max": 18.5,
      "min": 12.1
    }
  ],
  "unit": "°C"
}
```

#### 5. Wind Speed
**GET** `/charts/wind-speed/`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "period": "2024-01-01T00:00:00",
      "avg": 3.2,
      "max": 8.5,
      "min": 0.5
    }
  ],
  "unit": "m/s"
}
```

#### 6. Snow Depth
**GET** `/charts/snow-depth/`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "period": "2024-01-01T00:00:00",
      "avg": 0.15,
      "max": 0.25,
      "min": 0.05
    }
  ],
  "unit": "m"
}
```

#### 7. Shortwave Radiation
**GET** `/charts/shortwave-radiation/`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "period": "2024-01-01T00:00:00",
      "avg": 450.2,
      "max": 850.5,
      "min": 0.0
    }
  ],
  "unit": "W/m²"
}
```

### Statistical Analysis Endpoints

#### 1. Boxplot Statistics
**GET** `/charts/statistical/boxplot/`

**Query Parameters:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD
- `metrics`: Array of metric names (e.g., air_temperature, humidity, rainfall)
- `include_outliers`: true | false
- `depth`: 5cm (for soil temperature)

**Response:**
```json
{
  "success": true,
  "data": {
    "air_temperature": [
      {
        "period": "January",
        "period_code": 1,
        "statistics": {
          "min": -5.2,
          "q1": 2.1,
          "median": 8.5,
          "q3": 15.2,
          "max": 25.8,
          "outliers": [26.5, 27.1],
          "count": 744
        }
      }
    ]
  },
  "metadata": {
    "total_records": 744,
    "date_range": "2024-01-01 to 2024-01-31"
  }
}
```

#### 2. Histogram Statistics
**GET** `/charts/statistical/histogram/`

**Query Parameters:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD
- `metrics`: Array of metric names
- `bins`: Number of histogram bins (default: 20)
- `depth`: 5cm (for soil temperature)

**Response:**
```json
{
  "success": true,
  "data": {
    "air_temperature": {
      "bins": [0, 5, 10, 15, 20, 25],
      "frequencies": [45, 120, 200, 180, 95, 24],
      "statistics": {
        "mean": 12.5,
        "std": 6.8,
        "min": 0.2,
        "max": 25.8
      }
    }
  }
}
```

#### 3. Correlation Analysis
**GET** `/charts/statistical/correlation/`

**Query Parameters:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD
- `metrics`: Array of metric names (e.g., humidity, temperature, wind_speed)
- `correlation_method`: pearson | spearman (default: pearson)

**Response:**
```json
{
  "success": true,
  "data": {
    "correlation_matrix": [
      [1.0, -0.0103, -0.0148, 0.0113, -0.0075, -0.0090, 0.0224],
      [-0.0103, 1.0, 0.0076, -0.0027, 0.0105, -0.0061, 0.0075],
      [-0.0148, 0.0076, 1.0, 0.0171, -0.4698, -0.1009, 0.0003],
      [0.0113, -0.0027, 0.0171, 1.0, -0.0088, -0.0026, -0.0080],
      [-0.0075, 0.0105, -0.4698, -0.0088, 1.0, 0.0390, 0.0016],
      [-0.0090, -0.0061, -0.1009, -0.0026, 0.0390, 1.0, -0.0064],
      [0.0224, 0.0075, 0.0003, -0.0080, 0.0016, -0.0064, 1.0]
    ],
    "p_value_matrix": [
      [0.0, 0.4594, 0.2891, 0.4169, 0.5908, 0.5205, 0.1089],
      [0.4594, 0.0, 0.5845, 0.8445, 0.4513, 0.6614, 0.5904],
      [0.2891, 0.5845, 0.0, 0.2201, 2.12e-279, 4.70e-13, 0.9819],
      [0.4169, 0.8445, 0.2201, 0.0, 0.5287, 0.8515, 0.5656],
      [0.5908, 0.4513, 2.12e-279, 0.5287, 0.0, 0.0053, 0.9075],
      [0.5205, 0.6614, 4.70e-13, 0.8515, 0.0053, 0.0, 0.6457],
      [0.1089, 0.5904, 0.9819, 0.5656, 0.9075, 0.6457, 0.0]
    ],
    "metric_names": [
      "humidity",
      "temperature",
      "wind_speed",
      "rainfall",
      "snow_depth",
      "atmospheric_pressure",
      "soil_temperature"
    ],
    "pairwise_correlations": [
      {
        "metric1": "wind_speed",
        "metric2": "snow_depth",
        "correlation": -0.4698,
        "p_value": 0.0,
        "sample_size": 5118
      }
    ],
    "statistics": {
      "total_records": 5118,
      "valid_pairs": 21,
      "strong_correlations": 0,
      "moderate_correlations": 1,
      "weak_correlations": 20
    }
  },
  "metadata": {
    "start_date": "2023-01-01",
    "end_date": "2023-12-31",
    "metrics": ["humidity", "temperature", "wind_speed", "rainfall", "snow_depth", "shortwave_radiation", "atmospheric_pressure", "soil_temperature"],
    "correlation_method": "pearson",
    "include_p_values": true,
    "sample_size": 10000,
    "depth": "5cm"
  }
}
```

### Summary Data Endpoints

#### 1. Monthly Summary
**GET** `/monthly-summary/`

**Query Parameters:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD

**Response:**
```json
[
  {
    "year": 2024,
    "month": 1,
    "month_name": "January",
    "record_count": 744,
    "air_temperature_max": 25.8,
    "air_temperature_min": -5.2,
    "air_temperature_mean": 8.5,
    "air_temperature_std": 6.8,
    "relative_humidity_max": 95.2,
    "relative_humidity_min": 35.1,
    "relative_humidity_mean": 65.5,
    "relative_humidity_std": 12.3,
    "shortwave_radiation_max": 850.5,
    "shortwave_radiation_min": 0.0,
    "shortwave_radiation_mean": 450.2,
    "shortwave_radiation_std": 280.5,
    "rainfall_total": 45.2,
    "rainfall_max": 8.5,
    "rainfall_mean": 1.5,
    "rainfall_std": 2.1,
    "soil_temp_5cm_max": 18.5,
    "soil_temp_5cm_min": 2.1,
    "soil_temp_5cm_mean": 10.2,
    "soil_temp_5cm_std": 4.8,
    "wind_speed_max": 12.5,
    "wind_speed_min": 0.2,
    "wind_speed_mean": 3.2,
    "wind_speed_std": 2.1,
    "snow_depth_max": 0.25,
    "snow_depth_min": 0.0,
    "snow_depth_mean": 0.05,
    "snow_depth_std": 0.08,
    "atmospheric_pressure_max": 102.5,
    "atmospheric_pressure_min": 98.2,
    "atmospheric_pressure_mean": 101.3,
    "atmospheric_pressure_std": 0.8
  }
]
```

### Raw Data Endpoints

#### 1. Environmental Records
**GET** `/environmental-records/`

**Query Parameters:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD
- `limit`: Number of records to return (default: 100)
- `offset`: Number of records to skip (default: 0)

**Response:**
```json
{
  "count": 1000,
  "next": "http://localhost:8000/api/environmental-records/?limit=100&offset=100",
  "previous": null,
  "results": [
    {
      "id": 1,
      "Timestamp": "2024-01-01T00:00:00Z",
      "DOY": 1,
      "AirTemperature_degC": 8.5,
      "RelativeHumidity_Pct": 65.5,
      "ShortwaveRadiation_Wm2": 450.2,
      "Rainfall_mm": 0.0,
      "SoilTemperature_5cm_degC": 10.2,
      "SoilTemperature_20cm_degC": 12.1,
      "SoilTemperature_50cm_degC": 15.8,
      "WindSpeed_ms": 3.2,
      "WindVector_ms": 3.2,
      "WindDirection_deg": 180.5,
      "WindDirectionSD_deg": 15.2,
      "SnowDepth_m": 0.05,
      "LoggerTemperature_degC": 8.2,
      "LoggerVoltage_V": 12.5,
      "TotalPrecipitation_mV": 0.0,
      "TotalPrecipitation_mm": 0.0,
      "AtmosphericPressure_kPa": 101.3,
      "BatteryVoltage_V": 12.8,
      "MinutesOut_min": 0,
      "PanelTemp_degC": 8.5,
      "SnowDepth_cm": 5.0,
      "SolarRadiation_Wm2": 450.2,
      "SoilTemperature_10cm_degC": 11.2,
      "SoilTemperature_25cm_degC": 13.5,
      "Record_TCS_30min": 1,
      "LoggerTemp_degC": 8.2,
      "BarometricPressure_TCS_kPa": 101.3,
      "Year": 2024,
      "Month": 1,
      "Day": 1,
      "Time": "00:00:00"
    }
  ]
}
```

#### 2. Sample Data
**GET** `/sample-data/`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "Timestamp": "2024-01-01T00:00:00Z",
      "AirTemperature_degC": 8.5,
      "RelativeHumidity_Pct": 65.5,
      "Rainfall_mm": 0.0,
      "SoilTemperature_5cm_degC": 10.2,
      "WindSpeed_ms": 3.2,
      "AtmosphericPressure_kPa": 101.3
    }
  ]
}
```

## 📥 Data Export Endpoints

### CSV Export
**GET** `/export/csv/`

**Query Parameters:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD
- `format`: csv | excel

**Response:** File download (CSV or Excel format)

## 🔧 Error Handling

### Standard Error Response Format
```json
{
  "detail": "Error message description",
  "status_code": 400,
  "error_type": "validation_error"
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

### Authentication Errors
- `401`: Invalid credentials or expired token
- `403`: Insufficient permissions

## 📋 Request Headers

### Required Headers for Authenticated Endpoints
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Optional Headers
```
Accept: application/json
Accept-Language: en-US,en;q=0.9
```

## 🔄 Rate Limiting

- **Rate Limit**: 1000 requests per hour per user
- **Burst Limit**: 100 requests per minute
- **Headers**: Rate limit information is included in response headers

## 📊 Data Units

| Metric | Unit | Description |
|--------|------|-------------|
| Air Temperature | °C | Celsius |
| Relative Humidity | % | Percentage |
| Rainfall | mm | Millimeters |
| Soil Temperature | °C | Celsius |
| Wind Speed | m/s | Meters per second |
| Wind Direction | ° | Degrees (0-360) |
| Snow Depth | m | Meters |
| Shortwave Radiation | W/m² | Watts per square meter |
| Atmospheric Pressure | kPa | Kilopascals |
| Battery Voltage | V | Volts |
| Logger Temperature | °C | Celsius |

## 🚀 Usage Examples

### JavaScript/TypeScript Example
```typescript
import { HttpClient, HttpHeaders } from '@angular/common/http';

// Login
const loginData = {
  username: 'user@example.com',
  password: 'password123'
};

this.http.post('/api/token/', loginData).subscribe(response => {
  const token = response.access;
  
  // Use token for authenticated requests
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  
  // Get atmospheric pressure data
  this.http.get('/api/charts/atmospheric-pressure/', {
    headers,
    params: {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      group_by: 'day'
    }
  }).subscribe(data => {
    console.log('Atmospheric pressure data:', data);
  });
});
```

### cURL Example
```bash
# Login
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "user@example.com", "password": "password123"}'

# Get atmospheric pressure data
curl -X GET "http://localhost:8000/api/charts/atmospheric-pressure/?start_date=2024-01-01&end_date=2024-01-31&group_by=day" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔗 Related Documentation

- [Frontend README](../README.md) - Main project documentation
- [Environment Configuration](../dashboard-front/src/environments/) - API configuration
- [Service Files](../dashboard-front/src/app/services/) - Frontend service implementations

---

**Last Updated**: January 2025  
**API Version**: v1.0  
**Maintained by**: Environmental Data Dashboard Team 