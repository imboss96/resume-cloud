# CV Dashboard Application

A modern React-based CV website with an interactive dashboard for editing CV content, print/download functionality, and view analytics.

## Features

- **Professional CV Display** - Responsive design matching modern CV standards
- **Print & Download** - Print to PDF and download CV directly
- **A4 Page Breaks** - Automatic page breaks for proper formatting
- **Dashboard Editor** - Manage all CV information (name, education, experience, etc.)
- **View Analytics** - Track CV views by IP address, network, and country
- **Responsive Design** - Works on desktop and mobile devices

## Getting Started

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
  components/
    CV/              - CV display component
    Dashboard/       - Admin dashboard
    Analytics/       - View tracking analytics
  pages/
    CVView.js        - Public CV page
    AdminDashboard.js - Admin panel
  services/
    api.js           - API calls
    tracking.js      - View tracking
  App.js             - Main app
  index.js           - Entry point
```

## Features Details

### CV Display
- Matches professional CV design from image
- A4 page breaks automatically handled
- Print and download buttons
- Responsive layout

### Dashboard
- Edit name, contact, skills, education, experience, projects
- Real-time preview
- Save changes

### Analytics
- Track viewer IP address
- Show viewer location (country/network)
- View count and timestamps
- Export analytics data
