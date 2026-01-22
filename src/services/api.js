import axios from 'axios';
import { database, ref, get, set } from '../config/firebase';

const API_BASE_URL = 'http://localhost:5000/api';

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

// Get IP and location info
export const trackView = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/views/track`);
    return response.data;
  } catch (error) {
    console.error('Error tracking view:', error);
  }
};

// Get all views
export const getViews = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/views`);
    return response.data;
  } catch (error) {
    console.error('Error fetching views:', error);
  }
};

// Get CV data
export const getCVData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cv`);
    return response.data;
  } catch (error) {
    console.error('Error fetching CV data:', error);
  }
};

// Authenticate admin
export const authenticateAdmin = async (password) => {
  try {
    console.log('Attempting to authenticate with API URL:', API_BASE_URL);
    const response = await axios.post(`${API_BASE_URL}/admin/authenticate`, { password });
    console.log('Authentication successful:', response.data);
    if (response.data.success) {
      setAdminPassword(password);
      return response.data;
    }
  } catch (error) {
    console.error('Error authenticating:', error);
    if (error.response) {
      throw new Error(error.response.data.error || 'Authentication failed');
    } else if (error.request) {
      throw new Error('Network error: Unable to reach the server. Make sure the backend server is running on port 5000.');
    } else {
      throw new Error('Error: ' + error.message);
    }
  }
};

// Update CV data (Protected - requires admin password)
// Now also submits to Firebase
export const updateCVData = async (cvData) => {
  if (!adminPassword) {
    throw new Error('Not authenticated. Please log in first.');
  }
  try {
    // First update Firebase
    try {
      const dbRef = ref(database, 'cvData');
      await set(dbRef, cvData);
      console.log('✅ Data submitted to Firebase successfully');
    } catch (firebaseError) {
      console.warn('⚠️  Firebase update warning:', firebaseError.message);
      // Continue even if Firebase fails - still update via backend
    }

    // Then update via backend for redundancy
    const response = await axios.put(`${API_BASE_URL}/cv`, cvData, {
      headers: {
        'x-admin-password': adminPassword
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating CV data:', error);
    if (error.response) {
      console.error('Response error:', error.response.data);
      if (error.response.status === 401) {
        clearAdminPassword();
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(error.response.data.error || 'Error updating CV data');
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('Server not responding. Make sure the server is running on port 5000.');
    } else {
      throw error;
    }
  }
};
