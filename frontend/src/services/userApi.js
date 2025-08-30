import axios from 'axios';

//const API_URL = 'http://localhost:5001/api/users';
const API_URL = 'https://amar-nursery-project-api.vercel.app/api/users';
// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get user profile with addresses
export const getUserProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch user profile';
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update user profile';
  }
};

// Add address to user profile
export const addUserAddress = async (addressData) => {
  try {
    const response = await api.post('/address', addressData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to add address';
  }
};

// Update user address
export const updateUserAddress = async (addressId, addressData) => {
  try {
    const response = await api.put(`/address/${addressId}`, addressData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update address';
  }
};

// Delete user address
export const deleteUserAddress = async (addressId) => {
  try {
    const response = await api.delete(`/address/${addressId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete address';
  }
};

// Set default address
export const setDefaultAddress = async (addressId) => {
  try {
    const response = await api.put(`/address/${addressId}/default`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to set default address';
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
};
