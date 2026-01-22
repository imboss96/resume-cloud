# 🚀 Quick Start Guide

## First Time Setup

### Step 1: Install Dependencies
```bash
cd "c:\Users\SEAL TEAM\Documents\adeveloper\CV EZRA\cv"
npm install
```

**This will take 2-3 minutes** - It downloads React, Express, and all required libraries.

### Step 2: Start Backend (Terminal 1)
```bash
node server.js
```

You should see:
```
CV Backend Server running on http://localhost:5000
```

### Step 3: Start Frontend (Terminal 2)
```bash
npm start
```

Your browser will automatically open at `http://localhost:3000`

## ✅ You're Done!

You now have:
- **CV Viewer** - View your professional CV
- **Dashboard** - Edit all CV information
- **Analytics** - Track who views your CV

## 📱 Main Features

| Feature | Link | Description |
|---------|------|-------------|
| View CV | `http://localhost:3000/` | Professional CV display with print/download |
| Edit CV | `http://localhost:3000/admin` | Dashboard to edit all CV sections |
| Analytics | `http://localhost:3000/analytics` | Track views by country, IP, network |

## 🖨️ Print & Download

1. **Print to PDF** - Click "🖨️ Print" button, select "Save as PDF"
2. **Download PDF** - Click "📥 Download PDF" button

## ✏️ Edit Your CV

1. Click "⚙️ Edit CV" or go to `/admin`
2. Choose a tab (Personal, Skills, Education, etc.)
3. Make changes
4. Click "💾 Save Changes"

## 📊 View Analytics

1. Go to `http://localhost:3000/analytics`
2. See total views, unique visitors, country/network breakdown
3. Click "📥 Export CSV" to download data

## 🛑 Stop Servers

Press `Ctrl+C` in both terminals to stop the servers.

## 🔧 Common Issues

**Port in use?**
```bash
# Change port for React (default 3000)
set PORT=3001 && npm start

# Change port for Backend (default 5000)
set PORT=5001 && node server.js
```

**npm not found?**
- Install Node.js from https://nodejs.org/

**CORS errors?**
- Make sure backend is running on port 5000

## 📚 Full Documentation

See `SETUP.md` for detailed documentation and troubleshooting.
