import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Grid, Card, CardContent, CircularProgress, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import dataService from '../utils/dataService';

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(165deg, 
    ${theme.palette.success.light}99 0%, 
    ${theme.palette.success.main}77 30%,
    #66bb6a99 60%,
    ${theme.palette.success.dark}88 100%), 
    url("https://images.unsplash.com/photo-1487147264018-f937fba0c817")`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  color: 'white',
  padding: theme.spacing(12, 0),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, rgba(46, 125, 50, 0.2) 100%)',
    zIndex: 1,
  },
  '& > *': {
    position: 'relative',
    zIndex: 2,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '30px',
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  background: `linear-gradient(45deg, #4caf50, #2e7d32)`,
  color: theme.palette.common.white,
  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.6)',
    background: `linear-gradient(45deg, #66bb6a, #388e3c)`,
  },
}));

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🏠 Home: Loading data from backend API only...');
        console.log('🔗 API URL:', import.meta.env.VITE_API_URL);
        
        // Fetch data from backend only
        const [productsData, categoriesData] = await Promise.all([
          dataService.getProducts({ pageSize: 20 }), // Increased to get more products for featured filtering
          dataService.getCategories()
        ]);

        console.log('🏠 Home: Products data:', productsData);
        console.log('🏠 Home: Categories data:', categoriesData);

        const productsArray = productsData.products || productsData;
        setProducts(productsArray);
        setCategories(categoriesData);
        
        // Log featured products for debugging
        const featuredProducts = productsArray.filter(product => product.featured);
        console.log(`🌟 Featured products found: ${featuredProducts.length}`, featuredProducts.map(p => ({
          name: p.name,
          featured: p.featured,
          id: p._id
        })));
        
        console.log('✅ Home: Data loaded successfully');
      } catch (error) {
        console.error('❌ Home: Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading plants...</Typography>
      </Container>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="md">
          <Typography 
            variant="h1" 
            gutterBottom
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
            }}
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 800,
              textShadow: '3px 3px 6px rgba(0, 0, 0, 0.5)',
              mb: 3,
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                textShadow: '4px 4px 10px rgba(0, 0, 0, 0.7)',
                filter: 'brightness(1.1)',
              },
              '&:active': {
                transform: 'scale(0.98)',
              }
            }}
          >
            🌱 Welcome to AmarNursery
          </Typography>
          <Typography 
            variant="h4" 
            sx={{
              fontSize: { xs: '1.5rem', md: '2.2rem' },
              fontWeight: 500,
              textShadow: '3px 3px 8px rgba(0, 0, 0, 0.6)',
              maxWidth: '900px',
              mx: 'auto',
              mb: 4,
              lineHeight: 1.4,
              color: '#ffffff',
              fontStyle: 'italic',
              letterSpacing: '1px',
              animation: 'fadeInUp 2s ease-out',
              position: 'relative',
              '&::before': {
                content: '"🌿"',
                position: 'absolute',
                left: { xs: '-30px', md: '-50px' },
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: { xs: '1.5rem', md: '2rem' },
                animation: 'bounce 3s infinite',
              },
              '&::after': {
                content: '"🏡"',
                position: 'absolute',
                right: { xs: '-30px', md: '-50px' },
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: { xs: '1.5rem', md: '2rem' },
                animation: 'bounce 3s infinite 0.5s',
              },
              '@keyframes fadeInUp': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(30px)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
              '@keyframes bounce': {
                '0%, 20%, 50%, 80%, 100%': {
                  transform: 'translateY(-50%) translateY(0)',
                },
                '40%': {
                  transform: 'translateY(-50%) translateY(-10px)',
                },
                '60%': {
                  transform: 'translateY(-50%) translateY(-5px)',
                },
              },
            }}
          >
            Bring nature to your Doorstep
          </Typography>
          <StyledButton
            component={RouterLink}
            to="/products"
          >
            Explore Our Collection
          </StyledButton>
        </Container>
      </HeroSection>

      {/* Main Content */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #f8fffe 0%, #f1f8e9 50%, #e8f5e8 100%)',
        minHeight: '100vh',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 30%, rgba(76, 175, 80, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(46, 125, 50, 0.03) 0%, transparent 50%)',
          zIndex: 1,
        },
      }}>
        <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
        
        {/* Categories Section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" gutterBottom align="center" sx={{
            background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
            color: 'white',
            borderRadius: '50px',
            padding: '16px 40px',
            display: 'inline-block',
            fontWeight: 600,
            boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
            position: 'relative',
            left: '50%',
            transform: 'translateX(-50%)',
            border: '3px solid rgba(255, 255, 255, 0.2)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-3px',
              left: '-3px',
              right: '-3px',
              bottom: '-3px',
              background: 'linear-gradient(45deg, #66bb6a, #388e3c)',
              borderRadius: '50px',
              zIndex: -1,
            }
          }}>
            Plant Categories
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} md={3} key={category._id}>
                <Card 
                  component={RouterLink}
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  onClick={() => {
                    // Scroll to top when category is clicked
                    setTimeout(() => {
                      window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                      });
                    }, 100);
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 50%, #e0f2e0 100%)',
                    border: '2px solid #c8e6c8',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    display: 'block',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #dcedc8 0%, #f1f8e9 50%, #c5e1a5 100%)',
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 30px rgba(76, 175, 80, 0.3)',
                      borderColor: '#66bb6a',
                    },
                    '&:active': {
                      transform: 'translateY(-4px)',
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h6" sx={{ 
                      color: '#2e7d32', 
                      fontWeight: 600,
                      mb: 2,
                      fontSize: '1.1rem'
                    }}>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: '#388e3c',
                      lineHeight: 1.6
                    }}>
                      {category.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Featured Products Section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" gutterBottom align="center" sx={{
            background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
            color: 'white',
            borderRadius: '50px',
            padding: '16px 40px',
            display: 'inline-block',
            fontWeight: 600,
            boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
            position: 'relative',
            left: '50%',
            transform: 'translateX(-50%)',
            border: '3px solid rgba(255, 255, 255, 0.2)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-3px',
              left: '-3px',
              right: '-3px',
              bottom: '-3px',
              background: 'linear-gradient(45deg, #66bb6a, #388e3c)',
              borderRadius: '50px',
              zIndex: -1,
            }
          }}>
            Featured Plants
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {products.filter(product => product.featured).length > 0 ? (
              products.filter(product => product.featured).map((featuredProduct) => {
                // Helper function to get product image URL
                const getProductImageUrl = (product) => {
                  if (product.images && product.images.length > 0) {
                    return product.images[0].url;
                  } else if (product.image) {
                    return product.image;
                  }
                  return '/plant.svg'; // Fallback to default local image
                };

                return (
                  <Grid item xs={12} sm={6} md={3} key={featuredProduct._id}>
                    <Card sx={{
                      background: 'linear-gradient(135deg, #f8fffe 0%, #f1f8e9 50%, #e8f5e8 100%)',
                      border: '2px solid #c8e6c8',
                      borderRadius: '16px',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #e8f5e8 0%, #dcedc8 50%, #c5e1a5 100%)',
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 30px rgba(76, 175, 80, 0.25)',
                        borderColor: '#81c784',
                      }
                    }}>
                      {/* Featured Badge */}
                      <Box sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'linear-gradient(45deg, #ff9800, #f57c00)',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        zIndex: 1,
                        boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)'
                      }}>
                        ⭐ FEATURED
                      </Box>
                      
                      {/* Product Image */}
                      {getProductImageUrl(featuredProduct) !== '/plant.svg' && (
                        <Box
                          component="img"
                          src={getProductImageUrl(featuredProduct)}
                          alt={featuredProduct.name}
                          sx={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                            borderTopLeftRadius: '14px',
                            borderTopRightRadius: '14px',
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: getProductImageUrl(featuredProduct) === '/plant.svg' ? 4 : 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ 
                          color: '#2e7d32', 
                          fontWeight: 600,
                          textAlign: 'center',
                          mb: 2
                        }}>
                          {featuredProduct.name}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#388e3c',
                          lineHeight: 1.6,
                          flexGrow: 1,
                          mb: 2,
                          textAlign: 'center'
                        }}>
                          {featuredProduct.description && featuredProduct.description.length > 100 
                            ? `${featuredProduct.description.substring(0, 100)}...`
                            : featuredProduct.description || 'Beautiful plant perfect for your home garden.'
                          }
                        </Typography>
                        <Box sx={{ textAlign: 'center', mt: 'auto' }}>
                          <Typography variant="h6" sx={{ 
                            color: '#2e7d32',
                            fontWeight: 700,
                            fontSize: '1.2rem',
                            mb: 1
                          }}>
                            ৳{featuredProduct.price}
                          </Typography>
                          {featuredProduct.category && (
                            <Typography variant="caption" sx={{ 
                              color: '#4caf50',
                              backgroundColor: '#e8f5e8',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontWeight: 500
                            }}>
                              {typeof featuredProduct.category === 'object' 
                                ? featuredProduct.category.name 
                                : featuredProduct.category
                              }
                            </Typography>
                          )}
                          
                          {/* Stock Status */}
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" sx={{ 
                              color: featuredProduct.stock > 0 ? '#2e7d32' : '#d32f2f',
                              backgroundColor: featuredProduct.stock > 0 ? '#e8f5e8' : '#ffebee',
                              padding: '2px 8px',
                              borderRadius: '8px',
                              fontSize: '0.7rem',
                              fontWeight: 500
                            }}>
                              {featuredProduct.stock > 0 
                                ? `${featuredProduct.stock} in stock` 
                                : 'Out of stock'
                              }
                            </Typography>
                          </Box>
                          
                          {/* View Product Button */}
                          <Button
                            component={RouterLink}
                            to={`/product/${featuredProduct._id}`}
                            variant="contained"
                            size="small"
                            sx={{
                              mt: 2,
                              background: 'linear-gradient(45deg, #4caf50, #2e7d32)',
                              color: 'white',
                              borderRadius: '20px',
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              padding: '6px 16px',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #66bb6a, #388e3c)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
                              }
                            }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            ) : (
              // Show message when no featured products are available
              <Grid item xs={12}>
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 6,
                  background: 'linear-gradient(135deg, #f8fffe 0%, #f1f8e9 50%, #e8f5e8 100%)',
                  borderRadius: '16px',
                  border: '2px dashed #c8e6c8'
                }}>
                  <Typography variant="h6" sx={{ color: '#388e3c', mb: 1 }}>
                    🌿 No Featured Plants Yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4caf50', mb: 2 }}>
                    Our team is currently selecting the best plants to feature. Check back soon!
                  </Typography>
                  <Button
                    component={RouterLink}
                    to="/products"
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(45deg, #4caf50, #2e7d32)',
                      color: 'white',
                      borderRadius: '25px',
                      textTransform: 'none',
                      fontWeight: 600,
                      padding: '8px 24px',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #66bb6a, #388e3c)',
                      }
                    }}
                  >
                    Browse All Plants
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
