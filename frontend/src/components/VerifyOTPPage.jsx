import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { verifyOtp, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the email from the registration page
  const email = location.state?.email;

  // if (!email) {
  //   // If no email, redirect to register
  //   navigate('/register');
  //   return null; 
  // }

  const handleSubmit = async (e) => { 
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const data = await verifyOtp(email, otp);
      if (data.success) {
        setMessage('Verification successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Invalid or expired OTP.');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify OTP.');
    }
  };

  return (
    <div className="auth-container">
      <form className="scan-form auth-form" onSubmit={handleSubmit}>
        <h1 className="auth-title">Verify Your Email</h1>
        <p className="auth-subtitle">
          An OTP has been sent to <strong>{email}</strong>.
        </p>
        {error && <div className="error full-width">{error}</div>}
        {message && <div className="success-msg full-width">{message}</div>}
        
        <div className="form-group full-width">
          <label htmlFor="otp">Enter 6-Digit OTP</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            maxLength="6"
            required
          />
        </div>
        
        <div className="form-group full-width">
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VerifyOTPPage;