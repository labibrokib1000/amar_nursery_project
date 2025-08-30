import { orderAPI } from '../utils/api';

class OrderService {
  // Get user orders
  static async getUserOrders() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      return await orderAPI.getMyOrders(token);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  // Get order by ID
  static async getOrderById(orderId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      return await orderAPI.getOrderById(orderId, token);
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  // Cancel order
  static async cancelOrder(orderId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      return await orderAPI.cancelOrder(orderId, token);
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  // Format order status for display
  static formatOrderStatus(status) {
    const statusMap = {
      'pending': 'Pending',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status?.toLowerCase()] || status;
  }

  // Get status color
  static getStatusColor(status) {
    const colors = {
      'pending': '#ff9800',
      'processing': '#2196f3',
      'shipped': '#9c27b0',
      'delivered': '#4caf50',
      'cancelled': '#f44336'
    };
    return colors[status?.toLowerCase()] || '#757575';
  }

  // Calculate order summary
  static calculateOrderSummary(orders) {
    if (!Array.isArray(orders)) return null;
    
    return {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0),
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      deliveredOrders: orders.filter(order => order.status === 'delivered').length,
      recentOrders: orders.slice(0, 5)
    };
  }

  // Format currency
  static formatCurrency(amount) {
    return `৳${parseFloat(amount || 0).toFixed(2)}`;
  }

  // Get order status badge style
  static getStatusBadgeStyle(status) {
    const styles = {
      'pending': { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' },
      'processing': { backgroundColor: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' },
      'shipped': { backgroundColor: '#e2e3f0', color: '#383d41', border: '1px solid #c3c6d4' },
      'delivered': { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
      'cancelled': { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }
    };
    return styles[status?.toLowerCase()] || styles['pending'];
  }

  // Validate order data
  static validateOrderData(order) {
    if (!order) return { isValid: false, errors: ['Order data is missing'] };
    
    const errors = [];
    
    if (!order._id) errors.push('Order ID is missing');
    if (!order.orderItems || !Array.isArray(order.orderItems) || order.orderItems.length === 0) {
      errors.push('Order items are missing or invalid');
    }
    if (typeof order.totalPrice !== 'number' || order.totalPrice < 0) {
      errors.push('Total price is invalid');
    }
    if (!order.status) errors.push('Order status is missing');
    if (!order.createdAt) errors.push('Order creation date is missing');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Filter orders by date range
  static filterOrdersByDateRange(orders, startDate, endDate) {
    if (!Array.isArray(orders)) return [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  }

  // Group orders by status
  static groupOrdersByStatus(orders) {
    if (!Array.isArray(orders)) return {};
    
    return orders.reduce((grouped, order) => {
      const status = order.status || 'unknown';
      if (!grouped[status]) {
        grouped[status] = [];
      }
      grouped[status].push(order);
      return grouped;
    }, {});
  }

  // Calculate order statistics
  static calculateOrderStats(orders) {
    if (!Array.isArray(orders)) return null;
    
    const stats = {
      total: orders.length,
      totalValue: orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0),
      averageValue: 0,
      byStatus: {},
      recentOrders: orders.slice(0, 10).reverse() // Most recent first
    };
    
    if (stats.total > 0) {
      stats.averageValue = stats.totalValue / stats.total;
    }
    
    // Count by status
    orders.forEach(order => {
      const status = order.status || 'unknown';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    });
    
    return stats;
  }
}

export default OrderService;
