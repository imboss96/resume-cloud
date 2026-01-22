# Firebase Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React Frontend (Port 3000)                                │ │
│  │  - CV Display Component                                    │ │
│  │  - Admin Dashboard                                         │ │
│  │  - Edit Forms                                              │ │
│  └────────────┬─────────────────────────────────────────────┘ │
│               │ HTTP/AJAX                                      │
└───────────────┼───────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER (Backend)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Express Server (Port 5000)                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  HTTP Endpoints                                         │   │
│  │  ├─ GET    /api/cv              (fetch CV data)        │   │
│  │  ├─ PUT    /api/cv              (update CV data)       │   │
│  │  ├─ GET    /api/views           (get analytics)        │   │
│  │  ├─ POST   /api/views/track     (log CV views)        │   │
│  │  ├─ POST   /api/admin/authenticate (login)            │   │
│  │  └─ GET    /api/health          (health check)         │   │
│  └─────────┬───────────────────────────────────────────────┘   │
│            │                                                    │
│  ┌─────────▼───────────────────────────────────────────────┐   │
│  │  Middleware & Processing                                │   │
│  │  ├─ CORS Configuration                                  │   │
│  │  ├─ JSON Parsing                                        │   │
│  │  ├─ Admin Authentication (SEAL_TEAM_2026)             │   │
│  │  ├─ Firebase Detection                                  │   │
│  │  └─ Error Handling                                      │   │
│  └─────────┬───────────────────────────────────────────────┘   │
│            │                                                    │
│  ┌─────────▼───────────────────────────────────────────────┐   │
│  │  Storage Router Decision Logic                          │   │
│  │                                                         │   │
│  │  if (firebase-service-account.json exists) {           │   │
│  │    USE_FIREBASE = true                                 │   │
│  │  } else {                                               │   │
│  │    USE_FIREBASE = false (local files)                  │   │
│  │  }                                                       │   │
│  └────────┬───────────────────────┬──────────────────────┘   │
│           │                       │                          │
└───────────┼───────────────────────┼───────────────────────────┘
            │                       │
            │ Firebase             │ Local Files
            │ Available            │ Fallback
            │                       │
     ┌──────▼──────┐         ┌──────▼──────┐
     │   FIREBASE  │         │   LOCAL     │
     │   LAYER     │         │   LAYER     │
     └──────┬──────┘         └──────┬──────┘
            │                       │
            ▼                       ▼
     ┌──────────────────┐   ┌──────────────────┐
     │  Firebase Admin  │   │   Node.js fs     │
     │  SDK             │   │   Module         │
     └──────┬───────────┘   └──────┬───────────┘
            │                      │
            ▼                      ▼
     ┌──────────────────┐   ┌──────────────────┐
     │   Google Cloud   │   │ Local File System │
     │   Realtime DB    │   │ /data/           │
     │                  │   │ ├─ cv-data.json  │
     │ /cvData          │   │ └─ views.json    │
     │ /views           │   └──────────────────┘
     └──────────────────┘
```

## Data Flow Diagram

### Read CV Data (GET /api/cv)

```
Frontend                Backend              Storage
┌──────┐               ┌──────┐             ┌──────┐
│ GET  │──request──→  │Check │──→ Firebase │      │
│/api/ │               │Firebase│  ↓        │      │
│cv   │──response──←  │Available│           │      │
└──────┘               │       │            │      │
                       │  NO ↓ │            │      │
                       │       │──→ Local   │      │
                       │       │   Files   │      │
                       └───────┘           └──────┘
```

### Update CV Data (PUT /api/cv)

```
Frontend              Backend                 Storage
┌──────┐            ┌──────────┐           ┌──────┐
│ PUT  │─request─→ │Check Auth│           │      │
│/api/ │  with     │password   │           │      │
│cv   │  password  │(SEAL_...)│           │      │
│     │            │    ↓     │           │      │
│     │            │Validate  │──→ Firebase│      │
│     │            │Data      │           │      │
│     │            │    ↓     │           │      │
│     │            │Save to   │──→ Local   │      │
│     │  response←─│Storage   │   Files   │      │
└──────┘            └──────────┘           └──────┘
```

### View Tracking (POST /api/views/track)

```
Frontend              Backend              Storage
┌──────┐            ┌──────────┐        ┌──────┐
│ POST │─request─→ │Get IP/   │        │      │
│/api/ │            │Location  │        │      │
│views/│            │Info      │        │      │
│track │            │    ↓     │        │      │
│     │            │Get Time  │──→Firebase│      │
│     │            │Stamp     │        │      │
│     │            │    ↓     │        │      │
│     │            │Add to    │──→Local │      │
│     │response←─ │Views     │   Files │      │
└──────┘            │Array    │        │      │
                    │Keep Last│        │      │
                    │10000    │        │      │
                    └──────────┘        └──────┘
```

## Storage Mode Decision Tree

```
                    START
                      │
                      ▼
          Does firebase-admin exist?
                    │
        ┌───────────┼───────────┐
        │ YES       │ NO        │
        ▼           ▼
    Try to load  USE_FIREBASE
    credentials  = false
        │           │
        ├─YES→ Load JSON file
        │      Initialize Firebase
        │      Set USE_FIREBASE = true
        │      Log: ✅ Firebase initialized
        │
        └─NO→ Log warning
             Continue with
             local files

           Every Request
              │
              ▼
        if (USE_FIREBASE) {
          Use Firebase DB
        } else {
          Use Local Files
        }
```

## Authentication Flow

```
┌────────────────┐
│ Frontend Login │
│ Modal Opens    │
└────────┬───────┘
         │
         ▼
┌────────────────────────┐
│ User Enters Password   │
│ (SEAL_TEAM_2026)       │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────────┐
│ POST /api/admin/authenticate
│ with password             │
└────────┬───────────────────┘
         │
         ▼
┌─────────────────┐
│ Backend Validates
│ Password        │
└────┬────────┬───┘
     │        │
  VALID    INVALID
     │        │
     ▼        ▼
  ✅ Stored ❌ Error
  in Memory Message
     │        │
     ▼        ▼
┌─────────┐ ┌────────┐
│Updates  │ │Retry   │
│Sent with│ │Auth    │
│x-admin- │ │        │
│password │ │        │
│header   │ │        │
└─────────┘ └────────┘

Protected Route Validation:
GET x-admin-password header
  │
  ▼
Compare to ADMIN_PASSWORD
  │
  ├─ Matches → Allow request
  │
  └─ No match → 401 Unauthorized
```

## Firebase vs Local Storage Comparison

```
┌──────────────────┬─────────────────────┬──────────────────┐
│ Feature          │ Firebase            │ Local Storage    │
├──────────────────┼─────────────────────┼──────────────────┤
│ Setup Time       │ 2-5 minutes         │ 0 minutes        │
│ Initial Cost     │ Free (with limits)  │ Free             │
│ Data Persistence │ Google Cloud        │ Local disk       │
│ Scalability      │ Unlimited           │ Single server    │
│ Real-time Sync   │ Yes (websockets)    │ No               │
│ Backup           │ Automatic           │ Manual           │
│ Access Remote    │ Yes (URL)           │ No (local only)  │
│ Complexity       │ Higher              │ Simple           │
│ Monitoring       │ Built-in dashboard  │ File checking    │
│ Security Rules   │ Configurable        │ File permissions │
└──────────────────┴─────────────────────┴──────────────────┘
```

## Deployment Architecture

### Development:
```
Laptop
├─ localhost:3000 (React)
├─ localhost:5000 (Backend)
└─ /data/cv-data.json (Local)
```

### Production with Firebase:
```
┌────────────────────────────┐
│    Your Domain             │
│ (e.g., yoursite.com)       │
├────────────────────────────┤
│                            │
│ ┌──────────────────────┐   │
│ │ Frontend (Static)    │   │
│ │ Hosted on Vercel/    │   │
│ │ Netlify/GitHub Pages │   │
│ └──────────────────────┘   │
│                            │
│ ┌──────────────────────┐   │
│ │ Backend (Node)       │   │
│ │ Hosted on Heroku/    │   │
│ │ Railway/Render       │   │
│ └──────────────────────┘   │
│          ↓                 │
│    ┌─────────────────┐     │
│    │ Firebase Cloud  │     │
│    │ Realtime DB     │     │
│    └─────────────────┘     │
└────────────────────────────┘
```

## Error Handling Flow

```
Request Comes In
      │
      ▼
Check CORS
      │
      ├─ Fail → 403 Forbidden
      │
      ▼
Check Content-Type
      │
      ├─ Fail → 400 Bad Request
      │
      ▼
For Protected Routes:
Check Admin Password
      │
      ├─ Fail → 401 Unauthorized
      │
      ▼
Try to Access Storage
      │
      ├─ Firebase → 
      │   ├─ Network error → 500
      │   ├─ Permission denied → 403
      │   └─ Success → 200
      │
      └─ Local Files →
          ├─ File not found → 404
          ├─ Read error → 500
          └─ Success → 200
```

This architecture ensures your CV data is:
- ✅ Always accessible (local or cloud)
- ✅ Properly authenticated
- ✅ Well-documented
- ✅ Production-ready
- ✅ Scalable when needed
