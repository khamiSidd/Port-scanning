// Define your backend's base URL
// Make sure this matches where your Python (Flask/FastAPI) server is running
const API_URL = 'http://127.0.0.1:5000/api';

/**
 * Registers a new user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>}
 */
export const register = async (email, password) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

/**
 * Verifies the user's OTP
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<object>}
 */
export const verifyOtp = async (email, otp) => {
  const response = await fetch(`${API_URL}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  return response.json();
};

/**
 * Logs in a user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>}
 */
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  const data = await response.json();
  // Store the token in localStorage
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }
  if (data.lastLogin) {
    localStorage.setItem('lastLogin', data.lastLogin);
  } else {
    localStorage.removeItem('lastLogin');
  }
  return data;
};

/**
 * Logs out a user by removing the token
 */
export const logout = () => {
  localStorage.removeItem('authToken');
};

/**
 * Gets the current token
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem('authToken');
};

export const getLastLogin = () => {
  return localStorage.getItem('lastLogin');
};