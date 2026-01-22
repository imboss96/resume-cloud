# Firebase Setup Guide

This guide will help you set up Google Firebase for your CV storage backend. The server is already configured to use Firebase if credentials are available, otherwise it falls back to local file storage.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project"
3. Enter your project name (e.g., "CV Dashboard")
4. Accept the terms and click "Create project"
5. Wait for the project to be created

## Step 2: Enable Realtime Database

1. In the Firebase Console, go to your project
2. On the left sidebar, click "Build" → "Realtime Database"
3. Click "Create Database"
4. Choose your location (closest to you or your users)
5. Select "Start in test mode" (we'll configure security later)
6. Click "Enable"

## Step 3: Create a Service Account

1. In Firebase Console, go to "Project Settings" (⚙️ icon, top right)
2. Click on the "Service Accounts" tab
3. Click "Generate New Private Key"
4. A JSON file will download automatically
5. **Keep this file secure** - it contains your database credentials

## Step 4: Add Credentials to Your Project

1. Copy the downloaded JSON file
2. Paste it in the `/cv` folder
3. Rename it to `firebase-service-account.json`

**Directory structure should look like:**
```
cv/
├── server.js
├── firebase-service-account.json  ← Place it here
├── package.json
├── public/
├── src/
└── data/
```

## Step 5: Install Firebase Admin SDK

In the `/cv` directory, run:

```bash
npm install firebase-admin
```

## Step 6: Set Environment Variables (Optional)

You can also set environment variables instead of the JSON file. In your `.env` file or system environment:

```env
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
FIREBASE_CREDENTIALS={"type":"service_account","project_id":"..."}
```

The server will check for:
1. `firebase-service-account.json` file first
2. `FIREBASE_DATABASE_URL` and `FIREBASE_CREDENTIALS` environment variables
3. Falls back to local file storage if neither is available

## Step 7: Configure Realtime Database Rules

For **testing/development**, the database uses "Test Mode" which allows read/write for 30 days.

For **production**, update your security rules:

1. Go to Firebase Console → Realtime Database
2. Click on "Rules" tab
3. Replace the rules with:

```json
{
  "rules": {
    "cvData": {
      ".read": true,
      ".write": false
    },
    "views": {
      ".read": true,
      ".write": true
    }
  }
}
```

This allows:
- Anyone to read CV data (public profile)
- Anyone can log views (analytics)
- Only authenticated requests can update CV data (via admin password on backend)

## Step 8: Start Your Server

```bash
npm start
```

or with nodemon:

```bash
npm install --save-dev nodemon
npx nodemon server.js
```

You should see in the console:
```
✅ Firebase initialized successfully
🚀 CV Backend Server running on http://localhost:5000
📦 Storage Mode: Firebase Realtime Database
```

## Step 9: Verify Firebase Connection

1. Start your frontend: `npm start` (in another terminal)
2. Go to http://localhost:3000
3. Edit your CV data (requires SEAL_TEAM_2026 password)
4. Check [Firebase Console → Realtime Database](https://console.firebase.google.com) to see your data stored under `/cvData`

## Troubleshooting

### "Firebase service account not found"
- Make sure `firebase-service-account.json` is in the `/cv` directory
- Check the filename is exactly correct

### "Firebase not available. Using local file storage."
- Firebase Admin SDK is not installed. Run: `npm install firebase-admin`
- Service account credentials are not available

### "Error: The caller does not have permission"
- Database rules don't allow this operation
- Check your Realtime Database rules in Firebase Console

### Data not persisting
- Check server console for errors
- Verify Firebase project URL in console output
- Test manually: `curl http://localhost:5000/api/cv`

## Data Structure

Your CV data is stored in Firebase under `/cvData`:

```
cvData/
├── personalInfo: {name, title, email, ...}
├── contact: {email, location, website, ...}
├── skills: {programming: [...], tools: [...], ...}
├── education: [...]
├── experience: [...]
├── projects: [...]
├── extracurriculars: [...]
└── styling: {name: {...}, sectionTitle: {...}, ...}
```

View analytics are stored under `/views`:

```
views/
└── views: [
      {ip, country, network, timestamp, userAgent},
      ...
    ]
```

## Migrating Existing Data

If you already have data in local files (`/data/cv-data.json`):

1. Start the server with Firebase configured
2. Make an edit to any field in the admin dashboard
3. Your data will be uploaded to Firebase
4. The local file remains as a backup

## Security Notes

⚠️ **Important for Production:**
- Never commit `firebase-service-account.json` to version control
- Add to `.gitignore`:
  ```
  firebase-service-account.json
  .env
  ```
- Use environment variables instead of files for deployed servers
- Implement proper authentication rules
- Restrict database access to your admin password

## Next Steps

1. Set up automatic backups in Firebase Console
2. Enable Firebase Authentication for future user features
3. Add Cloud Functions for advanced operations
4. Set up monitoring and alerts

For more info, visit [Firebase Documentation](https://firebase.google.com/docs/database)
