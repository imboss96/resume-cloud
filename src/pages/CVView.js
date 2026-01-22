import React, { useEffect } from 'react';
import { trackView } from '../services/api';
import CVDisplay from '../components/CV/CVDisplay';
import './CVView.css';

function CVView() {
  useEffect(() => {
    // Track page view
    trackView();
  }, []);

  return (
    <div className="cv-view-container">
      <CVDisplay />
    </div>
  );
}

export default CVView;
