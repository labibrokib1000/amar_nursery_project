import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Snackbar
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  Delete,
  RemoveShoppingCart
} from '@mui/icons-material';
import api from '../utils/api';
import { addToCartAsync } from '../features/cart/cartSlice';
import { useDispatch } from 'react-redux';

const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  
  // Local state
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingItems, setRemovingItems] = useState(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch wishlist on component mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [user, navigate]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.wishlistAPI.getWishlist(token);
      setWishlistItems(response.wishlist || []);
    } catch (error) {
      console.error('Fetch wishlist error:', error);
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      setRemovingItems(prev => new Set(prev).add(productId));
      await api.wishlistAPI.removeFromWishlist(productId, token);
      
      // Update local state
      setWishlistItems(prev => prev.filter(item => item.product._id !== productId));
      
      showSnackbar('Product removed from wishlist', 'success');
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      showSnackbar('Failed to remove product from wishlist', 'error');
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleClearWishlist = async () => {
    try {
      setLoading(true);
      await api.wishlistAPI.clearWishlist(token);
      setWishlistItems([]);
      showSnackbar('Wishlist cleared successfully', 'success');
    } catch (error) {
      console.error('Clear wishlist error:', error);
      showSnackbar('Failed to clear wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await dispatch(addToCartAsync({
        productId: product._id,
        quantity: 1
      })).unwrap();
      
      showSnackbar(`${product.name} added to cart`, 'success');
    } catch (error) {
      console.error('Add to cart error:', error);
      showSnackbar('Failed to add to cart', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getImageUrl = (product) => {
    if (product.images && product.images.length > 0 && product.images[0]?.url) {
      return product.images[0].url;
    } else if (product.image) {
      return typeof product.image === 'string' ? product.image : product.image.url;
    }
    return '/plant.svg';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Wishlist
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {wishlistItems.length > 0 
            ? `You have ${wishlistItems.length} item${wishlistItems.length > 1 ? 's' : ''} in your wishlist`
            : 'Your wishlist is empty'
          }
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Clear Wishlist Button */}
      {wishlistItems.length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<RemoveShoppingCart />}
            onClick={handleClearWishlist}
            disabled={loading}
          >
            Clear Wishlist
          </Button>
        </Box>
      )}

      {/* Wishlist Items */}
      {wishlistItems.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <FavoriteBorder sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Your wishlist is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start adding products you love to your wishlist!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/products')}
            size="large"
          >
            Browse Products
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {wishlistItems.map((item) => {
            const product = item.product;
            const isRemoving = removingItems.has(product._id);
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    opacity: isRemoving ? 0.6 : 1,
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  {/* Remove from Wishlist Button */}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      zIndex: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                      }
                    }}
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    disabled={isRemoving}
                    color="error"
                  >
                    {isRemoving ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Favorite />
                    )}
                  </IconButton>

                  {/* Product Image */}
                  <CardMedia
                    component="img"
                    height="200"
                    image={getImageUrl(product)}
                    alt={product.name}
                    sx={{
                      objectFit: 'cover',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/products/${product._id}`)}
                  />

                  {/* Product Details */}
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' }
                      }}
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      {product.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {product.description?.substring(0, 100)}
                      {product.description?.length > 100 && '...'}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                        ৳{product.price?.toLocaleString()}
                      </Typography>
                      {product.category && (
                        <Chip
                          label={product.category.name}
                          size="small"
                          sx={{ ml: 1 }}
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Typography
                      variant="body2"
                      color={product.stock > 0 ? "success.main" : "error.main"}
                    >
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Added on {new Date(item.addedAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>

                  {/* Actions */}
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ShoppingCart />}
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0 || isRemoving}
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Wishlist;
