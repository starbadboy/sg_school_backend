# Singapore Primary School Analysis Web App - UI Design

## Design Principles
- **Clean and Modern**: Minimalist design with focus on data clarity
- **Mobile-First**: Responsive design that works on all devices
- **Data-Driven**: Emphasis on charts, maps, and visual information
- **User-Friendly**: Intuitive navigation and clear call-to-actions

## Color Scheme
- **Primary**: #2563EB (Blue) - Trust and reliability
- **Secondary**: #10B981 (Green) - Success and positive outcomes
- **Accent**: #F59E0B (Amber) - Attention and highlights
- **Neutral**: #6B7280 (Gray) - Text and backgrounds
- **Background**: #F9FAFB (Light Gray) - Clean backdrop

## Typography
- **Headings**: Inter Bold (Modern, clean sans-serif)
- **Body Text**: Inter Regular (Readable and professional)
- **Data/Numbers**: JetBrains Mono (Monospace for data clarity)

## Layout Structure

### 1. Header Navigation
- Logo: "SG School Finder"
- Navigation: Home | Search | Compare | Strategy | About
- User location indicator (if set)

### 2. Landing Page
- **Hero Section**:
  - Large heading: "Find the Perfect Primary School in Singapore"
  - Subtitle: "Analyze P1 data, get AI-powered strategies, and make informed decisions"
  - Location input field with search button
  - Background: Subtle Singapore skyline illustration

- **Feature Cards**:
  - Location-Based Search
  - P1 Data Analysis
  - AI Strategy Recommendations
  - School Comparison

### 3. Search Results Page
- **Left Sidebar** (30%):
  - Search filters (Distance, School type, Programs)
  - Map view toggle
  - Sort options (Distance, Popularity, Success rate)

- **Main Content** (70%):
  - School cards with:
    - School name and type
    - Distance from user location
    - P1 success rate indicator
    - Quick stats (Total places, Last year ballot)
    - "View Details" and "Add to Compare" buttons

### 4. School Details Modal/Page
- **Header**: School name, type, and key metrics
- **Tabs**:
  - Overview (Basic info, contact, programs)
  - P1 Data (Historical trends, phase-wise analysis)
  - Location (Map, nearby amenities)
  - Strategy (AI recommendations for this school)

### 5. Data Visualization Dashboard
- **Charts Section**:
  - Line chart: P1 ballot trends over years
  - Bar chart: Success rates by phase
  - Pie chart: School type distribution in area
  - Heatmap: Competitiveness by distance

- **Interactive Filters**:
  - Year range slider
  - Phase selection (1, 2A, 2B, 2C, 2C(S))
  - School type checkboxes

### 6. AI Strategy Page
- **Input Form**:
  - Target schools selection
  - Family situation (Siblings, Alumni, Volunteer)
  - Preferences (Distance priority, School type)
  - Timeline (When planning to apply)

- **Strategy Output**:
  - Personalized recommendations
  - Action timeline
  - Success probability estimates
  - Alternative suggestions

### 7. School Comparison Tool
- **Comparison Table**:
  - Side-by-side school information
  - Visual indicators (Green/Red for good/poor metrics)
  - Expandable sections for detailed data

## Component Design Specifications

### School Card Component
```
┌─────────────────────────────────────┐
│ [School Badge] School Name          │
│ Government • 1.2km away             │
│                                     │
│ P1 Success Rate: 85% ████████░░     │
│ Total Places: 210 | Balloted: Yes   │
│                                     │
│ [View Details] [Add to Compare]     │
└─────────────────────────────────────┘
```

### Data Chart Component
```
┌─────────────────────────────────────┐
│ P1 Ballot Trends (2020-2024)       │
│                                     │
│ 100% ┌─────────────────────────────┐│
│  80% │     ╭─╮                     ││
│  60% │   ╭─╯ ╰─╮                   ││
│  40% │ ╭─╯     ╰─╮                 ││
│  20% │╱         ╰─╮               ││
│   0% └─────────────────────────────┘│
│      2020 2021 2022 2023 2024      │
└─────────────────────────────────────┘
```

### Map Component
```
┌─────────────────────────────────────┐
│ [Zoom +] [Zoom -] [My Location]     │
│                                     │
│    🏫     🏫                        │
│         📍 (User)                   │
│  🏫              🏫                 │
│                                     │
│ Legend: 🏫 Schools 📍 Your Location │
└─────────────────────────────────────┘
```

## Interactive Elements

### Hover States
- School cards: Subtle shadow and scale effect
- Buttons: Color transition and slight elevation
- Chart elements: Highlight data points and show tooltips

### Loading States
- Skeleton screens for data loading
- Progress indicators for API calls
- Smooth transitions between states

### Mobile Adaptations
- Collapsible sidebar becomes bottom sheet
- Touch-friendly button sizes (44px minimum)
- Swipeable chart navigation
- Simplified navigation with hamburger menu

## Accessibility Features
- High contrast color ratios (WCAG AA compliant)
- Keyboard navigation support
- Screen reader friendly labels
- Alternative text for all images and charts
- Focus indicators for interactive elements

This design creates a professional, data-rich interface that helps parents make informed decisions about primary school selection in Singapore.

