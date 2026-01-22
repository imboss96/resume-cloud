# CV Dashboard - Setup & Installation Guide

## 📋 Overview

This is a professional CV Dashboard application built with **React** and **Express**. It includes:
- 📄 **CV Display** - Professional CV with print/download functionality
- 📊 **Dashboard** - Edit all CV information in real-time
- 📈 **Analytics** - Track CV views by IP, country, and network
- ✨ **A4 Page Breaks** - Automatic formatting for printing

## 🛠️ Requirements

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

## ⚙️ Installation

### 1. Install Dependencies

Navigate to the project directory and install dependencies:

```bash
cd "c:\Users\SEAL TEAM\Documents\adeveloper\CV EZRA\cv"
npm install
```

This will install:
- `react` & `react-dom` - UI framework
- `react-router-dom` - Routing
- `axios` - HTTP client
- `express` & `cors` - Backend server
- `html2pdf.js` - PDF export

## 🚀 Running the Application

### 2a. Start Backend Server (Terminal 1)

```bash
node server.js
```

You should see:
```
CV Backend Server running on http://localhost:5000
```

### 2b. Start React Frontend (Terminal 2)

```bash
npm start
```

The app will open automatically at `http://localhost:3000`

## 📱 Using the Application

### Main Routes

1. **View CV** - `http://localhost:3000/`
   - View professional CV display
   - Print button (Ctrl+P)
   - Download PDF button
   - Edit CV link

2. **Edit Dashboard** - `http://localhost:3000/admin`
   - Edit personal information
   - Manage skills, education, experience
   - Add/remove projects
   - Update extracurricular activities

3. **Analytics** - `http://localhost:3000/analytics`
   - View total views and unique visitors
   - See views by country and network
   - Download analytics as CSV
   - View recent visitor details

## 📝 Editing CV Information

1. Click **⚙️ Edit CV** button from the CV view
2. Use tabs to navigate sections:
   - Personal Info
   - Skills
   - Education
   - Experience
   - Projects
   - Extracurriculars
3. Make changes to the fields
4. Click **💾 Save Changes**
5. Click **👁️ View CV** to preview changes

## 🖨️ Printing & Downloading

### Print to PDF (Browser)
1. Click **🖨️ Print** button
2. Select "Save as PDF" as printer
3. Adjust settings (margins, pages, etc.)
4. Click Print

### Download PDF (Direct)
1. Click **📥 Download PDF** button
2. File will be saved as `DIOGO_TORRES_CORREIA_CV.pdf`

**Note:** For best results, use Print method with "A4" paper size

## 📊 View Analytics

The analytics page tracks:
- **Total Views** - Number of times CV was viewed
- **Unique Visitors** - Number of different IP addresses
- **Country Distribution** - Views from each country
- **Network Distribution** - Views by ISP/Network
- **Recent Views** - Detailed list of last 50 views with timestamps

### Export Data
Click **📥 Export CSV** to download all view data as a spreadsheet

## 📂 Project Structure

```
cv/
├── public/
│   └── index.html           # HTML template
├── src/
│   ├── components/
│   │   └── CV/
│   │       ├── CVDisplay.js # CV component
│   │       └── CVDisplay.css
│   ├── pages/
│   │   ├── CVView.js        # CV page
│   │   ├── AdminDashboard.js # Edit dashboard
│   │   ├── Analytics.js      # Analytics page
│   │   └── *.css            # Styles
│   ├── services/
│   │   └── api.js           # API calls
│   ├── data/
│   │   └── defaultCVData.js # CV template data
│   ├── App.js               # Main app
│   └── index.js             # Entry point
├── server.js                # Express backend
├── package.json            # Dependencies
└── README.md              # This file
```

## 🔧 API Endpoints

All endpoints require the backend server running at `http://localhost:5000`

### CV Data
- `GET /api/cv` - Get current CV data
- `PUT /api/cv` - Update CV data (body: CV object)

### View Tracking
- `POST /api/views/track` - Log a CV view (automatically called)
- `GET /api/views` - Get all tracked views

### Health
- `GET /api/health` - Server health check

## 💾 Data Storage

CV data and view logs are stored in:
```
cv/data/
├── cv-data.json    # CV information
└── views.json      # View analytics
```

These files are created automatically on first run.

## 🌐 Deployment

### Vercel (Recommended for Frontend)
1. Push code to GitHub
2. Connect to Vercel
3. Deploy

### Heroku (For Backend)
1. Create Heroku app
2. Deploy server.js
3. Update API_BASE_URL in api.js to your Heroku URL

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 or 5000 is already in use:
```bash
# For port 3000 (React)
set PORT=3001 && npm start

# For port 5000 (Backend)
set PORT=5001 && node server.js
```

### CORS Errors
Make sure backend server is running on localhost:5000

### PDF Download Not Working
Use Print method instead (Print → Save as PDF)

### No Location Data
IP location API may take a moment. Try again after a few seconds.

## 📞 Support

For issues or questions:
1. Check that both servers are running
2. Verify Node.js and npm installation
3. Clear browser cache and refresh
4. Check browser console for errors (F12)

## 📄 License

This project is provided as-is for personal use.
