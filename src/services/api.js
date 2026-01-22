import { db, auth, googleProvider } from '../config/firebase';
import { collection, doc, getDoc, setDoc, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { defaultCVData } from '../data/defaultCVData';

// Store current user
let currentUser = null;
let isAdminUser = false;

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    console.log('🔍 Your Google UID:', user.uid);
    console.log('📧 Email:', user.email);
    
    // Check if user is admin in Firestore
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userDocRef);
      isAdminUser = snapshot.exists() && snapshot.data()?.isAdmin === true;
      console.log(`✅ User ${user.email} - Admin: ${isAdminUser}`);
    } catch (error) {
      console.error('Error checking admin status:', error);
      isAdminUser = false;
    }
  } else {
    isAdminUser = false;
  }
});

// Get current user
export const getCurrentUser = () => currentUser;

// Check if authenticated
export const isAuthenticated = () => currentUser !== null;

// Check if admin
export const isAdmin = () => isAdminUser;

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    console.log('🔐 Signing in with Google...');
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log('✅ Signed in as:', user.email);
    
    // Check if user is admin
    const userDocRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userDocRef);
    
    if (snapshot.exists() && snapshot.data()?.isAdmin === true) {
      console.log('✅ User is admin');
      return { user, isAdmin: true };
    } else {
      console.log('❌ User is not admin - please contact administrator');
      throw new Error('You do not have admin access. Please contact the administrator.');
    }
  } catch (error) {
    console.error('❌ Sign-in error:', error.message);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    currentUser = null;
    isAdminUser = false;
    console.log('✅ Signed out');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
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

// Update CV data in Firestore (Protected - requires admin)
export const updateCVData = async (cvData) => {
  if (!isAdminUser) {
    throw new Error('You do not have admin access to edit the CV.');
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
