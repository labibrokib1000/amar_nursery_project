import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Checkbox,
} from '@mui/material';
import {
  ArrowBack,
  ShoppingCart,
  LocalShipping,
  Payment,
  CheckCircle,
  Close,
} from '@mui/icons-material';
import { selectCartItems, selectCartTotal, clearCartAsync } from '../features/cart/cartSlice';
import { selectUser } from '../features/auth/authSlice';
import {
  createOrderAsync,
  selectOrder,
  selectOrderLoading,
  selectOrderError,
  selectOrderSuccessMessage,
  clearError,
  clearSuccessMessage,
} from '../features/order/orderSlice';
import {
  fetchUserProfileAsync,
  selectUserProfile,
  selectUserProfileLoading,
  selectUserProfileError,
  clearError as clearUserProfileError,
  addUserAddressAsync
} from '../features/user/userProfileSlice';

const steps = ['Shipping Information', 'Payment Method', 'Place Order'];

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const user = useSelector(selectUser);
  const userProfile = useSelector(selectUserProfile);
  const userProfileLoading = useSelector(selectUserProfileLoading);
  const userProfileError = useSelector(selectUserProfileError);
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const order = useSelector(selectOrder);
  const orderLoading = useSelector(selectOrderLoading);
  const orderError = useSelector(selectOrderError);
  const successMessage = useSelector(selectOrderSuccessMessage);

  // Local state
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [addressAutoFilled, setAddressAutoFilled] = useState(false);
  const [showAddressOptions, setShowAddressOptions] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  
  // Shipping form state
  const [shippingForm, setShippingForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Bangladesh',
  });

  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Calculate shipping cost based on district
  const calculateShippingCost = useCallback((district) => {
    if (!district) return 100; // Default if no district specified
    
    // Normalize district name for comparison (handle case variations)
    const normalizedDistrict = district.toLowerCase().trim();
    
    // If district contains 'rajshahi', charge 50 tk, otherwise 100 tk
    if (normalizedDistrict.includes('rajshahi')) {
      return 50;
    }
    return 100;
  }, []);

  // Get current shipping cost
  const currentShippingCost = calculateShippingCost(shippingForm.state);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    // Fetch fresh user profile data from backend
    dispatch(fetchUserProfileAsync());
  }, [user, cartItems.length, dispatch, navigate]);

  // Auto-fill address when user profile is loaded
  useEffect(() => {
    if (userProfile && userProfile.addresses && userProfile.addresses.length > 0 && !addressAutoFilled) {
      const defaultAddress = userProfile.addresses.find(addr => addr.isDefault) || userProfile.addresses[0];
      if (defaultAddress) {
        setShippingForm({
          street: defaultAddress.street || defaultAddress.fullAddress || '',
          city: defaultAddress.city || '', // This is Upazilla in our Bangladesh format
          state: defaultAddress.district || '', // This is District in our Bangladesh format
          zipCode: defaultAddress.zipCode || defaultAddress.postalCode || '',
          country: defaultAddress.country || 'Bangladesh',
        });
        setAddressAutoFilled(true);
        setToastMessage(`Address auto-filled from your profile: ${defaultAddress.street || defaultAddress.fullAddress}`);
        setToastOpen(true);
      }
    }
  }, [userProfile]); // Removed addressAutoFilled from dependencies since we check it inside

  useEffect(() => {
    if (orderError) {
      setToastMessage(orderError);
      setToastOpen(true);
      dispatch(clearError());
    }
  }, [orderError, dispatch]);

  useEffect(() => {
    if (successMessage) {
      setShowSuccessDialog(true);
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, dispatch]);

  const handleShippingFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setShippingForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // If user manually edits, it's no longer auto-filled
    if (addressAutoFilled) {
      setAddressAutoFilled(false);
    }
  }, [formErrors, addressAutoFilled]);

  const handleSelectAddress = useCallback((address) => {
    setShippingForm({
      street: address.street || address.fullAddress || '',
      city: address.city || '', // This is Upazilla in our Bangladesh format
      state: address.district || '', // This is District in our Bangladesh format
      zipCode: address.zipCode || '',
      country: address.country || 'Bangladesh',
    });
    setShowAddressOptions(false);
    setAddressAutoFilled(true);
    setToastMessage('Address selected successfully');
    setToastOpen(true);
  }, []);

  const handleClearAddress = useCallback(() => {
    setShippingForm({
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Bangladesh',
    });
    setAddressAutoFilled(false);
    setShowAddressOptions(false);
    setToastMessage('Address cleared - you can now enter a new address');
    setToastOpen(true);
  }, []);

  const validateShippingForm = () => {
    const errors = {};
    
    if (!shippingForm.street.trim()) errors.street = 'Street address is required';
    if (!shippingForm.city.trim()) errors.city = 'Upazilla is required';
    if (!shippingForm.state.trim()) errors.state = 'District is required';
    if (!shippingForm.zipCode.trim()) errors.zipCode = 'ZIP code is required';
    if (!shippingForm.country.trim()) errors.country = 'Country is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!validateShippingForm()) {
        setToastMessage('Please fill in all required shipping information');
        setToastOpen(true);
        return;
      }
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePlaceOrder = async () => {
    try {
      // Save address if user selected the option and it's not auto-filled
      if (saveAddress && !addressAutoFilled) {
        try {
          await dispatch(addUserAddressAsync({
            street: shippingForm.street,
            city: shippingForm.city,
            division: shippingForm.state, // Using division for district
            zipCode: shippingForm.zipCode,
            country: shippingForm.country,
            isDefault: false // User can set default later in profile
          })).unwrap();
          
          setToastMessage('Address saved to your profile!');
          setToastOpen(true);
        } catch (addressError) {
          console.error('Failed to save address:', addressError);
          // Don't stop order placement if address save fails
        }
      }

      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          image: item.product.images?.[0]?.url || item.product.image || '',
          price: item.product.price
        })),
        shippingAddress: shippingForm,
        paymentMethod: paymentMethod,
        itemsPrice: cartTotal,
        shippingPrice: currentShippingCost,
        totalPrice: cartTotal + currentShippingCost
      };

      const newOrder = await dispatch(createOrderAsync(orderData)).unwrap();
      
      // If payment method is card, simulate payment process
      if (paymentMethod === 'card') {
        // Simulate payment processing
        setTimeout(async () => {
          try {
            await dispatch(updateOrderToPayAsync({
              orderId: newOrder._id,
              paymentResult: {
                id: `PAY_${Date.now()}`,
                status: 'COMPLETED',
                update_time: new Date().toISOString(),
                email_address: user.email
              }
            }));
          } catch (paymentError) {
            console.error('Payment update failed:', paymentError);
          }
        }, 2000);
      }
      
      // Clear the cart after successful order
      await dispatch(clearCartAsync());
    } catch (error) {
      console.error('Order creation failed:', error);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    navigate('/profile'); // Navigate to profile to see orders
  };

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  const getImageUrl = (product) => {
    if (product?.images && product.images.length > 0 && product.images[0]?.url) {
      return product.images[0].url;
    }
    return 'https://via.placeholder.com/60x60?text=No+Image';
  };

  const shippingPrice = 50;
  const totalPrice = cartTotal + shippingPrice;

  if (!user || cartItems.length === 0) {
    return null;
  }

  const renderShippingForm = () => (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Shipping Information
        </Typography>
        {(userProfile?.addresses && userProfile.addresses.length > 0) ? (
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowAddressOptions(!showAddressOptions)}
            disabled={userProfileLoading}
          >
            {showAddressOptions ? 'Hide' : 'Select'} Saved Address ({userProfile.addresses.length})
          </Button>
        ) : userProfileLoading ? (
          <CircularProgress size={20} />
        ) : null}
      </Box>

      {/* Show info message if user has no saved addresses */}
      {(!userProfile?.addresses || userProfile.addresses.length === 0) && !userProfileLoading && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
        >
          💡 <strong>Tip:</strong> Save this address to your profile for faster checkout next time!
        </Alert>
      )}

      {addressAutoFilled && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleClearAddress}
            >
              Clear & Edit
            </Button>
          }
        >
          ✅ <strong>Address auto-filled</strong> from your profile. You can edit the fields below or select a different address.
        </Alert>
      )}

      {/* Profile loading indicator */}
      {userProfileLoading && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          icon={<CircularProgress size={20} />}
        >
          Loading your profile addresses...
        </Alert>
      )}

      {/* Profile error */}
      {userProfileError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => dispatch(clearUserProfileError())}
        >
          Error loading addresses: {userProfileError}
        </Alert>
      )}

      {/* Shipping Cost Information */}
      <Alert 
        severity="info" 
        sx={{ mb: 3 }}
      >
        🚚 <strong>Shipping Costs:</strong> Rajshahi District - ৳50 | Other Districts - ৳100
        {shippingForm.state && (
          <Typography component="span" sx={{ ml: 1, fontWeight: 600, color: currentShippingCost === 50 ? 'success.main' : 'warning.main' }}>
            (Current: ৳{currentShippingCost} for {shippingForm.state})
          </Typography>
        )}
      </Alert>

      {showAddressOptions && userProfile?.addresses && userProfile.addresses.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom>
            Select from saved addresses:
          </Typography>
          {userProfile.addresses.map((address, index) => (
            <Card
              key={index}
              sx={{
                mb: 1,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'primary.light', color: 'white' },
                border: address.isDefault ? 2 : 1,
                borderColor: address.isDefault ? 'primary.main' : 'divider'
              }}
              onClick={() => handleSelectAddress(address)}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {address.street || address.fullAddress}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {address.city ? `${address.city}, ` : ''}{address.district ? `${address.district}, ` : ''}{address.zipCode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {address.country}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip
                      label={address.type}
                      size="small"
                      color={address.isDefault ? 'primary' : 'default'}
                    />
                    {address.isDefault && (
                      <Chip
                        label="Default"
                        size="small"
                        color="success"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            name="street"
            label="Street Address"
            value={shippingForm.street}
            onChange={handleShippingFormChange}
            error={!!formErrors.street}
            helperText={formErrors.street}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            name="city"
            label="Upazilla"
            value={shippingForm.city}
            onChange={handleShippingFormChange}
            error={!!formErrors.city}
            helperText={formErrors.city}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            name="state"
            label="District"
            value={shippingForm.state}
            onChange={handleShippingFormChange}
            error={!!formErrors.state}
            helperText={formErrors.state}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            name="zipCode"
            label="ZIP / Postal Code"
            value={shippingForm.zipCode}
            onChange={handleShippingFormChange}
            error={!!formErrors.zipCode}
            helperText={formErrors.zipCode}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            name="country"
            label="Country"
            value={shippingForm.country}
            onChange={handleShippingFormChange}
            error={!!formErrors.country}
            helperText={formErrors.country}
          />
        </Grid>
      </Grid>

      {!addressAutoFilled && (
        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                color="primary"
              />
            }
            label="Save this address for future orders"
          />
        </Box>
      )}
    </Paper>
  );

  const renderPaymentMethod = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Payment Method
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose how you would like to pay for your order
      </Typography>
      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          sx={{ gap: 2 }}
        >
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              border: paymentMethod === 'cash' ? 2 : 1,
              borderColor: paymentMethod === 'cash' ? 'primary.main' : 'divider',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              }
            }}
            onClick={() => setPaymentMethod('cash')}
          >
            <FormControlLabel
              value="cash"
              control={<Radio />}
              sx={{ width: '100%', m: 0 }}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <LocalShipping sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Cash On Delivery
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pay when your order is delivered to your doorstep. No advance payment required.
                    </Typography>
                    <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                      ✓ Safe and secure • ✓ No hidden charges
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              border: paymentMethod === 'card' ? 2 : 1,
              borderColor: paymentMethod === 'card' ? 'primary.main' : 'divider',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              }
            }}
            onClick={() => setPaymentMethod('card')}
          >
            <FormControlLabel
              value="card"
              control={<Radio />}
              sx={{ width: '100%', m: 0 }}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Payment sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Proceed to Pay
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pay now using card, mobile banking (bKash, Nagad), or other digital methods.
                    </Typography>
                    <Typography variant="body2" color="info.main" sx={{ mt: 0.5 }}>
                      ✓ Instant confirmation • ✓ Multiple payment options
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Paper>
        </RadioGroup>

        {paymentMethod === 'card' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            You will be redirected to our secure payment page after placing the order.
          </Alert>
        )}
      </FormControl>
    </Paper>
  );

  const renderOrderSummary = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>
      
      {/* Order Items */}
      <List>
        {cartItems.map((item) => (
          <ListItem key={item.product._id} sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar
                variant="rounded"
                src={getImageUrl(item.product)}
                alt={item.product.name}
                sx={{ width: 60, height: 60 }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={item.product.name}
              secondary={`Qty: ${item.quantity} × ৳${item.product.price}`}
              sx={{ ml: 2 }}
            />
            <Typography variant="body1" fontWeight={500}>
              ৳{item.product.price * item.quantity}
            </Typography>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Price Breakdown */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography>Subtotal:</Typography>
        <Typography>৳{cartTotal}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography>
          Shipping:
          {shippingForm.state && (
            <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
              ({shippingForm.state === 'Rajshahi' || shippingForm.state.toLowerCase().includes('rajshahi') ? 'Rajshahi District' : 'Other District'})
            </Typography>
          )}
        </Typography>
        <Typography>৳{currentShippingCost}</Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Total:</Typography>
        <Typography variant="h6" color="primary">
          ৳{cartTotal + currentShippingCost}
        </Typography>
      </Box>
    </Paper>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderShippingForm();
      case 1:
        return renderPaymentMethod();
      case 2:
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Your Order
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review your order details before placing the order.
            </Typography>
            
            {/* Shipping Address Review */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                Shipping Address:
              </Typography>
              <Typography variant="body2">
                {shippingForm.street}<br />
                {shippingForm.city}, {shippingForm.state} {shippingForm.zipCode}<br />
                {shippingForm.country}
              </Typography>
            </Box>
            
            {/* Payment Method Review */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                Payment Method:
              </Typography>
              <Typography variant="body2">
                {paymentMethod === 'cash' ? 'Cash On Delivery' : 'Online Payment'}
              </Typography>
            </Box>
            
            {renderOrderSummary()}
          </Paper>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ py: 4, minHeight: '80vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={() => navigate('/cart')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            Checkout
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {renderStepContent(activeStep)}
            
            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handlePlaceOrder}
                  disabled={orderLoading}
                  startIcon={orderLoading ? <CircularProgress size={20} /> : <CheckCircle />}
                  size="large"
                >
                  {orderLoading ? 'Placing Order...' : 'Place Order'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  size="large"
                >
                  Next
                </Button>
              )}
            </Box>
          </Grid>

          {/* Order Summary Sidebar */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 100 }}>
              <CardContent>
                {renderOrderSummary()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Success Dialog */}
        <Dialog
          open={showSuccessDialog}
          onClose={handleSuccessDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h5">Order Placed Successfully!</Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" textAlign="center" sx={{ mb: 2 }}>
              Thank you for your order! We've received your order and will process it shortly.
            </Typography>
            {order && (
              <Typography variant="body2" textAlign="center" color="text.secondary">
                Order ID: {order._id}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
            <Button
              variant="contained"
              onClick={handleSuccessDialogClose}
              size="large"
            >
              View My Orders
            </Button>
          </DialogActions>
        </Dialog>

        {/* Toast Notification */}
        <Snackbar
          open={toastOpen}
          autoHideDuration={4000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            '& .MuiSnackbarContent-root': {
              backgroundColor: toastMessage.includes('auto-filled') || toastMessage.includes('selected') 
                ? '#4caf50' 
                : '#f44336',
              color: '#ffffff',
              borderRadius: '12px',
              boxShadow: toastMessage.includes('auto-filled') || toastMessage.includes('selected')
                ? '0 4px 12px rgba(76, 175, 80, 0.3)'
                : '0 4px 12px rgba(244, 67, 54, 0.3)',
              minWidth: '300px',
              fontSize: '0.9rem',
              fontWeight: 500,
            },
          }}
          message={toastMessage}
          action={
            <IconButton
              size="small"
              aria-label="close"
              sx={{ 
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
              onClick={handleCloseToast}
            >
              <Close fontSize="small" />
            </IconButton>
          }
        />
      </Container>
    </Box>
  );
};

export default Checkout;
