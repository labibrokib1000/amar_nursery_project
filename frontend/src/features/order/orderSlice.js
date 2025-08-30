import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderApi } from '../../services/orderApi';

const initialState = {
  order: null,
  orders: [],
  loading: false,
  error: null,
  successMessage: null,
};

// Async thunks for order operations
export const createOrderAsync = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderApi.createOrder(orderData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const getOrderAsync = createAsyncThunk(
  'order/getOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderApi.getOrder(orderId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

export const updateOrderToPayAsync = createAsyncThunk(
  'order/updateOrderToPay',
  async ({ orderId, paymentResult }, { rejectWithValue }) => {
    try {
      const response = await orderApi.updateOrderToPaid(orderId, paymentResult);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment');
    }
  }
);

export const getMyOrdersAsync = createAsyncThunk(
  'order/getMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderApi.getMyOrders();
      return response;
    } catch (error) {
      console.error('OrderSlice: Error in getMyOrders:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const cancelOrderAsync = createAsyncThunk(
  'order/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderApi.cancelOrder(orderId);
      return { orderId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearOrder: (state) => {
      state.order = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.successMessage = 'Order placed successfully!';
        state.error = null;
      })
      .addCase(createOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Order
      .addCase(getOrderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.error = null;
      })
      .addCase(getOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Order Payment
      .addCase(updateOrderToPayAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderToPayAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.successMessage = 'Payment updated successfully!';
        state.error = null;
      })
      .addCase(updateOrderToPayAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get My Orders
      .addCase(getMyOrdersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrdersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(getMyOrdersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel order
      .addCase(cancelOrderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrderAsync.fulfilled, (state, action) => {
        state.loading = false;
        const orderId = action.payload.orderId;
        // Update the order status in the orders array
        const orderIndex = state.orders.findIndex(order => order._id === orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex].orderStatus = 'Cancelled';
        }
        state.successMessage = 'Order cancelled successfully';
        state.error = null;
      })
      .addCase(cancelOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage, clearOrder } = orderSlice.actions;

// Selectors
export const selectOrder = (state) => state.order.order;
export const selectOrders = (state) => state.order.orders;
export const selectOrderLoading = (state) => state.order.loading;
export const selectOrderError = (state) => state.order.error;
export const selectOrderSuccessMessage = (state) => state.order.successMessage;

export default orderSlice.reducer;
