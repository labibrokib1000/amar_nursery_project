import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
  ButtonGroup,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  ClearAll as ClearAllIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  selectCartItems, 
  selectCartTotal, 
  selectCartLoading,
  selectCartError,
  fetchCart,
  removeFromCartAsync,
  updateCartItemAsync,
  clearCartAsync,
  clearError,
} from '../features/cart/cartSlice';
import { selectUser } from '../features/auth/authSlice';
import { 
  fetchUserProfileAsync,
  selectUserProfile 
} from '../features/user/userProfileSlice';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const userProfile = useSelector(selectUserProfile);
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);

  // State for clear all confirmation dialog
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  // Calculate shipping cost based on user's address
  const calculateShippingCost = () => {
    // Use userProfile if available, fallback to user data
    const addresses = userProfile?.addresses || user?.addresses;
    
    if (!addresses || addresses.length === 0) {
      return 100; // Default shipping for users without saved addresses
    }
    
    // Get the default address or first address
    const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
    const district = defaultAddress?.division || defaultAddress?.district || defaultAddress?.state || '';
    
    // If district contains 'rajshahi', charge 50 tk, otherwise 100 tk
    if (district.toLowerCase().includes('rajshahi')) {
      return 50;
    }
    return 100;
  };

  const shippingCost = calculateShippingCost();

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
      // Fetch fresh user profile for accurate shipping calculation
      dispatch(fetchUserProfileAsync());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCartAsync(productId));
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
    } else {
      dispatch(updateCartItemAsync({ productId, quantity: newQuantity }));
    }
  };

  const handleCheckout = () => {
    // Check if user is logged in
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if cart has items
    if (cartItems.length === 0) {
      return;
    }
    
    navigate('/checkout');
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const handleClearAllClick = () => {
    setClearConfirmOpen(true);
  };

  const handleClearAllConfirm = () => {
    dispatch(clearCartAsync());
    setClearConfirmOpen(false);
  };

  const handleClearAllCancel = () => {
    setClearConfirmOpen(false);
  };

  const getImageUrl = (product) => {
    if (product?.images && product.images.length > 0 && product.images[0]?.url) {
      return product.images[0].url;
    }
    return 'https://via.placeholder.com/300x200?text=No+Image';
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <Box sx={{ py: 4, minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Shopping Cart
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            onClose={handleClearError}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {!loading && cartItems.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Your cart is empty
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Looks like you haven't added any plants to your cart yet.
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="/products"
              size="large"
            >
              Continue Shopping
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {/* Cart Items */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 2 
                }}>
                  <Typography variant="h6">
                    Cart Items ({cartItems.length})
                  </Typography>
                  {cartItems.length > 0 && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<ClearAllIcon />}
                      onClick={handleClearAllClick}
                      disabled={loading}
                    >
                      Clear All
                    </Button>
                  )}
                </Box>
                <List>
                  {cartItems.map((item, index) => (
                    <React.Fragment key={item.product._id}>
                      <ListItem sx={{ py: 2 }}>
                        <ListItemAvatar>
                          <Avatar
                            variant="rounded"
                            src={getImageUrl(item.product)}
                            alt={item.product.name}
                            sx={{ width: 80, height: 80, mr: 2 }}
                          />
                        </ListItemAvatar>
                        <Box sx={{ flex: 1, ml: 2 }}>
                          <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                            {item.product.name}
                          </Typography>
                          <Typography variant="body1" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
                            ৳{item.product.price}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2">Quantity:</Typography>
                            <ButtonGroup size="small" disabled={loading}>
                              <Button 
                                onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                              >
                                <RemoveIcon />
                              </Button>
                              <Button disabled sx={{ minWidth: 50 }}>
                                {item.quantity}
                              </Button>
                              <Button 
                                onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                              >
                                <AddIcon />
                              </Button>
                            </ButtonGroup>
                            <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 600 }}>
                              Subtotal: ৳{item.product.price * item.quantity}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton 
                          onClick={() => handleRemoveItem(item.product._id)}
                          disabled={loading}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                      {index < cartItems.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Order Summary */}
            <Grid item xs={12} md={4}>
              <Card sx={{ position: 'sticky', top: 100 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Order Summary
                  </Typography>
                  
                  {/* Shipping Info Alert */}
                  <Alert severity="info" sx={{ mb: 2, fontSize: '0.875rem' }}>
                    🚚 Shipping: Rajshahi ৳50 | Others ৳100
                    {user?.addresses && user.addresses.length > 0 && (
                      <Typography component="div" variant="caption" sx={{ mt: 0.5, color: shippingCost === 50 ? 'success.main' : 'warning.main' }}>
                        Current: ৳{shippingCost} (from your saved address)
                      </Typography>
                    )}
                  </Alert>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>৳{cartTotal}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>
                      Shipping:
                      {(userProfile?.addresses || user?.addresses) && (userProfile?.addresses?.length > 0 || user?.addresses?.length > 0) && (
                        <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          (Based on saved address)
                        </Typography>
                      )}
                    </Typography>
                    <Typography>৳{shippingCost}</Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary">
                      ৳{cartTotal + shippingCost}
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleCheckout}
                    disabled={loading || cartItems.length === 0}
                    sx={{ mb: 2 }}
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    component={RouterLink}
                    to="/products"
                  >
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>

      {/* Clear All Confirmation Dialog */}
      <Dialog
        open={clearConfirmOpen}
        onClose={handleClearAllCancel}
        aria-labelledby="clear-all-dialog-title"
        aria-describedby="clear-all-dialog-description"
      >
        <DialogTitle id="clear-all-dialog-title">
          Clear All Items?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="clear-all-dialog-description">
            Are you sure you want to remove all items from your cart? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearAllCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleClearAllConfirm} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Cart;
