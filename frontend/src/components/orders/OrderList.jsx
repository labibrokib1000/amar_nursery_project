import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import jsPDF from 'jspdf';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Pagination,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  ShoppingBag as ShoppingBagIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  LocalShipping as ShippingIcon,
  RateReview as ReviewIcon
} from '@mui/icons-material';
import { getMyOrdersAsync, cancelOrderAsync, getOrderAsync } from '../../features/order/orderSlice';

const OrderList = ({ showHeader = true, maxItems = null, variant = 'full' }) => {
  const dispatch = useDispatch();
  const { orders, orderLoading, orderError } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

  // Local state for filtering and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  // Fetch orders on component mount
  useEffect(() => {
    if (user) {
      console.log('Fetching orders for user:', user._id);
      dispatch(getMyOrdersAsync());
    }
  }, [dispatch, user]);

  // Filter and paginate orders
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.orderItems?.some(item => 
                           getProductName(item)?.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = maxItems ? Math.min(startIndex + ordersPerPage, startIndex + maxItems) : startIndex + ordersPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Helper function to safely format price
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  // Helper function to safely get quantity
  const getQuantity = (item) => {
    const qty = parseInt(item.qty || item.quantity || 0);
    return isNaN(qty) ? 0 : qty;
  };

  // Helper function to safely get product name
  const getProductName = (item) => {
    if (typeof item.name === 'string') {
      return item.name;
    } else if (item.name && typeof item.name === 'object' && item.name.name) {
      return item.name.name;
    } else if (item.product && typeof item.product === 'object' && item.product.name) {
      return item.product.name;
    } else if (typeof item.product === 'string') {
      return item.product;
    }
    return 'Unknown Product';
  };

  // Helper function to safely get product category
  const getProductCategory = (item) => {
    if (item.category && typeof item.category === 'string') {
      return item.category;
    } else if (item.category && typeof item.category === 'object' && item.category.name) {
      return item.category.name;
    } else if (item.product && typeof item.product === 'object' && item.product.category) {
      if (typeof item.product.category === 'string') {
        return item.product.category;
      } else if (item.product.category.name) {
        return item.product.category.name;
      }
    }
    return null;
  };

  // Helper functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'processing': 'info',
      'shipped': 'primary',
      'delivered': 'success',
      'cancelled': 'error'
    };
    return colors[status?.toLowerCase()] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': '⏳',
      'processing': '🔄',
      'shipped': '🚚',
      'delivered': '✅',
      'cancelled': '❌'
    };
    return icons[status?.toLowerCase()] || '📦';
  };

  const getImageUrl = (item) => {
    // First check if item has direct image property
    if (item.image) {
      if (typeof item.image === 'string') {
        return item.image;
      } else if (item.image.url) {
        return item.image.url;
      } else if (Array.isArray(item.image) && item.image.length > 0) {
        return typeof item.image[0] === 'string' ? item.image[0] : item.image[0].url || '';
      }
    }
    
    // Check if item has product property with images
    if (item.product && typeof item.product === 'object') {
      if (item.product.image) {
        if (typeof item.product.image === 'string') {
          return item.product.image;
        } else if (item.product.image.url) {
          return item.product.image.url;
        }
      }
      
      if (item.product.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
        const firstImage = item.product.images[0];
        return typeof firstImage === 'string' ? firstImage : firstImage.url || '';
      }
    }
    
    return 'https://via.placeholder.com/60x60?text=No+Image';
  };

  // Helper function to determine if order is paid
  const isOrderPaid = (order) => {
    return order.isPaid || order.isDelivered || order.orderStatus === 'Delivered';
  };

  // Helper function to get payment status text
  const getPaymentStatusText = (order) => {
    if (order.isPaid) return 'Paid';
    if (order.isDelivered || order.orderStatus === 'Delivered') return 'Paid (On Delivery)';
    return 'Unpaid';
  };

  // Event handlers
  const handleRefresh = () => {
    dispatch(getMyOrdersAsync());
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleCancelOrder = (order) => {
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (orderToCancel) {
      try {
        await dispatch(cancelOrderAsync(orderToCancel._id));
        setCancelDialogOpen(false);
        setOrderToCancel(null);
        dispatch(getMyOrdersAsync()); // Refresh orders
      } catch (error) {
        console.error('Error cancelling order:', error);
      }
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1); // Reset to first page
  };

  // PDF generation function
  const generateOrderPDF = async (order) => {
    try {
      if (!order) {
        console.error('No order data provided for PDF generation');
        return;
      }

      // Show loading indicator
      const loadingMessage = 'Fetching latest order data for PDF generation...';
      console.log(loadingMessage);
      
      // You could add a loading state here if needed
      // setOrderLoading(true); // Uncomment if you want to show loading state

      // Fetch fresh order data from backend to ensure latest status and address
      console.log('Fetching latest order data for PDF generation...');
      const response = await dispatch(getOrderAsync(order._id));
      
      if (response.type === 'order/getOrder/rejected') {
        console.error('Failed to fetch latest order data:', response.payload);
        // Show user-friendly message but continue with existing data
        const useExistingData = confirm(
          'Unable to fetch the latest order information from server. ' +
          'Would you like to generate PDF with current data? ' +
          '(The status and address might not be up-to-date)'
        );
        
        if (!useExistingData) {
          return; // User cancelled PDF generation
        }
      }
      
      // Use fresh data from backend if available, otherwise use existing order data
      const latestOrder = response.type === 'order/getOrder/fulfilled' ? response.payload : order;
      
      console.log('Generating PDF with latest order data:', {
        orderId: latestOrder._id,
        status: latestOrder.status,
        paymentStatus: latestOrder.isPaid,
        shippingAddress: latestOrder.shippingAddress
      });

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      let y = 20;

      // Company Header
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text('Amar Nursery', margin, y);
      y += 10;
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text('Order Receipt', margin, y);
      y += 20;

      // Order Information
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Order Information', margin, y);
      y += 10;
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Order ID: ${latestOrder._id || 'N/A'}`, margin, y);
      y += 8;
      pdf.text(`Order Date: ${formatDate(latestOrder.createdAt)}`, margin, y);
      y += 8;
      
      // Use latest status from backend
      const currentStatus = (latestOrder.status || latestOrder.orderStatus || 'PENDING').toUpperCase();
      pdf.text(`Status: ${currentStatus}`, margin, y);
      y += 8;
      
      // Use latest payment status from backend
      const isOrderPaid = latestOrder.isPaid || latestOrder.paymentResult?.status === 'completed';
      const paymentStatus = isOrderPaid ? 'PAID' : 'PENDING';
      pdf.text(`Payment Status: ${paymentStatus}`, margin, y);
      y += 8;
      
      // Show payment method if available
      if (latestOrder.paymentMethod) {
        pdf.text(`Payment Method: ${latestOrder.paymentMethod.toUpperCase()}`, margin, y);
        y += 8;
      }
      
      // Show paid date if order is paid
      if (isOrderPaid && latestOrder.paidAt) {
        pdf.text(`Paid Date: ${formatDate(latestOrder.paidAt)}`, margin, y);
        y += 8;
      }
      
      // Show delivery date if order is delivered
      if (latestOrder.isDelivered && latestOrder.deliveredAt) {
        pdf.text(`Delivered Date: ${formatDate(latestOrder.deliveredAt)}`, margin, y);
        y += 8;
      }
      
      y += 12;

      // Customer Information (using latest address from backend)
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Customer Information', margin, y);
      y += 10;
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      
      // Use latest shipping address from backend
      const shippingAddress = latestOrder.shippingAddress || {};
      
      // Customer name (prefer from user object, fallback to shipping address)
      const customerName = latestOrder.user?.name || user?.name || shippingAddress.name || 'N/A';
      pdf.text(`Name: ${customerName}`, margin, y);
      y += 8;
      
      // Customer email
      const customerEmail = latestOrder.user?.email || user?.email || shippingAddress.email || 'N/A';
      pdf.text(`Email: ${customerEmail}`, margin, y);
      y += 8;
      
      // Shipping address details from backend
      if (shippingAddress.address || shippingAddress.street) {
        const address = shippingAddress.address || shippingAddress.street;
        pdf.text(`Address: ${address}`, margin, y);
        y += 8;
      }
      if (shippingAddress.city) {
        pdf.text(`City: ${shippingAddress.city}`, margin, y);
        y += 8;
      }
      if (shippingAddress.state) {
        pdf.text(`State/District: ${shippingAddress.state}`, margin, y);
        y += 8;
      }
      if (shippingAddress.postalCode || shippingAddress.zipCode) {
        const postalCode = shippingAddress.postalCode || shippingAddress.zipCode;
        pdf.text(`Postal Code: ${postalCode}`, margin, y);
        y += 8;
      }
      if (shippingAddress.country) {
        pdf.text(`Country: ${shippingAddress.country}`, margin, y);
        y += 8;
      }
      if (shippingAddress.phone) {
        pdf.text(`Phone: ${shippingAddress.phone}`, margin, y);
        y += 8;
      }
      y += 15;

      // Order Items Header
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Order Items', margin, y);
      y += 15;

      // Table Headers
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      const headers = ['Product', 'Quantity', 'Price', 'Total'];
      const colWidths = [80, 30, 30, 30];
      let x = margin;
      
      headers.forEach((header, index) => {
        pdf.text(header, x, y);
        x += colWidths[index];
      });
      y += 5;
      
      // Draw line under headers
      pdf.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Order Items (use latest order items from backend)
      pdf.setFont(undefined, 'normal');
      let subtotal = 0;
      
      if (latestOrder.orderItems && Array.isArray(latestOrder.orderItems)) {
        latestOrder.orderItems.forEach((item) => {
          const productName = getProductName(item);
          const quantity = getQuantity(item);
          const price = parseFloat(item.price || 0);
          const total = quantity * price;
          subtotal += total;
          
          x = margin;
          
          // Truncate long product names
          const truncatedName = productName.length > 25 ? productName.substring(0, 25) + '...' : productName;
          pdf.text(truncatedName, x, y);
          x += colWidths[0];
          
          pdf.text(quantity.toString(), x, y);
          x += colWidths[1];
          
          pdf.text(`Tk${formatPrice(price)}`, x, y);
          x += colWidths[2];
          
          pdf.text(`Tk${formatPrice(total)}`, x, y);
          
          y += 10;
          
          // Check if we need a new page
          if (y > 250) {
            pdf.addPage();
            y = 20;
          }
        });
      }

      y += 10;
      
      // Draw line before totals
      pdf.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Order Summary (use latest pricing from backend)
      pdf.setFont(undefined, 'bold');
      
      // Items price
      const itemsPrice = parseFloat(latestOrder.itemsPrice || subtotal || 0);
      pdf.text(`Items Price: Tk${formatPrice(itemsPrice)}`, pageWidth - 80, y);
      y += 8;
      
      // Shipping price
      const shippingPrice = parseFloat(latestOrder.shippingPrice || 0);
      if (shippingPrice > 0) {
        pdf.text(`Shipping: Tk${formatPrice(shippingPrice)}`, pageWidth - 80, y);
        y += 8;
      }
      
      // Tax price if available
      const taxPrice = parseFloat(latestOrder.taxPrice || 0);
      if (taxPrice > 0) {
        pdf.text(`Tax: Tk${formatPrice(taxPrice)}`, pageWidth - 80, y);
        y += 8;
      }
      
      y += 5;
      
      // Total price
      const totalPrice = parseFloat(latestOrder.totalPrice || 0);
      pdf.setFontSize(12);
      pdf.text(`Total: Tk${formatPrice(totalPrice)}`, pageWidth - 80, y);

      // Footer
      y += 30;
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'italic');
      pdf.text('Thank you for your order!', margin, y);
      pdf.text('For any queries, please contact our customer service.', margin, y + 8);
      
      // Add generation timestamp and data source info
      const timestamp = new Date().toLocaleString();
      pdf.text(`PDF generated on: ${timestamp}`, margin, y + 16);
      
      const dataSource = response.type === 'order/getOrder/fulfilled' ? 'Latest data from server' : 'Cached data';
      pdf.text(`Data source: ${dataSource}`, margin, y + 24);

      // Save the PDF with latest order status
      const filename = `order-receipt-${latestOrder._id?.slice(-8) || 'unknown'}-${Date.now()}.pdf`;
      pdf.save(filename);
      
      console.log(`PDF generated successfully with backend data: ${filename}`);
      console.log('Order data used for PDF:', {
        status: currentStatus,
        paymentStatus: paymentStatus,
        totalPrice: totalPrice,
        dataSource: dataSource
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Loading state
  if (orderLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading your orders...</Typography>
      </Box>
    );
  }

  // Error state
  if (orderError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <AlertTitle>Error Loading Orders</AlertTitle>
        {orderError}
        <Button onClick={handleRefresh} sx={{ mt: 1 }} variant="outlined" size="small">
          Retry
        </Button>
      </Alert>
    );
  }

  // Empty state
  if (!orders || orders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <ShoppingBagIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No orders found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You haven't placed any orders yet.
        </Typography>
        <Button variant="contained" href="/products">
          Start Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with filters */}
      {showHeader && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              My Orders ({filteredOrders.length})
            </Typography>
            <Button
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
              variant="outlined"
              size="small"
            >
              Refresh
            </Button>
          </Box>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search orders..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status"
                >
                  <MenuItem value="all">All Orders</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Orders List */}
      {variant === 'compact' ? (
        // Compact view for dashboard
        <Grid container spacing={2}>
          {paginatedOrders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        #{order._id?.slice(-8)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(order.createdAt)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="subtitle2" color="primary">
                        ৳{formatPrice(order.totalPrice)}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => handleViewOrder(order)}
                        startIcon={<ViewIcon />}
                      >
                        View
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // Full detailed view with enhanced styling
        <Grid container spacing={3}>
          {paginatedOrders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card 
                sx={{ 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 4,
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)'
                  },
                  ...(order.priority === 'high' && {
                    borderColor: 'error.main',
                    borderWidth: 2
                  })
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Enhanced Order Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" fontWeight="bold">
                          Order #{order._id?.slice(-8)}
                        </Typography>
                        {order.priority === 'high' && (
                          <Chip label="🔥" size="small" color="error" />
                        )}
                        {order.isGift && (
                          <Chip label="🎁" size="small" color="secondary" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Placed on {formatDate(order.createdAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        Order ID: {order._id}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', minWidth: 150 }}>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                        ৳{formatPrice(order.totalPrice)}
                      </Typography>
                      {order.discount > 0 && (
                        <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                          Saved ৳{formatPrice(order.discount)}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Order Items Preview */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Items ({order.orderItems?.length || 0}):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {order.orderItems?.slice(0, 2).map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={getImageUrl(item)}
                            sx={{ width: 40, height: 40 }}
                            variant="rounded"
                          />
                          <Box>
                            <Typography variant="caption" display="block">
                              {getProductName(item)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Qty: {getQuantity(item)} × ৳{formatPrice(item.price)}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                      {order.orderItems?.length > 2 && (
                        <Chip
                          label={`+${order.orderItems.length - 2} more items`}
                          variant="outlined"
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Payment & Shipping Info with Enhanced Status */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip
                      label={isOrderPaid(order) ? '💵 Paid' : '💳 Unpaid'}
                      color={isOrderPaid(order) ? 'success' : 'warning'}
                      size="small"
                    />
                    <Chip
                      label={`🚚 ${order.paymentMethod || 'Cash on Delivery'}`}
                      variant="outlined"
                      size="small"
                    />
                    {order.isDelivered && (
                      <Chip
                        label={`📦 Delivered on ${formatDate(order.deliveredAt)}`}
                        color="success"
                        size="small"
                      />
                    )}
                    {order.trackingNumber && (
                      <Chip
                        label={`📋 Tracking: ${order.trackingNumber.slice(-6)}`}
                        color="info"
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {order.priority === 'high' && (
                      <Chip
                        label="🔥 Priority"
                        color="error"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    )}
                    {order.isGift && (
                      <Chip
                        label="🎁 Gift Order"
                        color="secondary"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Enhanced Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewOrder(order)}
                      sx={{ flex: 1, minWidth: 'fit-content' }}
                    >
                      View Details
                    </Button>
                    {order.status === 'pending' && (
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={() => handleCancelOrder(order)}
                        sx={{ flex: 1, minWidth: 'fit-content' }}
                      >
                        Cancel
                      </Button>
                    )}
                    {order.trackingNumber && (
                      <Button
                        size="small"
                        color="info"
                        variant="outlined"
                        startIcon={<ShippingIcon />}
                        onClick={() => {
                          // TODO: Implement tracking
                          console.log('Track order:', order.trackingNumber);
                        }}
                        sx={{ flex: 1, minWidth: 'fit-content' }}
                      >
                        Track
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ReceiptIcon />}
                      onClick={() => generateOrderPDF(order)}
                      sx={{ flex: 1, minWidth: 'fit-content' }}
                    >
                      Receipt
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {!maxItems && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Enhanced Order Details Dialog */}
      <Dialog
        open={orderDetailsOpen}
        onClose={() => setOrderDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, maxHeight: '90vh' }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Order #{selectedOrder?._id?.slice(-8) || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Full ID: {selectedOrder?._id || 'Not available'}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                ৳{selectedOrder?.totalPrice?.toFixed(2) || '0.00'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 0 }}>
          {selectedOrder && (
            <Box>
              {/* Order Status Timeline */}
              <Box sx={{ bgcolor: 'grey.50', p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  📋 Order Timeline
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">Order Placed</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {formatDate(selectedOrder.createdAt)}
                      </Typography>
                    </Box>
                  </Grid>
                  {(selectedOrder.paidAt || isOrderPaid(selectedOrder)) && (
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">Payment Received</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {selectedOrder.paidAt ? formatDate(selectedOrder.paidAt) : 
                           (selectedOrder.deliveredAt ? formatDate(selectedOrder.deliveredAt) : 'On Delivery')}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {selectedOrder.shippedAt && (
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">Shipped</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatDate(selectedOrder.shippedAt)}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {selectedOrder.deliveredAt && (
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">Delivered</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatDate(selectedOrder.deliveredAt)}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {/* Order Information Cards */}
              <Box sx={{ px: 3, mb: 3 }}>
                <Grid container spacing={3}>
                  {/* Order Details Card */}
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          📄 Order Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Order ID:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              #{selectedOrder._id?.slice(-8)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Date:</Typography>
                            <Typography variant="body2">{formatDate(selectedOrder.createdAt)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
                            <Typography variant="body2">{selectedOrder.paymentMethod || 'Cash on Delivery'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Payment Status:</Typography>
                            <Chip
                              label={getPaymentStatusText(selectedOrder)}
                              color={isOrderPaid(selectedOrder) ? 'success' : 'warning'}
                              size="small"
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Shipping Details Card */}
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          🚚 Shipping Details
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>Shipping Address:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {selectedOrder.user?.name || 'Customer Name Not Available'}
                          </Typography>
                          <Typography variant="body2">
                            {selectedOrder.shippingAddress?.street || 'No street address provided'}
                          </Typography>
                          <Typography variant="body2">
                            {[
                              selectedOrder.shippingAddress?.city,
                              selectedOrder.shippingAddress?.state,
                              selectedOrder.shippingAddress?.zipCode
                            ].filter(Boolean).join(', ') || 'City, State, ZIP not provided'}
                          </Typography>
                          <Typography variant="body2">
                            {selectedOrder.shippingAddress?.country || 'Bangladesh'}
                          </Typography>
                          {selectedOrder.user?.phone && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              📞 {selectedOrder.user.phone}
                            </Typography>
                          )}
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={selectedOrder.isDelivered ? '✅ Delivered' : '🚚 In Transit'}
                              color={selectedOrder.isDelivered ? 'success' : 'info'}
                              size="small"
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Order Summary Card */}
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          💰 Order Summary
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Items ({selectedOrder.orderItems?.length}):</Typography>
                            <Typography variant="body2">৳{formatPrice(selectedOrder.itemsPrice || 0)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Shipping:</Typography>
                            <Typography variant="body2">৳{formatPrice(selectedOrder.shippingPrice || 0)}</Typography>
                          </Box>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total:</Typography>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                              ৳{formatPrice(selectedOrder.totalPrice || 0)}
                            </Typography>
                          </Box>
                          {selectedOrder.discount > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography variant="body2" color="success.main">Discount Applied:</Typography>
                              <Typography variant="body2" color="success.main">
                                -৳{formatPrice(selectedOrder.discount || 0)}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* Order Items Section */}
              <Box sx={{ px: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🛍️ Ordered Items ({selectedOrder.orderItems?.length || 0})
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Unit Price</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.orderItems?.map((item, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                src={getImageUrl(item)}
                                sx={{ width: 60, height: 60 }}
                                variant="rounded"
                              />
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                  {getProductName(item)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  SKU: {item.product?._id || item._id || 'N/A'}
                                </Typography>
                                {getProductCategory(item) && (
                                  <Chip 
                                    label={getProductCategory(item)} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ mt: 0.5 }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {getQuantity(item)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1">৳{formatPrice(item.price)}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              ৳{formatPrice(getQuantity(item) * parseFloat(item.price || 0))}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Order Tracking Section */}
              {selectedOrder?.trackingNumber && (
                <Box sx={{ px: 3, mb: 3 }}>
                  <Card variant="outlined" sx={{ bgcolor: 'primary.light', borderColor: 'primary.main' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        🚚 Shipping & Tracking
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">Tracking Number:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                            {selectedOrder.trackingNumber}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">Carrier:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {selectedOrder.shippingCarrier || 'Standard Delivery'}
                          </Typography>
                        </Grid>
                        {selectedOrder.estimatedDelivery && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">Estimated Delivery:</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {formatDate(selectedOrder.estimatedDelivery)}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {/* Customer Notes Section */}
              {selectedOrder.notes && (
                <Box sx={{ px: 3, mb: 3 }}>
                  <Card variant="outlined" sx={{ bgcolor: 'info.light', borderColor: 'info.main' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        📝 Customer Notes
                      </Typography>
                      <Typography variant="body2">
                        {selectedOrder.notes}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: 'grey.50', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={() => setOrderDetailsOpen(false)}
                variant="outlined"
                size="large"
              >
                Close
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ReceiptIcon />}
                size="large"
                onClick={() => generateOrderPDF(selectedOrder)}
              >
                Download Receipt
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                size="large"
                onClick={() => {
                  // Refresh order details
                  dispatch(getMyOrdersAsync());
                }}
              >
                Refresh
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedOrder?.status === 'pending' && (
                <Button
                  color="error"
                  variant="contained"
                  startIcon={<CancelIcon />}
                  size="large"
                  onClick={() => {
                    setOrderDetailsOpen(false);
                    handleCancelOrder(selectedOrder);
                  }}
                >
                  Cancel Order
                </Button>
              )}
              
              {selectedOrder?.status === 'delivered' && !selectedOrder?.isReviewed && (
                <Button
                  color="primary"
                  variant="contained"
                  size="large"
                  onClick={() => {
                    // TODO: Implement review functionality
                    console.log('Write review for order:', selectedOrder?._id);
                  }}
                >
                  Write Review
                </Button>
              )}
              
              {(selectedOrder?.status === 'shipped' || selectedOrder?.status === 'delivered') && selectedOrder?.trackingNumber && (
                <Button
                  color="info"
                  variant="contained"
                  size="large"
                  onClick={() => {
                    // TODO: Implement tracking functionality
                    console.log('Track order:', selectedOrder?.trackingNumber);
                  }}
                >
                  Track Package
                </Button>
              )}
            </Box>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Cancel Order Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel order #{orderToCancel?._id?.slice(-8)}?
            This action cannot be undone.
          </Typography>
          {orderToCancel && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2">Order Details:</Typography>
              <Typography variant="body2">Total: ৳{orderToCancel.totalPrice?.toFixed(2)}</Typography>
              <Typography variant="body2">Items: {orderToCancel.orderItems?.length}</Typography>
              <Typography variant="body2">Date: {formatDate(orderToCancel.createdAt)}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Order</Button>
          <Button onClick={confirmCancelOrder} color="error" variant="contained">
            Cancel Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderList;
