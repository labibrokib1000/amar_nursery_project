import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Pagination,
  Stack,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Snackbar,
} from '@mui/material';
import {
  Person,
  Email,
  ShoppingBag,
  Schedule,
  CheckCircle,
  LocalShipping,
  Cancel,
  Visibility,
  FilterList,
  Refresh,
  Close,
  Receipt,
  Download,
  CancelOutlined,
} from '@mui/icons-material';
import { selectUser } from '../features/auth/authSlice';
import {
  getMyOrdersAsync,
  selectOrders,
  selectOrderLoading,
  selectOrderError,
  cancelOrderAsync,
  clearError as clearOrderError,
  clearSuccessMessage,
  selectOrderSuccessMessage,
} from '../features/order/orderSlice';
import api from '../utils/api';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const user = useSelector(selectUser);
  const { token } = useSelector((state) => state.auth);
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);
  const successMessage = useSelector(selectOrderSuccessMessage);

  // User profile state for avatar and other details
  const [userProfile, setUserProfile] = useState(null);

  // State for enhanced orders functionality
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    dispatch(getMyOrdersAsync());
    fetchUserProfile(); // Fetch user profile including avatar
  }, [user, dispatch, navigate]);

  // Fetch user profile data including avatar
  const fetchUserProfile = async () => {
    if (!token) {
      console.warn('No authentication token available for fetching user profile');
      return;
    }
    
    try {
      const profile = await api.userAPI.getProfile(token);
      setUserProfile(profile);
      console.log('User profile fetched successfully:', profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Handle success messages
  useEffect(() => {
    if (successMessage) {
      setSnackbarMessage(successMessage);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      dispatch(clearOrderError());
    }
  }, [error, dispatch]);

  // Auto-refresh orders every 30 seconds if enabled
  useEffect(() => {
    let interval;
    if (autoRefresh && !loading) {
      interval = setInterval(() => {
        dispatch(getMyOrdersAsync());
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, loading, dispatch]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing':
        return <Schedule color="warning" />;
      case 'Shipped':
        return <LocalShipping color="info" />;
      case 'Delivered':
        return <CheckCircle color="success" />;
      case 'Cancelled':
        return <Cancel color="error" />;
      default:
        return <Schedule color="warning" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'warning';
      case 'Shipped':
        return 'info';
      case 'Delivered':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getImageUrl = (item) => {
    if (item.image) {
      // Ensure we return a string
      if (typeof item.image === 'string') {
        return item.image;
      } else if (item.image.url) {
        return item.image.url;
      } else if (Array.isArray(item.image) && item.image.length > 0) {
        return typeof item.image[0] === 'string' ? item.image[0] : item.image[0].url || '';
      }
    }
    return 'https://via.placeholder.com/60x60?text=No+Image';
  };

  // Filter and pagination functions
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.orderStatus.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.orderItems.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleCloseOrderDetails = () => {
    setOrderDetailsOpen(false);
    setSelectedOrder(null);
  };

  const handleRefreshOrders = () => {
    dispatch(getMyOrdersAsync());
  };

  // Debug function to test API directly
  const testOrderAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Testing order API. Token exists:', !!token);
      
      if (!token) {
        setSnackbarMessage('No authentication token found');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      // Test with direct fetch
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://amar-nursery-project-api.vercel.app/api'}/orders/user/myorders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Direct API test response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Direct API test error:', errorText);
        setSnackbarMessage(`API Error: ${response.status} - ${errorText}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      const data = await response.json();
      console.log('Direct API test success. Orders count:', data.length);
      console.log('Sample orders:', data.slice(0, 2));
      setSnackbarMessage(`API Test Success: Found ${data.length} orders`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // If we got orders but Redux state is empty, there might be a Redux issue
      if (data.length > 0 && orders.length === 0) {
        console.warn('Redux state issue: API returned orders but Redux state is empty');
        setSnackbarMessage(`Redux Issue: API has ${data.length} orders but state shows ${orders.length}`);
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
      }

    } catch (error) {
      console.error('Direct API test error:', error);
      setSnackbarMessage(`API Test Failed: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCancelOrder = (order) => {
    setOrderToCancel(order);
    setCancelConfirmOpen(true);
  };

  const handleCancelConfirm = () => {
    if (orderToCancel) {
      dispatch(cancelOrderAsync(orderToCancel._id));
      setCancelConfirmOpen(false);
      setOrderToCancel(null);
    }
  };

  const handleCancelOrderCancel = () => {
    setCancelConfirmOpen(false);
    setOrderToCancel(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const canCancelOrder = (order) => {
    return order.orderStatus === 'Processing' && !order.isPaid;
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ py: 4, minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>

        <Grid container spacing={4}>
          {/* User Information */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar 
                    sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}
                    src={userProfile?.profile?.avatar?.url || undefined}
                  >
                    {!userProfile?.profile?.avatar?.url && <Person />}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Customer
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Email sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography>{user.email}</Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Account Statistics
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Total Orders:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {orders.length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Pending:</Typography>
                  <Typography variant="body2" fontWeight={500} color="warning.main">
                    {orders.filter(order => order.orderStatus === 'Processing').length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Delivered:</Typography>
                  <Typography variant="body2" fontWeight={500} color="success.main">
                    {orders.filter(order => order.orderStatus === 'Delivered').length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Total Spent:</Typography>
                  <Typography variant="body2" fontWeight={500} color="primary.main">
                    ৳{orders.reduce((total, order) => total + order.totalPrice, 0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Enhanced Order History */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              {/* Header with filters */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShoppingBag sx={{ mr: 1 }} />
                  <Typography variant="h6">Order History</Typography>
                  <Chip 
                    label={filteredOrders.length} 
                    size="small" 
                    sx={{ ml: 1 }} 
                    color="primary"
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Test API Connection">
                    <Button variant="outlined" size="small" onClick={testOrderAPI}>
                      Test API
                    </Button>
                  </Tooltip>
                  <Tooltip title="Refresh Orders">
                    <span>
                      <IconButton onClick={handleRefreshOrders} disabled={loading}>
                        <Refresh />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Box>

              {/* Search and Filter Controls */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  sx={{ minWidth: 200, flex: 1 }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={handleStatusFilterChange}
                  >
                    <MenuItem value="all">All Orders</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="shipped">Shipped</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Debug Information */}
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="caption" display="block">
                  <strong>Debug Info:</strong> Orders count: {orders?.length || 0} | 
                  Loading: {loading ? 'Yes' : 'No'} | 
                  Error: {error ? 'Yes' : 'No'} | 
                  User: {user ? 'Logged in' : 'Not logged in'} |
                  API: {import.meta.env.VITE_API_URL || 'https://amar-nursery-project-api.vercel.app/api'}
                </Typography>
              </Alert>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3 }}
                  action={
                    <Button color="inherit" size="small" onClick={handleRefreshOrders}>
                      Retry
                    </Button>
                  }
                >
                  <Typography variant="body2">
                    <strong>Error loading orders:</strong> {error}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Please check your internet connection and try again. If the problem persists, 
                    try logging out and logging back in.
                  </Typography>
                </Alert>
              )}

              {/* Debug Information */}
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="caption" display="block">
                  <strong>Debug Info:</strong> Orders count: {orders?.length || 0} | 
                  Loading: {loading ? 'Yes' : 'No'} | 
                  Error: {error ? 'Yes' : 'No'} | 
                  User: {user ? 'Logged in' : 'Not logged in'}
                </Typography>
              </Alert>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredOrders.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ShoppingBag sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {orders.length === 0 ? 'No Orders Yet' : 'No Orders Found'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {orders.length === 0 
                      ? "You haven't placed any orders yet. Start shopping to see your orders here."
                      : "Try adjusting your search or filter criteria."
                    }
                  </Typography>
                  {orders.length === 0 && (
                    <Button
                      variant="contained"
                      onClick={() => navigate('/products')}
                    >
                      Browse Products
                    </Button>
                  )}
                </Box>
              ) : (
                <>
                  {/* Orders List */}
                  <List>
                    {paginatedOrders.map((order, index) => (
                      <React.Fragment key={order._id}>
                        <ListItem sx={{ px: 0, py: 2, flexDirection: 'column', alignItems: 'flex-start' }}>
                          {/* Order Header */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 2 }}>
                            <Box>
                              <Typography variant="h6" gutterBottom>
                                Order #{order._id.slice(-8)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Chip
                                icon={getStatusIcon(order.orderStatus)}
                                label={order.orderStatus}
                                color={getStatusColor(order.orderStatus)}
                                variant="outlined"
                                sx={{ mb: 1 }}
                              />
                              <Typography variant="h6" color="primary">
                                ৳{order.totalPrice}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Order Items Preview */}
                          <Box sx={{ width: '100%', mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Items ({order.orderItems.length}):
                            </Typography>
                            {order.orderItems.slice(0, 2).map((item, itemIndex) => (
                              <Box
                                key={itemIndex}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 1,
                                  p: 1,
                                  bgcolor: 'grey.50',
                                  borderRadius: 1,
                                }}
                              >
                                <Avatar
                                  variant="rounded"
                                  src={getImageUrl(item)}
                                  alt={item.name}
                                  sx={{ width: 40, height: 40, mr: 2 }}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" fontWeight={500}>
                                    {item.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Qty: {item.quantity} × ৳{item.price}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" fontWeight={500}>
                                  ৳{item.quantity * item.price}
                                </Typography>
                              </Box>
                            ))}
                            {order.orderItems.length > 2 && (
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                +{order.orderItems.length - 2} more items
                              </Typography>
                            )}
                          </Box>

                          {/* Status and Actions */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip
                                label={order.isPaid ? 'Paid' : 'Pending Payment'}
                                color={order.isPaid ? 'success' : 'warning'}
                                size="small"
                              />
                              <Chip
                                label={order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}
                                variant="outlined"
                                size="small"
                              />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Details">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleOrderDetails(order)}
                                  color="primary"
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download Receipt">
                                <IconButton size="small" color="primary">
                                  <Receipt />
                                </IconButton>
                              </Tooltip>
                              {canCancelOrder(order) && (
                                <Tooltip title="Cancel Order">
                                  <span>
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      onClick={() => handleCancelOrder(order)}
                                      disabled={loading}
                                    >
                                      <CancelOutlined />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        </ListItem>
                        {index < paginatedOrders.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Pagination 
                        count={totalPages} 
                        page={currentPage} 
                        onChange={(event, value) => setCurrentPage(value)}
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Order Details Modal */}
        <Dialog
          open={orderDetailsOpen}
          onClose={handleCloseOrderDetails}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Order Details #{selectedOrder?._id.slice(-8)}
            </Typography>
            <IconButton onClick={handleCloseOrderDetails}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Box>
                {/* Order Info */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>Order Information</Typography>
                    <Typography variant="body2">Order ID: #{selectedOrder._id}</Typography>
                    <Typography variant="body2">
                      Date: {new Date(selectedOrder.createdAt).toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                      <Typography variant="body2">Status:</Typography>
                      <Chip
                        icon={getStatusIcon(selectedOrder.orderStatus)}
                        label={selectedOrder.orderStatus}
                        color={getStatusColor(selectedOrder.orderStatus)}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                      <Typography variant="body2">Payment:</Typography>
                      <Chip
                        label={selectedOrder.isPaid ? 'Paid' : 'Pending Payment'}
                        color={selectedOrder.isPaid ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2">
                      Method: {selectedOrder.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>Shipping Information</Typography>
                    <Typography variant="body2">{selectedOrder.shippingAddress?.street}</Typography>
                    <Typography variant="body2">
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}
                    </Typography>
                    <Typography variant="body2">
                      {selectedOrder.shippingAddress?.zipCode}, {selectedOrder.shippingAddress?.country}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Order Items Table */}
                <Typography variant="subtitle2" gutterBottom>Order Items</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.orderItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                variant="rounded"
                                src={getImageUrl(item)}
                                alt={item.name}
                                sx={{ width: 40, height: 40, mr: 2 }}
                              />
                              <Typography variant="body2">{item.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">৳{item.price}</TableCell>
                          <TableCell align="right">৳{item.quantity * item.price}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>Total Amount:</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          ৳{selectedOrder.totalPrice}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseOrderDetails}>Close</Button>
            {selectedOrder && canCancelOrder(selectedOrder) && (
              <Button 
                color="error" 
                startIcon={<CancelOutlined />}
                onClick={() => {
                  handleCloseOrderDetails();
                  handleCancelOrder(selectedOrder);
                }}
                disabled={loading}
              >
                Cancel Order
              </Button>
            )}
            <Button variant="contained" startIcon={<Download />}>
              Download Receipt
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cancel Order Confirmation Dialog */}
        <Dialog
          open={cancelConfirmOpen}
          onClose={handleCancelOrderCancel}
          aria-labelledby="cancel-order-dialog-title"
          aria-describedby="cancel-order-dialog-description"
        >
          <DialogTitle id="cancel-order-dialog-title">
            Cancel Order?
          </DialogTitle>
          <DialogContent>
            <Typography id="cancel-order-dialog-description">
              Are you sure you want to cancel order #{orderToCancel?._id.slice(-8)}? 
              This action cannot be undone.
            </Typography>
            {orderToCancel && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Order Details:</Typography>
                <Typography variant="body2">Total Amount: ৳{orderToCancel.totalPrice}</Typography>
                <Typography variant="body2">Items: {orderToCancel.orderItems.length}</Typography>
                <Typography variant="body2">Status: {orderToCancel.orderStatus}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelOrderCancel} color="primary">
              Keep Order
            </Button>
            <Button 
              onClick={handleCancelConfirm} 
              color="error" 
              variant="contained"
              disabled={loading}
              startIcon={<CancelOutlined />}
            >
              {loading ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbarSeverity} 
            sx={{ width: '100%' }}
            variant="filled"
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Profile;
