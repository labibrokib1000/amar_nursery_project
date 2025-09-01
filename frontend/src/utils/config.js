// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://amar-nursery-project.vercel.app/api';

export const API_ENDPOINTS = {
  // User endpoints
  USER_REGISTER: `${API_BASE_URL}/users/register`,
  USER_LOGIN: `${API_BASE_URL}/users/login`,
  USER_PROFILE: `${API_BASE_URL}/users/profile`,
  USER_ORDERS: `${API_BASE_URL}/users/orders`,
  USER_ADDRESS: `${API_BASE_URL}/users/address`,
  USER_ADDRESS_UPDATE: (id) => `${API_BASE_URL}/users/address/${id}`,
  USER_ADDRESS_DELETE: (id) => `${API_BASE_URL}/users/address/${id}`,
  
  // Product endpoints
  PRODUCTS: `${API_BASE_URL}/products`,
  PRODUCT_DETAILS: (id) => `${API_BASE_URL}/products/${id}`,
  
  // Admin Product endpoints
  ADMIN_PRODUCTS: `${API_BASE_URL}/products`,
  ADMIN_PRODUCT_CREATE: `${API_BASE_URL}/products`,
  ADMIN_PRODUCT_UPDATE: (id) => `${API_BASE_URL}/products/${id}`,
  ADMIN_PRODUCT_DELETE: (id) => `${API_BASE_URL}/products/${id}`,
  
  // Category endpoints
  CATEGORIES: `${API_BASE_URL}/categories`,
  
  // Admin Category endpoints
  ADMIN_CATEGORIES: `${API_BASE_URL}/categories`,
  ADMIN_CATEGORY_CREATE: `${API_BASE_URL}/categories`,
  ADMIN_CATEGORY_UPDATE: (id) => `${API_BASE_URL}/categories/${id}`,
  ADMIN_CATEGORY_DELETE: (id) => `${API_BASE_URL}/categories/${id}`,
  
  // Admin User endpoints
  ADMIN_USERS: `${API_BASE_URL}/users/admin/users`,
  ADMIN_USER_DETAILS: (id) => `${API_BASE_URL}/users/admin/users/${id}`,
  ADMIN_USER_UPDATE: (id) => `${API_BASE_URL}/users/admin/users/${id}`,
  ADMIN_USER_DELETE: (id) => `${API_BASE_URL}/users/admin/users/${id}`,
  
  // Order endpoints
  ORDERS: `${API_BASE_URL}/orders`,
  ORDER_DETAILS: (id) => `${API_BASE_URL}/orders/${id}`,
  
  // Wishlist endpoints
  WISHLIST: `${API_BASE_URL}/wishlist`,
  WISHLIST_ADD: `${API_BASE_URL}/wishlist/add`,
  WISHLIST_REMOVE: (productId) => `${API_BASE_URL}/wishlist/remove/${productId}`,
  WISHLIST_CLEAR: `${API_BASE_URL}/wishlist/clear`,
  WISHLIST_CHECK: (productId) => `${API_BASE_URL}/wishlist/check/${productId}`,
  USER_ORDERS: `${API_BASE_URL}/orders/user/myorders`,
  
  // Admin Order endpoints
  ADMIN_ORDERS: `${API_BASE_URL}/orders`,
  ADMIN_ORDER_UPDATE_STATUS: (id) => `${API_BASE_URL}/orders/${id}/status`,
  ADMIN_ORDER_DELIVER: (id) => `${API_BASE_URL}/orders/${id}/deliver`,
  ADMIN_ORDER_CANCEL: (id) => `${API_BASE_URL}/orders/${id}/cancel`,
  
  // Upload endpoints
  UPLOAD_IMAGE: `${API_BASE_URL}/upload/image`,
  UPLOAD_IMAGES: `${API_BASE_URL}/upload/images`,
  DELETE_IMAGE: (publicId) => `${API_BASE_URL}/upload/image/${publicId}`,
  GET_IMAGE: (publicId) => `${API_BASE_URL}/upload/image/${publicId}`,

};

export const APP_CONFIG = {
  APP_NAME: 'AmarNursery',
  DEFAULT_PAGE_SIZE: 12,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

export default API_ENDPOINTS;
