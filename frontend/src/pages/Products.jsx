import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Box, Container, Typography, Grid, CircularProgress, Alert, Chip } from '@mui/material';
import ProductCard from '../components/products/ProductCard';
import api from '../utils/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults();
    } else {
      fetchProducts();
    }
  }, [searchQuery]);

  useEffect(() => {
    // Filter products when category changes or products are loaded
    if (selectedCategory && products.length > 0) {
      const filtered = products.filter(product => 
        product.category === selectedCategory || 
        (typeof product.category === 'object' && product.category.name === selectedCategory)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.productAPI.getProducts();
      
      setProducts(data.products || data); // Handle both API response formats
      setError('');
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const data = await api.productAPI.searchProducts(searchQuery);
      
      setProducts(data.products || []); 
      setError('');
    } catch (err) {
      console.error('❌ Error searching products:', err);
      setError(err.message || 'Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          {searchQuery 
            ? `Plants named "${searchQuery}"` 
            : selectedCategory 
              ? `${selectedCategory}` 
              : 'Our Plants Collection'
          }
        </Typography>
        
        {searchQuery && (
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Plants matching "{searchQuery}":
            </Typography>
            <Chip 
              label={`${filteredProducts.length} ${filteredProducts.length === 1 ? 'plant' : 'plants'} found`}
              color="primary"
              variant="outlined"
              sx={{ 
                fontWeight: 600,
              }}
            />
          </Box>
        )}
        
        {selectedCategory && !searchQuery && (
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Showing plants in category:
            </Typography>
            <Chip 
              label={selectedCategory}
              color="success"
              variant="outlined"
              sx={{ 
                fontWeight: 600,
                borderColor: '#4caf50',
                color: '#2e7d32'
              }}
            />
            <Typography variant="body2" color="text.secondary">
              ({filteredProducts.length} {filteredProducts.length === 1 ? 'plant' : 'plants'} found)
            </Typography>
          </Box>
        )}

        {filteredProducts.length === 0 && !loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {searchQuery 
                ? `No plants found with name containing "${searchQuery}"` 
                : selectedCategory 
                  ? `No plants found in "${selectedCategory}" category` 
                  : 'No plants available'
              }
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Products;
