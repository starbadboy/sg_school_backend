# Singapore Primary School Analysis Web App Architecture

## Overview
The web application will be a full-stack solution that helps parents analyze primary schools in Singapore based on location, provides admission strategies using DeepSeek API, and visualizes P1 schooling results.

## Architecture Components

### Frontend (React)
- **Location Input Component**: Allow users to input their address or select location on map
- **School Search Results**: Display nearby schools with distance and basic information
- **School Details Modal**: Detailed view of individual schools with P1 data
- **Data Visualization Dashboard**: Charts and graphs showing P1 trends and statistics
- **Strategy Recommendations**: Display AI-generated admission strategies from DeepSeek API
- **Interactive Map**: Show schools on Singapore map with markers

### Backend (Flask)
- **School Data API**: Endpoints to fetch school information from data.gov.sg
- **Location Service**: Calculate distances between user location and schools
- **P1 Data Service**: Extract and serve P1 ballot history from sgschooling.com
- **DeepSeek Integration**: API to generate admission strategies
- **Data Processing**: Clean and structure data for frontend consumption

### Data Sources
1. **data.gov.sg**: Official school directory with addresses and contact information
2. **sgschooling.com**: P1 ballot history and registration statistics
3. **OneMap API**: Singapore's official mapping service for geocoding
4. **DeepSeek API**: AI-powered strategy recommendations

## Key Features

### 1. Location-Based School Search
- Input: User's address or postal code
- Process: Geocode address, find schools within specified radius (1km, 2km, 5km)
- Output: List of schools sorted by distance with basic information

### 2. P1 Data Visualization
- Historical ballot trends by school and phase
- Comparison charts between schools
- Success rate analysis by distance bands
- Interactive filters by year, phase, and school type

### 3. AI-Powered Admission Strategy
- Input: User preferences, target schools, current location
- Process: Analyze P1 data patterns, consider distance factors, generate recommendations
- Output: Personalized strategy with timeline and action items

### 4. School Comparison Tool
- Side-by-side comparison of multiple schools
- Key metrics: ballot history, success rates, distance, school programs
- Visual indicators for competitiveness levels

## Technology Stack

### Frontend
- **React**: Component-based UI framework
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Data visualization library
- **Leaflet**: Interactive maps
- **Axios**: HTTP client for API calls

### Backend
- **Flask**: Python web framework
- **SQLite**: Local database for caching data
- **Requests**: HTTP library for external API calls
- **Pandas**: Data manipulation and analysis
- **BeautifulSoup**: Web scraping for sgschooling.com

### APIs and Services
- **data.gov.sg API**: School directory data
- **OneMap API**: Geocoding and mapping
- **DeepSeek API**: AI strategy generation
- **Custom scraping**: sgschooling.com P1 data

## User Flow

1. **Landing Page**: Introduction and location input
2. **School Discovery**: View nearby schools on map and list
3. **School Analysis**: Detailed P1 data and trends for selected schools
4. **Strategy Generation**: AI-powered recommendations based on preferences
5. **Comparison**: Side-by-side analysis of target schools
6. **Action Plan**: Downloadable strategy document with timeline

## Data Flow

1. User inputs location → Geocoding via OneMap API
2. Find nearby schools → Query data.gov.sg API
3. Fetch P1 data → Scrape sgschooling.com
4. Generate strategy → Call DeepSeek API with context
5. Display results → Interactive dashboard with visualizations

## Security and Performance

- **Rate Limiting**: Prevent API abuse
- **Caching**: Store frequently accessed data locally
- **Error Handling**: Graceful fallbacks for API failures
- **Responsive Design**: Mobile-friendly interface
- **Progressive Loading**: Lazy load data and images

This architecture provides a comprehensive solution for Singapore primary school analysis while maintaining scalability and user experience.

