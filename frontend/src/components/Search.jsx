import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Chip,
  CircularProgress,
  Fade,
  Popper,
  ClickAwayListener
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../utils/api';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(232, 245, 233, 0.95)',
    borderRadius: '25px',
    border: '2px solid #4CAF50',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(200, 230, 201, 0.95)',
      borderColor: '#388E3C',
      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(200, 230, 201, 0.95)',
      borderColor: '#2E7D32',
      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
    },
    '& fieldset': {
      border: 'none',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '12px 0px',
    color: '#2E7D32',
    '&::placeholder': {
      color: '#4CAF50',
      opacity: 0.8,
    },
  },
}));

const SearchResultsPopper = styled(Popper)(({ theme }) => ({
  zIndex: theme.zIndex.modal,
  width: '100%',
  maxWidth: '500px',
  marginTop: '8px',
}));

const SearchResultsPaper = styled(Paper)(({ theme }) => ({
  maxHeight: '400px',
  overflow: 'auto',
  boxShadow: '0 8px 32px rgba(76, 175, 80, 0.2)',
  borderRadius: '12px',
  border: '2px solid #4CAF50',
  backgroundColor: 'rgba(232, 245, 233, 0.98)',
}));

const SearchItem = styled(ListItem)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(200, 230, 201, 0.6)',
    borderLeft: '4px solid #4CAF50',
    paddingLeft: '16px',
  },
  borderBottom: '1px solid rgba(76, 175, 80, 0.2)',
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const Search = ({ onClose }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [popularSearches] = useState([
    'Aloe Vera', 'Rose', 'Mint', 'Orchid', 'Fiddle Leaf Fig'
  ]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Focus on search input when component mounts or becomes visible
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          inputRef.current.focus();
        }, 100);
      }
    };
    
    focusInput();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await api.productAPI.searchProducts(searchQuery.trim());
      setSearchResults(response.products || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    
    if (value.trim().length === 0) {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
    handleClose();
  };

  const handlePopularSearchClick = (query) => {
    setSearchQuery(query);
    navigate(`/products?search=${encodeURIComponent(query)}`);
    handleClose();
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    if (onClose) onClose();
  };

  const handleClickAway = () => {
    setShowResults(false);
  };

  const getImageUrl = (product) => {
    if (product.images && product.images.length > 0 && product.images[0]?.url) {
      return product.images[0].url;
    } else if (product.image) {
      return typeof product.image === 'string' ? product.image : product.image.url;
    }
    return '/plant.svg';
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box ref={searchRef} sx={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
        <form onSubmit={handleSearchSubmit}>
          <StyledTextField
            ref={inputRef}
            fullWidth
            placeholder="Search plants by name..."
            value={searchQuery}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#4CAF50' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {loading && <CircularProgress size={20} sx={{ color: '#4CAF50' }} />}
                  {(searchQuery || onClose) && (
                    <IconButton
                      size="small"
                      onClick={handleClose}
                      edge="end"
                      sx={{ 
                        color: '#4CAF50',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        }
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
          />
        </form>

        <SearchResultsPopper
          open={showResults && (searchResults.length > 0 || searchQuery.length >= 2)}
          anchorEl={searchRef.current}
          placement="bottom-start"
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 8],
              },
            },
          ]}
        >
          <Fade in={showResults}>
            <SearchResultsPaper>
              <List disablePadding>
                {searchResults.length > 0 ? (
                  <>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" color="text.secondary">
                            Plants matching your search
                          </Typography>
                        }
                      />
                    </ListItem>
                    {searchResults.slice(0, 8).map((product) => (
                      <SearchItem
                        key={product._id}
                        onClick={() => handleProductClick(product._id)}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={getImageUrl(product)}
                            alt={product.name}
                            variant="rounded"
                            sx={{ width: 50, height: 50 }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" noWrap>
                              {product.name}
                            </Typography>
                          }
                          secondary={
                            <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Typography variant="body2" color="primary" fontWeight="bold">
                                ৳{product.price?.toLocaleString()}
                              </Typography>
                              {product.category && (
                                <Chip
                                  label={product.category.name}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              <Typography 
                                variant="caption" 
                                color={product.stock > 0 ? "success.main" : "error.main"}
                              >
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                              </Typography>
                            </Box>
                          }
                        />
                      </SearchItem>
                    ))}
                    {searchResults.length > 8 && (
                      <SearchItem onClick={() => {
                        navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
                        handleClose();
                      }}>
                        <ListItemText
                          primary={
                            <Typography variant="body2" color="primary" sx={{ textAlign: 'center' }}>
                              View all {searchResults.length} results
                            </Typography>
                          }
                        />
                      </SearchItem>
                    )}
                  </>
                ) : searchQuery.length >= 2 && !loading ? (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                          No plants found with name "{searchQuery}"
                        </Typography>
                      }
                    />
                  </ListItem>
                ) : null}

                {/* Popular Searches */}
                {searchQuery.length < 2 && (
                  <>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingIcon fontSize="small" color="action" />
                            <Typography variant="subtitle2" color="text.secondary">
                              Popular Searches
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {popularSearches.map((search, index) => (
                      <SearchItem
                        key={index}
                        onClick={() => handlePopularSearchClick(search)}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              {search}
                            </Typography>
                          }
                        />
                      </SearchItem>
                    ))}
                  </>
                )}
              </List>
            </SearchResultsPaper>
          </Fade>
        </SearchResultsPopper>
      </Box>
    </ClickAwayListener>
  );
};

export default Search;
