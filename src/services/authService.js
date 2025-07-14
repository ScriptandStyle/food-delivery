import fetchApi from './api';

// Register a new user
export const register = async (userData) => {
  try {
    const response = await fetchApi('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

// Login user
export const login = async (credentials) => {
  try {
    const response = await fetchApi('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const response = await fetchApi('/users/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('token') ? true : false;
};
