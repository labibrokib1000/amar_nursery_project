// Data Service - handles only backend API calls
import { userAPI, productAPI, categoryAPI, orderAPI } from './api';
import API_ENDPOINTS from './config';

// Data service class
class DataService {
  constructor() {
    console.log('DataService initialized - using backend API only');
  }

  // User methods
  async registerUser(userData) {
    try {
      console.log('Registering user via backend API...');
      return await userAPI.register(userData);
    } catch (error) {
      console.error('Registration failed:', error.message);
      throw error;
    }
  }

  async loginUser(credentials) {
    try {
      console.log('Logging in user via backend API...');
      return await userAPI.login(credentials);
    } catch (error) {
      console.error('Login failed:', error.message);
      throw error;
    }
  }

  async getProducts(params = {}) {
    try {
      console.log('Fetching products from backend API...');
      const result = await productAPI.getProducts(params);
      console.log('✅ Backend API success! Products:', result.products ? result.products.length : 'unknown');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch products from backend:', error.message);
      throw error;
    }
  }

  async getProduct(id) {
    try {
      console.log('Fetching product from backend API...');
      return await productAPI.getProduct(id);
    } catch (error) {
      console.error('Failed to fetch product from backend:', error.message);
      throw error;
    }
  }

  async getCategories() {
    try {
      console.log('Fetching categories from backend API...');
      return await categoryAPI.getCategories();
    } catch (error) {
      console.error('Failed to fetch categories from backend:', error.message);
      throw error;
    }
  }

  // Admin Product Methods
  async createProduct(productData, token) {
    try {
      console.log('Creating product via backend API...');
      return await productAPI.createProduct(productData, token);
    } catch (error) {
      console.error('Failed to create product:', error.message);
      throw error;
    }
  }

  async updateProduct(id, productData, token) {
    try {
      console.log('Updating product via backend API...');
      return await productAPI.updateProduct(id, productData, token);
    } catch (error) {
      console.error('Failed to update product:', error.message);
      throw error;
    }
  }

  async deleteProduct(id, token) {
    try {
      console.log('Deleting product via backend API...');
      return await productAPI.deleteProduct(id, token);
    } catch (error) {
      console.error('Failed to delete product:', error.message);
      throw error;
    }
  }

  // Admin Category Methods
  async createCategory(categoryData, token) {
    try {
      console.log('Creating category via backend API...');
      return await categoryAPI.createCategory(categoryData, token);
    } catch (error) {
      console.error('Failed to create category:', error.message);
      throw error;
    }
  }

  async updateCategory(id, categoryData, token) {
    try {
      console.log('Updating category via backend API...');
      return await categoryAPI.updateCategory(id, categoryData, token);
    } catch (error) {
      console.error('Failed to update category:', error.message);
      throw error;
    }
  }

  async deleteCategory(id, token) {
    try {
      console.log('Deleting category via backend API...');
      return await categoryAPI.deleteCategory(id, token);
    } catch (error) {
      console.error('Failed to delete category:', error.message);
      throw error;
    }
  }

  // Upload methods
  async uploadImage(file, token) {
    try {
      console.log('Uploading image to Cloudinary via backend API...');
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(API_ENDPOINTS.UPLOAD_IMAGE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Image upload failed');
      }

      console.log('✅ Image uploaded successfully:', data.data.url);
      return data;
    } catch (error) {
      console.error('Failed to upload image:', error.message);
      throw error;
    }
  }

  async deleteImage(publicId, token) {
    try {
      console.log('Deleting image from Cloudinary via backend API...');
      const response = await fetch(API_ENDPOINTS.DELETE_IMAGE(publicId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Image deletion failed');
      }

      console.log('✅ Image deleted successfully');
      return data;
    } catch (error) {
      console.error('Failed to delete image:', error.message);
      throw error;
    }
  }

  // Order methods
  async getAllOrders(token) {
    try {
      console.log('Fetching all orders from backend API...');
      return await orderAPI.getAllOrders(token);
    } catch (error) {
      console.error('Failed to fetch orders from backend:', error.message);
      throw error;
    }
  }

  async updateOrderStatus(orderId, status, token) {
    try {
      console.log('Updating order status via backend API...');
      return await orderAPI.updateOrderStatus(orderId, status, token);
    } catch (error) {
      console.error('Failed to update order status:', error.message);
      throw error;
    }
  }

  async markOrderDelivered(orderId, token) {
    try {
      console.log('Marking order as delivered via backend API...');
      return await orderAPI.markOrderDelivered(orderId, token);
    } catch (error) {
      console.error('Failed to mark order as delivered:', error.message);
      throw error;
    }
  }

  async cancelOrder(orderId, token) {
    try {
      console.log('Cancelling order via backend API...');
      return await orderAPI.cancelOrder(orderId, token);
    } catch (error) {
      console.error('Failed to cancel order:', error.message);
      throw error;
    }
  }
}

// Create singleton instance
const dataService = new DataService();

export default dataService;
