// src/App.js - Main App with Authentication
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LocalCreatorNetwork from './LocalCreatorNetwork';
import CallbackHandler from './CallbackHandler';
import Login from './Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData, token) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <Login onLoginSuccess={handleLoginSuccess} />
          } 
        />

        {/* Main App Route - Protected */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <LocalCreatorNetwork user={user} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        {/* OAuth Callback Routes */}
        <Route path="/callback/instagram" element={<CallbackHandler />} />
        <Route path="/callback/tiktok" element={<CallbackHandler />} />
        <Route path="/callback/youtube" element={<CallbackHandler />} />
        
        {/* 404 Fallback */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Page not found</p>
              <a href="/" className="text-blue-600 hover:text-blue-700">
                Go back home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;