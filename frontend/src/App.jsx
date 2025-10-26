import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ScanPage from './components/ScanPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import VerifyOTPPage from './components/VerifyOTPPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import './App.css';
import './components/Navbar.css'; // Import the new navbar styles

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scan/:scanType" // Example: make ScanPage dynamic
          element={
            <ProtectedRoute>
              <ScanPage />
            </ProtectedRoute>
          }
        />

        {/* Add a 404 Not Found route later */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </div>
  );
}

export default App;