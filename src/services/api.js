import { db } from '../config/firebase';
import { collection, doc, getDoc, setDoc, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { defaultCVData } from '../data/defaultCVData';

// Store admin password in session
let adminPassword = null;

export const setAdminPassword = (password) => {
  adminPassword = password;
};

export const clearAdminPassword = () => {
  adminPassword = null;
};

export const isAuthenticated = () => {
  return adminPassword !== null;
};

// Track view in Firestore
export const trackView = async () => {
  try {
    const viewData = {
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    const viewsCollection = collection(db, 'views');
    await addDoc(viewsCollection, viewData);
    return viewData;
  } catch (error) {
    console.error('Error tracking view:', error);
  }
};

// Get all views from Firestore
export const getViews = async () => {
  try {
    const viewsCollection = collection(db, 'views');
    const snapshot = await getDocs(viewsCollection);
    
    const viewsArray = [];
    snapshot.forEach(doc => {
      viewsArray.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { views: viewsArray };
  } catch (error) {
    console.error('Error fetching views:', error);
    return { views: [] };
  }
};

// Get CV data from Firestore
export const getCVData = async () => {
  try {
    const cvDocRef = doc(db, 'cvData', 'cv');
    const snapshot = await getDoc(cvDocRef);
    
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return defaultCVData;
  } catch (error) {
    console.error('Error fetching CV data:', error);
    return defaultCVData;
  }
};

// Authenticate admin (simple password check)
export const authenticateAdmin = async (password) => {
  try {
    console.log('🔐 Authenticating with password:', password ? '***' : 'empty');
    
    // Get the admin password from Firestore
    const adminDocRef = doc(db, 'admin', 'credentials');
    const snapshot = await getDoc(adminDocRef);
    
    let storedPassword = snapshot.data()?.password;
    console.log('Firebase password exists:', !!storedPassword);
    
    // If no password set in Firestore, use default
    if (!storedPassword) {
      storedPassword = 'admin123'; // Default password
      console.log('Using default password');
    }
    
    if (password === storedPassword) {
      console.log('✅ Authentication successful');
      setAdminPassword(password);
      return { success: true, message: 'Authenticated successfully' };
    } else {
      console.log('❌ Password mismatch');
      throw new Error('Invalid password');
    }
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    throw new Error(error.message || 'Authentication failed');
  }
};

// Update CV data in Firestore (Protected - requires admin password)
export const updateCVData = async (cvData) => {
  if (!adminPassword) {
    throw new Error('Not authenticated. Please log in first.');
  }
  
  try {
    const cvDocRef = doc(db, 'cvData', 'cv');
    await setDoc(cvDocRef, cvData, { merge: true });
    console.log('✅ CV data updated in Firestore successfully');
    return { success: true, message: 'CV data updated successfully' };
  } catch (error) {
    console.error('Error updating CV data:', error);
    throw new Error(error.message || 'Error updating CV data');
  }
};
