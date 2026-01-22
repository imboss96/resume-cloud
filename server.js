const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Firebase setup
let admin;
let db;
let USE_FIREBASE = false;

// Try to initialize Firebase
try {
  admin = require('firebase-admin');
  const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
  
  // Check if service account file exists
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://your-project-id.firebaseio.com'
    });
    db = admin.database();
    USE_FIREBASE = true;
    console.log('✅ Firebase initialized successfully');
  } else {
    console.log('⚠️  Firebase service account not found. Using local file storage.');
    console.log('   To enable Firebase, place firebase-service-account.json in the cv directory');
  }
} catch (error) {
  console.log('⚠️  Firebase not available. Using local file storage.');
  console.log('   Error:', error.message);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Admin authentication
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SEAL_TEAM_2026';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-password']
}));
app.use(express.json());

// Authentication middleware
const authenticateAdmin = (req, res, next) => {
  const password = req.headers['x-admin-password'] || req.body?.adminPassword;
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized. Invalid admin password.' });
  }
  next();
};

// Database file paths (fallback for local storage)
const dbPath = path.join(__dirname, 'data', 'cv-data.json');
const viewsPath = path.join(__dirname, 'data', 'views.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initialize data files (for local storage fallback)
const initializeDataFiles = () => {
  if (!fs.existsSync(dbPath)) {
    const defaultData = {
      personalInfo: {
        name: 'DIOGO TORRES CORREIA',
        title: 'Programming Enthusiast. Computer Science & Cybersecurity Student. Federated Athlete.',
      },
      contact: {
        email: 'me@diogotc.com',
        location: 'Stockholm, Sweden',
        website: 'diogotc.com',
        github: '@diogotcorreia',
        linkedin: '@diogotcorreia'
      },
      skills: {},
      education: [],
      experience: [],
      projects: [],
      extracurriculars: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
  }

  if (!fs.existsSync(viewsPath)) {
    fs.writeFileSync(viewsPath, JSON.stringify({ views: [] }, null, 2));
  }
};

if (!USE_FIREBASE) {
  initializeDataFiles();
}

// Helper function to get location info from IP
const getLocationInfo = async (ip) => {
  try {
    // Using ip-api.com (free tier)
    const response = await axios.get(`http://ip-api.com/json/${ip}?fields=country,isp`, {
      timeout: 5000
    });
    if (response.data.status === 'success') {
      return {
        country: response.data.country,
        network: response.data.isp
      };
    }
  } catch (error) {
    console.log('Could not fetch location info for IP:', ip);
  }
  return { country: null, network: null };
};

// Get client IP
const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         'unknown';
};

// Routes

// Track CV view
app.post('/api/views/track', async (req, res) => {
  try {
    const ip = getClientIp(req);
    const locationInfo = await getLocationInfo(ip);
    
    const viewData = {
      ip,
      country: locationInfo.country,
      network: locationInfo.network,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent']
    };

    if (USE_FIREBASE) {
      // Firebase storage
      try {
        const viewsRef = db.ref('views');
        const snapshot = await viewsRef.once('value');
        const data = snapshot.val() || { views: [] };
        
        data.views.push(viewData);
        
        // Keep only last 10000 views
        if (data.views.length > 10000) {
          data.views = data.views.slice(-10000);
        }
        
        await viewsRef.set(data);
        res.json({ success: true, view: viewData });
      } catch (error) {
        console.error('Firebase error tracking view:', error);
        res.status(500).json({ error: 'Error tracking view' });
      }
    } else {
      // Local file storage fallback
      let data = { views: [] };
      if (fs.existsSync(viewsPath)) {
        const fileContent = fs.readFileSync(viewsPath, 'utf8');
        data = JSON.parse(fileContent);
      }

      data.views.push(viewData);

      if (data.views.length > 10000) {
        data.views = data.views.slice(-10000);
      }

      fs.writeFileSync(viewsPath, JSON.stringify(data, null, 2));
      res.json({ success: true, view: viewData });
    }
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ error: 'Error tracking view' });
  }
});

// Get all views
app.get('/api/views', async (req, res) => {
  try {
    if (USE_FIREBASE) {
      // Firebase storage
      try {
        const snapshot = await db.ref('views').once('value');
        const data = snapshot.val() || { views: [] };
        res.json(data);
      } catch (error) {
        console.error('Firebase error reading views:', error);
        res.status(500).json({ error: 'Error reading views' });
      }
    } else {
      // Local file storage fallback
      if (fs.existsSync(viewsPath)) {
        const data = JSON.parse(fs.readFileSync(viewsPath, 'utf8'));
        res.json(data);
      } else {
        res.json({ views: [] });
      }
    }
  } catch (error) {
    console.error('Error reading views:', error);
    res.status(500).json({ error: 'Error reading views' });
  }
});

// Get CV data
app.get('/api/cv', async (req, res) => {
  try {
    if (USE_FIREBASE) {
      // Firebase storage
      try {
        const snapshot = await db.ref('cvData').once('value');
        const data = snapshot.val();
        
        if (data) {
          res.json(data);
        } else {
          res.json({ 
            personalInfo: {
              name: 'DIOGO TORRES CORREIA',
              title: 'Programming Enthusiast. Computer Science & Cybersecurity Student. Federated Athlete.',
            },
            contact: {
              email: 'me@diogotc.com',
              location: 'Stockholm, Sweden',
              website: 'diogotc.com',
              github: '@diogotcorreia',
              linkedin: '@diogotcorreia'
            },
            skills: {},
            education: [],
            experience: [],
            projects: [],
            extracurriculars: []
          });
        }
      } catch (error) {
        console.error('Firebase error reading CV data:', error);
        res.status(500).json({ error: 'Error reading CV data' });
      }
    } else {
      // Local file storage fallback
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      res.json(data);
    }
  } catch (error) {
    console.error('Error reading CV data:', error);
    res.status(500).json({ error: 'Error reading CV data' });
  }
});

// Update CV data (Protected route)
app.put('/api/cv', authenticateAdmin, async (req, res) => {
  try {
    const cvData = req.body;
    
    // Remove adminPassword from stored data if present
    delete cvData.adminPassword;
    
    // Validate basic structure
    if (!cvData.personalInfo || !cvData.contact) {
      return res.status(400).json({ error: 'Invalid CV data structure' });
    }

    if (USE_FIREBASE) {
      // Firebase storage
      try {
        await db.ref('cvData').set(cvData);
        res.json({ success: true, message: 'CV data updated successfully' });
      } catch (error) {
        console.error('Firebase error updating CV data:', error);
        res.status(500).json({ error: 'Error updating CV data' });
      }
    } else {
      // Local file storage fallback
      fs.writeFileSync(dbPath, JSON.stringify(cvData, null, 2));
      res.json({ success: true, message: 'CV data updated successfully' });
    }
  } catch (error) {
    console.error('Error updating CV data:', error);
    res.status(500).json({ error: 'Error updating CV data' });
  }
});

// Admin authentication endpoint
app.post('/api/admin/authenticate', (req, res) => {
  console.log('Authentication attempt received');
  const password = req.body.password;
  console.log('Password received:', password ? 'YES' : 'NO');
  console.log('Password matches:', password === ADMIN_PASSWORD);
  
  if (!password || password !== ADMIN_PASSWORD) {
    console.log('Authentication failed - invalid password');
    return res.status(401).json({ error: 'Invalid password' });
  }
  
  console.log('Authentication successful');
  res.json({ success: true, message: 'Authenticated' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 CV Backend Server running on http://localhost:${PORT}`);
  console.log(`📦 Storage Mode: ${USE_FIREBASE ? 'Firebase Realtime Database' : 'Local File Storage'}`);
  console.log('\n📋 API endpoints:');
  console.log('  POST   /api/views/track - Track a CV view');
  console.log('  GET    /api/views      - Get all views');
  console.log('  GET    /api/cv         - Get CV data');
  console.log('  PUT    /api/cv         - Update CV data (requires admin password)');
  console.log('  GET    /api/health     - Health check\n');
});
