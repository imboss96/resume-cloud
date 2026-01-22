import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CVView from './pages/CVView';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CVView />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
