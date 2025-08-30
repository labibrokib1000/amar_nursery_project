import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import { 
  ShoppingCart as ShoppingCartIcon, 
  Favorite, 
  FavoriteBorder 
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync, selectCartLoading } from '../../features/cart/cartSlice';
import { selectUser, selectToken } from '../../features/auth/authSlice';
import api from '../../utils/api';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-10px)',
  },
}));

const ProductImage = styled(CardMedia)(({ theme }) => ({
  height: 200,
  position: 'relative',
  overflow: 'hidden',
  '& img': {
    transition: 'transform 0.5s ease',
  },
  '&:hover img': {
    transform: 'scale(1.1)',
  },
}));

const Price = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 700,
  fontSize: '1.2rem',
}));

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const cartLoading = useSelector(selectCartLoading);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const {
    _id,
    name,
    description,
    price,
    images,
    stock,
  } = product;

  // Get image URL with fallback - handle both old (product.image) and new (product.images[]) formats
  const getImageUrl = () => {
    if (images && images.length > 0 && images[0]?.url) {
      return images[0].url;
    } else if (product.image) {
      // Ensure we return a string
      if (typeof product.image === 'string') {
        return product.image;
      } else if (product.image.url) {
        return product.image.url;
      }
    }
    return 'https://via.placeholder.com/300x200?text=No+Image';
  };

  const imageUrl = getImageUrl();

  // Check wishlist status when component mounts or user/token changes
  useEffect(() => {
    if (user && token && _id) {
      checkWishlistStatus();
    }
  }, [user, token, _id]);

  const checkWishlistStatus = async () => {
    try {
      const response = await api.wishlistAPI.checkWishlistStatus(_id, token);
      setIsInWishlist(response.isInWishlist);
    } catch (error) {
      console.error('Check wishlist status error:', error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      setToastMessage('Please login to add items to wishlist');
      setToastSeverity('warning');
      setShowToast(true);
      return;
    }

    try {
      setWishlistLoading(true);
      
      if (isInWishlist) {
        await api.wishlistAPI.removeFromWishlist(_id, token);
        setIsInWishlist(false);
        setToastMessage('Product removed from wishlist');
      } else {
        await api.wishlistAPI.addToWishlist(_id, token);
        setIsInWishlist(true);
        setToastMessage('Product added to wishlist');
      }
      
      setToastSeverity('success');
      setShowToast(true);
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      setToastMessage(error.message || 'Failed to update wishlist');
      setToastSeverity('error');
      setShowToast(true);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      setToastMessage('Please login to add items to cart');
      setToastSeverity('warning');
      setShowToast(true);
      return;
    }

    try {
      await dispatch(addToCartAsync({ productId: _id, quantity: 1 })).unwrap();
      setToastMessage('Product added to cart successfully!');
      setToastSeverity('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage(error || 'Failed to add product to cart');
      setToastSeverity('error');
      setShowToast(true);
    }
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  return (
    <>
      <StyledCard>
        {/* Wishlist Button */}
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
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          color={isInWishlist ? "error" : "default"}
        >
          {wishlistLoading ? (
            <CircularProgress size={20} />
          ) : isInWishlist ? (
            <Favorite />
          ) : (
            <FavoriteBorder />
          )}
        </IconButton>

        <ProductImage
          component="img"
          src={imageUrl}
          alt={name}
          sx={{ 
            height: 200,
            objectFit: 'cover',
            width: '100%'
          }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
            e.target.onerror = () => {
              e.target.src = '/plant.svg'; // Final fallback
              e.target.onerror = null; // Prevent infinite loop
            };
          }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="h3">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {description}
          </Typography>
          <Price>৳{price}</Price>
          <Typography 
            variant="body2" 
            color={stock > 0 ? "success.main" : "error.main"}
            sx={{ mt: 1 }}
          >
            {stock > 0 ? 'In Stock' : 'Out of Stock'}
          </Typography>
        </CardContent>
        <CardActions>
          <Button 
            size="small" 
            variant="contained"
            disabled={stock === 0 || cartLoading}
            fullWidth
            startIcon={cartLoading ? <CircularProgress size={16} /> : <ShoppingCartIcon />}
            onClick={handleAddToCart}
          >
            {cartLoading ? 'Adding...' : 'Add to Cart'}
          </Button>
          <Button
            size="small"
            component={RouterLink}
            to={`/product/${_id}`}
            variant="outlined"
            fullWidth
          >
            View Details
          </Button>
        </CardActions>
      </StyledCard>

      <Snackbar
        open={showToast}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toastSeverity} 
          sx={{ 
            width: '100%',
            minWidth: '300px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
            '&.MuiAlert-standardSuccess': {
              backgroundColor: '#4caf50',
              color: '#ffffff',
              '& .MuiAlert-icon': {
                color: '#ffffff',
              },
              '& .MuiAlert-action .MuiIconButton-root': {
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }
            }
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductCard;
