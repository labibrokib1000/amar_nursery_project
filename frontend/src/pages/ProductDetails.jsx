import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardMedia,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
} from '@mui/material';
import { ShoppingCart, Favorite, FavoriteBorder, Close } from '@mui/icons-material';
import dataService from '../utils/dataService';
import api from '../utils/api';
import { addToCartAsync } from '../features/cart/cartSlice';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { user, token } = useSelector((state) => state.auth);
  const { loading: cartLoading } = useSelector((state) => state.cart);
  
  // Local state
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Helper function to get image URL from either format
  const getImageUrl = (index = 0) => {
    if (product?.images && product.images.length > 0) {
      return product.images[index]?.url || product.images[0]?.url;
    } else if (product?.image) {
      return product.image;
    }
    return '/plant.svg'; // Fallback to default image
  };

  // Get all images for display
  const getAllImages = () => {
    if (product?.images && product.images.length > 0) {
      return product.images;
    } else if (product?.image) {
      return [{ url: product.image, public_id: 'legacy' }];
    }
    return [{ url: '/plant.svg', public_id: 'default' }];
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && user && token) {
      checkWishlistStatus();
    }
  }, [product, user, token]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const productData = await dataService.getProduct(id);
      setProduct(productData);
      setError('');
    } catch (err) {
      setError(err.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const response = await api.wishlistAPI.checkWishlistStatus(product._id, token);
      setIsInWishlist(response.isInWishlist);
    } catch (error) {
      console.error('Check wishlist status error:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      setToastMessage('Please login to add items to cart');
      setToastOpen(true);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (product.stock === 0) {
      setToastMessage('Product is out of stock');
      setToastOpen(true);
      return;
    }

    try {
      setAddingToCart(true);
      await dispatch(addToCartAsync({ 
        productId: product._id, 
        quantity: 1 
      })).unwrap();
      
      setToastMessage('Product added to cart successfully!');
      setToastOpen(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToastMessage(error || 'Failed to add product to cart');
      setToastOpen(true);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      setToastMessage('Please login to add items to wishlist');
      setToastOpen(true);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    try {
      setWishlistLoading(true);
      
      if (isInWishlist) {
        await api.wishlistAPI.removeFromWishlist(product._id, token);
        setIsInWishlist(false);
        setToastMessage('Product removed from wishlist');
      } else {
        await api.wishlistAPI.addToWishlist(product._id, token);
        setIsInWishlist(true);
        setToastMessage('Product added to wishlist');
      }
      
      setToastOpen(true);
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      setToastMessage(error.message || 'Failed to update wishlist');
      setToastOpen(true);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Product not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={getImageUrl(selectedImage)}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
              onError={(e) => {
                console.log('Image failed to load, using fallback:', e.target.src);
                e.target.src = '/plant.svg';
                e.target.onerror = null; // Prevent infinite error loop
              }}
            />
          </Card>
          {getAllImages().length > 1 && (
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              {getAllImages().map((image, index) => (
                <Card
                  key={index}
                  sx={{
                    cursor: 'pointer',
                    border: selectedImage === index ? 2 : 0,
                    borderColor: 'primary.main',
                  }}
                  onClick={() => setSelectedImage(index)}
                >
                  <CardMedia
                    component="img"
                    height="80"
                    width="80"
                    image={image.url}
                    alt={`${product.name} ${index + 1}`}
                    sx={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/plant.svg';
                      e.target.onerror = null; // Prevent infinite error loop
                    }}
                  />
                </Card>
              ))}
            </Box>
          )}
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {product.name}
          </Typography>

          <Typography variant="h5" color="primary" sx={{ mb: 3, fontWeight: 'bold' }}>
            ৳{product.price.toLocaleString()}
          </Typography>

          <Typography variant="body1" paragraph>
            {product.description}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Chip
              label={product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              color={product.stock > 0 ? 'success' : 'error'}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Category: {product.category?.name || 'Unknown'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCart />}
              disabled={product.stock === 0 || addingToCart}
              fullWidth
              onClick={handleAddToCart}
            >
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button
              variant={isInWishlist ? "contained" : "outlined"}
              size="large"
              startIcon={wishlistLoading ? <CircularProgress size={20} /> : (isInWishlist ? <Favorite /> : <FavoriteBorder />)}
              disabled={wishlistLoading}
              onClick={handleWishlistToggle}
              color={isInWishlist ? "error" : "primary"}
              sx={{ minWidth: '140px' }}
            >
              {wishlistLoading ? 'Loading...' : (isInWishlist ? 'In Wishlist' : 'Add to Wishlist')}
            </Button>
          </Box>

          {/* Care Instructions */}
          {product.careInstructions && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Care Instructions
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(product.careInstructions).map(([key, value]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Grid>
      </Grid>

      {/* Toast Notification */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        message={toastMessage}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#4caf50', // Green background
            color: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
            minWidth: '300px',
            fontSize: '0.9rem',
            fontWeight: 500,
          },
          '& .MuiSnackbarContent-message': {
            padding: '0',
          },
        }}
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
  );
};

export default ProductDetails;
