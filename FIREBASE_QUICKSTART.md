# Firebase Integration - Quick Start

## What Changed?

Your backend (`server.js`) is now configured to automatically use Firebase Realtime Database when credentials are available. If Firebase isn't set up, it falls back to local file storage - no code changes needed!

## Quick Setup (3 Steps)

### 1. Get Firebase Credentials

1. Go to https://console.firebase.google.com/
2. Create a new project (any name)
3. Go to "Build" → "Realtime Database" → "Create Database"
4. Choose your location and select "Start in test mode"
5. Go to Project Settings → Service Accounts → "Generate New Private Key"
6. Save the downloaded JSON file

### 2. Add Credentials to Your Project

Copy the JSON file to your `/cv` folder and rename it to:
```
firebase-service-account.json
```

**Full path:** `c:\Users\SEAL TEAM\Documents\adeveloper\CV EZRA\cv\firebase-service-account.json`

### 3. Start Your Server

```bash
cd "c:\Users\SEAL TEAM\Documents\adeveloper\CV EZRA\cv"
npm install firebase-admin
npm start
```

You should see:
```
✅ Firebase initialized successfully
🚀 CV Backend Server running on http://localhost:5000
📦 Storage Mode: Firebase Realtime Database
```

## Testing Firebase

1. Start your frontend: `npm start` in another terminal
2. Edit your CV data (password: SEAL_TEAM_2026)
3. Check Firebase Console to see your data saved under `/cvData`

## How It Works

- **Without Firebase:** Uses local JSON files (`/data/cv-data.json`)
- **With Firebase:** Uses Google Firebase Realtime Database (cloud storage)
- **Automatic fallback:** If Firebase credentials aren't found, it uses local files automatically

## Data Locations

**Local storage:** `/data/cv-data.json` and `/data/views.json`

**Firebase storage:**
- CV data: `https://your-project-id.firebaseio.com/cvData`
- Views: `https://your-project-id.firebaseio.com/views`

## Security

⚠️ **Important:**
- Never commit `firebase-service-account.json` to git (it's already in .gitignore)
- Use `.env` files for production
- Your admin password (SEAL_TEAM_2026) is still required to edit data

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Firebase not available" | Ensure `firebase-service-account.json` is in `/cv` folder |
| Data not saving | Check server console for errors |
| "Permission denied" | Firebase database is in test mode (expires in 30 days). Update security rules. |
| Want to disable Firebase? | Just remove `firebase-service-account.json` and it'll use local files |

## Full Documentation

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed setup instructions.
