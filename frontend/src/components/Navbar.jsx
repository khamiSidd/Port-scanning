import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css'; // We will create this small CSS file

const formatLoginTime = (isoString) => {
  if (!isoString || isoString === 'null') {
    return 'First login!';
  }
  try {
    const options = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true, // Use AM/PM
    };
    
    // Use 'en-IN' for Indian English locale, passing in the options
    return new Date(isoString).toLocaleString('en-IN', options);
  } catch (e) {
    console.error("Failed to parse date", isoString);
    return null;
  }
};

const Navbar = () => {
  const { isAuthenticated, logout, lastLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayLoginTime = formatLoginTime(lastLogin);

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        PortScanner
      </Link>
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            {displayLoginTime && (
              <span className="nav-last-login">
                Last login: {displayLoginTime}
              </span>
            )}
            
            <NavLink to="/">Home</NavLink>
            <button onClick={handleLogout} className="nav-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;