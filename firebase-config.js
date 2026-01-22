// Firebase Admin SDK Configuration
// This file initializes Firebase Admin SDK for Node.js backend

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Make sure to set the FIREBASE_CREDENTIALS environment variable or create a service account JSON file
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      // Try to get credentials from environment variable or file
      let serviceAccount;
      
      // Try environment variable first
      if (process.env.FIREBASE_CREDENTIALS) {
        try {
          serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
        } catch (e) {
          console.error('Error parsing FIREBASE_CREDENTIALS environment variable:', e);
        }
      }
      
      // If no env var, try to load from file (default location)
      if (!serviceAccount) {
        try {
          serviceAccount = require('./firebase-service-account.json');
        } catch (e) {
          console.warn('Firebase service account file not found. Using default initialization.');
          // Initialize without credentials for local development
          admin.initializeApp({
            databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://your-project.firebaseio.com'
          });
          return admin;
        }
      }
      
      // Initialize with service account
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || serviceAccount.database_url
      });
    }
    
    console.log('Firebase Admin SDK initialized successfully');
    return admin;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

const db = initializeFirebase().database();
const auth = initializeFirebase().auth();

module.exports = {
  admin,
  db,
  auth,
  initializeFirebase
};
