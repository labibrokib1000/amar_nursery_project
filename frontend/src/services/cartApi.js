import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://amar-nursery-project-api.vercel.app/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Check both possible storage keys for token
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    
    let authToken = token;
    
    if (!authToken && userInfo) {
      try {
        const user = JSON.parse(userInfo);
        authToken = user.token;
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
    
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Cart API functions
export const cartApi = {
  // Get user's cart
  getCart: async () => {
    const response = await api.get('/users/cart');
    return response.data;
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/users/cart', {
      productId,
      quantity,
    });
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (productId, quantity) => {
    const response = await api.put('/users/cart', {
      productId,
      quantity,
    });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    const response = await api.delete(`/users/cart/${productId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await api.delete('/users/cart/clear');
    return response.data;
  },
};

export default cartApi;