// API Utility Functions
import API_ENDPOINTS from './config';

// Get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create headers with auth token
const createAuthHeaders = (token = null, isFormData = false) => {
  const authToken = token || getAuthToken();
  const headers = {};
  
  // Don't set Content-Type for FormData, let browser set it with boundary
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  
  return headers;
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    const config = {
      headers: createAuthHeaders(options.token, options.isFormData),
      ...options,
    };
    
    // Remove custom options to avoid sending them in the request
    if (config.token) {
      delete config.token;
    }
    if (config.isFormData) {
      delete config.isFormData;
    }

    const response = await fetch(endpoint, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API call failed');
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// User API functions
export const userAPI = {
  register: (userData) =>
    apiCall(API_ENDPOINTS.USER_REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiCall(API_ENDPOINTS.USER_LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getProfile: (token) =>
    apiCall(API_ENDPOINTS.USER_PROFILE, {
      token
    }),

  updateProfile: (userData, token) =>
    apiCall(API_ENDPOINTS.USER_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(userData),
      token
    }),

  uploadAvatar: (imageFile, token) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return apiCall(`${API_ENDPOINTS.USER_PROFILE}/avatar`, {
      method: 'POST',
      body: formData,
      token,
      isFormData: true
    });
  },

  getOrders: (token) =>
    apiCall(API_ENDPOINTS.USER_ORDERS, {
      token
    }),

  addAddress: (addressData, token) =>
    apiCall(API_ENDPOINTS.USER_ADDRESS, {
      method: 'POST',
      body: JSON.stringify(addressData),
      token
    }),

  updateAddress: (addressId, addressData, token) =>
    apiCall(API_ENDPOINTS.USER_ADDRESS_UPDATE(addressId), {
      method: 'PUT',
      body: JSON.stringify(addressData),
      token
    }),

  deleteAddress: (addressId, token) =>
    apiCall(API_ENDPOINTS.USER_ADDRESS_DELETE(addressId), {
      method: 'DELETE',
      token
    })
};

// Product API functions
export const productAPI = {
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_ENDPOINTS.PRODUCTS}?${queryString}` : API_ENDPOINTS.PRODUCTS;
    return apiCall(url);
  },

  getProduct: (id) =>
    apiCall(API_ENDPOINTS.PRODUCT_DETAILS(id)),

  searchProducts: (query, params = {}) => {
    const searchParams = new URLSearchParams({ q: query, ...params }).toString();
    return apiCall(`${API_ENDPOINTS.PRODUCTS}/search?${searchParams}`);
  },

  // Admin functions
  createProduct: (productData, token) =>
    apiCall(API_ENDPOINTS.ADMIN_PRODUCT_CREATE, {
      method: 'POST',
      body: JSON.stringify(productData),
      token,
    }),

  updateProduct: (id, productData, token) =>
    apiCall(API_ENDPOINTS.ADMIN_PRODUCT_UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(productData),
      token,
    }),

  deleteProduct: (id, token) =>
    apiCall(API_ENDPOINTS.ADMIN_PRODUCT_DELETE(id), {
      method: 'DELETE',
      token,
    }),
};

// Category API functions
export const categoryAPI = {
  getCategories: () =>
    apiCall(API_ENDPOINTS.CATEGORIES),

  // Admin functions
  createCategory: (categoryData, token) =>
    apiCall(API_ENDPOINTS.ADMIN_CATEGORY_CREATE, {
      method: 'POST',
      body: JSON.stringify(categoryData),
      token,
    }),

  updateCategory: (id, categoryData, token) =>
    apiCall(API_ENDPOINTS.ADMIN_CATEGORY_UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(categoryData),
      token,
    }),

  deleteCategory: (id, token) =>
    apiCall(API_ENDPOINTS.ADMIN_CATEGORY_DELETE(id), {
      method: 'DELETE',
      token,
    }),
};

// Order API functions
export const orderAPI = {
  createOrder: (orderData) =>
    apiCall(API_ENDPOINTS.ORDERS, {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  getOrder: (id) =>
    apiCall(API_ENDPOINTS.ORDER_DETAILS(id)),

  getUserOrders: () =>
    apiCall(API_ENDPOINTS.USER_ORDERS),

  // Admin order functions
  getAllOrders: (token) =>
    apiCall(API_ENDPOINTS.ADMIN_ORDERS, {
      token
    }),

  updateOrderStatus: (id, status, token) =>
    apiCall(API_ENDPOINTS.ADMIN_ORDER_UPDATE_STATUS(id), {
      method: 'PUT',
      body: JSON.stringify({ orderStatus: status }),
      token
    }),

  markOrderDelivered: (id, token) =>
    apiCall(API_ENDPOINTS.ADMIN_ORDER_DELIVER(id), {
      method: 'PUT',
      token
    }),

  cancelOrder: (id, token) =>
    apiCall(API_ENDPOINTS.ADMIN_ORDER_CANCEL(id), {
      method: 'PUT',
      token
    }),
};

// Admin User API functions
export const adminUserAPI = {
  getAllUsers: (token) =>
    apiCall(API_ENDPOINTS.ADMIN_USERS, {
      token
    }),

  getUserDetails: (id, token) =>
    apiCall(API_ENDPOINTS.ADMIN_USER_DETAILS(id), {
      token
    }),

  updateUser: (id, userData, token) =>
    apiCall(API_ENDPOINTS.ADMIN_USER_UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(userData),
      token
    }),

  deleteUser: (id, token) =>
    apiCall(API_ENDPOINTS.ADMIN_USER_DELETE(id), {
      method: 'DELETE',
      token
    })
};

// Wishlist API
const wishlistAPI = {
  getWishlist: (token) =>
    apiCall(API_ENDPOINTS.WISHLIST, { token }),

  addToWishlist: (productId, token) =>
    apiCall(API_ENDPOINTS.WISHLIST_ADD, {
      method: 'POST',
      body: JSON.stringify({ productId }),
      token
    }),

  removeFromWishlist: (productId, token) =>
    apiCall(API_ENDPOINTS.WISHLIST_REMOVE(productId), {
      method: 'DELETE',
      token
    }),

  clearWishlist: (token) =>
    apiCall(API_ENDPOINTS.WISHLIST_CLEAR, {
      method: 'DELETE',
      token
    }),

  checkWishlistStatus: (productId, token) =>
    apiCall(API_ENDPOINTS.WISHLIST_CHECK(productId), { token })
};

export default {
  userAPI,
  productAPI,
  categoryAPI,
  orderAPI,
  adminUserAPI,
  wishlistAPI,
};
