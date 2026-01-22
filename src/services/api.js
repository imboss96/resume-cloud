import { database, ref, get, set } from '../config/firebase';
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

// Track view in Firebase
export const trackView = async () => {
  try {
    const viewData = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    const viewsRef = ref(database, `views/${Date.now()}`);
    await set(viewsRef, viewData);
    return viewData;
  } catch (error) {
    console.error('Error tracking view:', error);
  }
};

// Get all views from Firebase
export const getViews = async () => {
  try {
    const viewsRef = ref(database, 'views');
    const snapshot = await get(viewsRef);
    
    if (snapshot.exists()) {
      const viewsData = snapshot.val();
      const viewsArray = Object.values(viewsData);
      return { views: viewsArray };
    }
    return { views: [] };
  } catch (error) {
    console.error('Error fetching views:', error);
    return { views: [] };
  }
};

// Get CV data from Firebase
export const getCVData = async () => {
  try {
    const cvRef = ref(database, 'cvData');
    const snapshot = await get(cvRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
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
    // Get the admin password from Firebase
    const adminRef = ref(database, 'admin/password');
    const snapshot = await get(adminRef);
    
    let storedPassword = snapshot.val();
    
    // If no password set in Firebase, use default
    if (!storedPassword) {
      storedPassword = 'admin123'; // Default password
    }
    
    if (password === storedPassword) {
      setAdminPassword(password);
      return { success: true, message: 'Authenticated successfully' };
    } else {
      throw new Error('Invalid password');
    }
  } catch (error) {
    console.error('Error authenticating:', error);
    throw new Error(error.message || 'Authentication failed');
  }
};

// Update CV data in Firebase (Protected - requires admin password)
export const updateCVData = async (cvData) => {
  if (!adminPassword) {
    throw new Error('Not authenticated. Please log in first.');
  }
  
  try {
    const cvRef = ref(database, 'cvData');
    await set(cvRef, cvData);
    console.log('✅ CV data updated in Firebase successfully');
    return { success: true, message: 'CV data updated successfully' };
  } catch (error) {
    console.error('Error updating CV data:', error);
    throw new Error(error.message || 'Error updating CV data');
  }
};
