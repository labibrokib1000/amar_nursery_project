import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  Chip,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  ShoppingCart,
  Favorite,
  Person,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  Store as StoreIcon,
  Info as InfoIcon,
  AdminPanelSettings as AdminIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { logout, selectUser } from '../../features/auth/authSlice';
import { selectCartItemsCount } from '../../features/cart/cartSlice';
import Search from '../Search';

// Animations
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.6)',
  backdropFilter: 'blur(15px)',
  WebkitBackdropFilter: 'blur(15px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.1)',
  },
}));

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  color: theme.palette.primary.main,
  textDecoration: 'none',
  fontSize: '1.8rem',
  letterSpacing: '-0.5px',
  display: 'flex',
  alignItems: 'center',
  transition: 'transform 0.3s ease',
  flexGrow: 1,
  '& span': {
    color: theme.palette.success.main,
    fontWeight: 600,
  },
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

// Animated Hamburger Menu Button
const HamburgerButton = styled(IconButton)(({ theme, open }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.1)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '50%',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
    opacity: open ? 1 : 0,
    transition: 'opacity 0.3s ease',
    zIndex: -1,
  },
  '& .MuiSvgIcon-root': {
    transition: 'all 0.3s ease',
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
  },
}));

// Enhanced Drawer with animations
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    backgroundColor: theme.palette.background.default,
    width: 320,
    borderLeft: `1px solid ${theme.palette.divider}`,
    background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
    animation: `${slideIn} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
    overflow: 'auto', // Enable scrolling
    display: 'flex',
    flexDirection: 'column',
  },
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
  },
}));

// Animated Menu Items
const AnimatedListItem = styled(ListItem)(({ theme, delay = 0 }) => ({
  borderRadius: theme.spacing(1.5),
  marginBottom: theme.spacing(0.5),
  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  animation: `${fadeIn} 0.5s ease ${delay * 0.1}s both`,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateX(8px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  '&.active': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.contrastText,
    },
    '& .MuiListItemText-root': {
      '& .MuiTypography-root': {
        fontWeight: 600,
      },
    },
  },
}));

const UserSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.success.main}15)`,
  borderRadius: theme.spacing(2),
  margin: theme.spacing(2),
  animation: `${fadeIn} 0.6s ease 0.2s both`,
  border: `1px solid ${theme.palette.divider}`,
}));

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const cartItemsCount = useSelector(selectCartItemsCount);

  // Check if we're on products page or product details page
  const isProductsPage = location.pathname.startsWith('/products');

  const menuItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Products', path: '/products', icon: <StoreIcon /> },
    { text: 'About', path: '/about', icon: <InfoIcon /> },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    setMobileOpen(false);
    navigate('/');
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
  };

  const handleSearchClose = () => {
    setShowSearch(false);
  };

  return (
    <>
      <StyledAppBar position="sticky">
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: 1 }}>
            <Logo 
              component={RouterLink} 
              to="/" 
              variant="h6"
              onClick={() => {
                // Navigate to home page and scroll to top
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }}
            >
              Amar<span>Nursery</span>
            </Logo>

            {/* Search Section - Shows on products page */}
            {isProductsPage && (
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                mx: 2,
                transition: 'all 0.3s ease'
              }}>
                {showSearch ? (
                  <Box sx={{ 
                    display: { xs: 'none', md: 'block' }, // Only show on desktop
                    width: '100%'
                  }}>
                    <Search key="desktop-search" onClose={handleSearchClose} />
                  </Box>
                ) : (
                  <IconButton
                    onClick={handleSearchToggle}
                    sx={{
                      bgcolor: 'rgba(76, 175, 80, 0.15)', // Light green background
                      color: '#4CAF50', // Green icon
                      border: '2px solid rgba(76, 175, 80, 0.3)',
                      borderRadius: '50%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'rgba(76, 175, 80, 0.25)', // Darker green on hover
                        color: '#2E7D32',
                        borderColor: 'rgba(76, 175, 80, 0.5)',
                        transform: 'scale(1.1)',
                        boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                      },
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                )}
              </Box>
            )}

            <HamburgerButton
              open={mobileOpen}
              onClick={handleDrawerToggle}
              aria-label="toggle menu"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </HamburgerButton>
          </Toolbar>
        </Container>
        
        {/* Search Bar Expansion for Mobile */}
        <Collapse in={showSearch && isProductsPage}>
          <Container maxWidth="lg">
            <Box sx={{ 
              pb: 2, 
              px: 2,
              display: { xs: 'block', md: 'none' } // Only show on mobile
            }}>
              <Search key="mobile-search" onClose={handleSearchClose} />
            </Box>
          </Container>
        </Collapse>
      </StyledAppBar>

      {/* Unified Animated Menu Drawer */}
      <StyledDrawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          overflow: 'hidden' 
        }}>
          {/* Header Section */}
          <Box sx={{ 
            p: 3, 
            display: 'flex', 
            justifyContent: 'center', 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            flexShrink: 0
          }}>
            <Logo 
              component={RouterLink} 
              to="/" 
              variant="h5" 
              onClick={(e) => {
                handleDrawerToggle();
                // Navigate to home page and scroll to top
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }}
            >
              Amar<span>Nursery</span>
            </Logo>
          </Box>

          {/* Scrollable Content */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* User Section */}
            {user && (
              <UserSection>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 50,
                      height: 50,
                      bgcolor: 'primary.main',
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      mr: 2,
                    }}
                  >
                    {user.name[0].toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {user.name}
                    </Typography>
                    <Chip 
                      label={user.role || 'User'} 
                      size="small" 
                      color={user.role === 'admin' ? 'secondary' : 'primary'}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                </Box>
              </UserSection>
            )}

            {/* Navigation Menu */}
            <Box sx={{ flex: 1, px: 2, py: 1 }}>
              <List>
              {menuItems.map((item, index) => (
                <AnimatedListItem
                  key={item.text}
                  delay={index}
                  className={location.pathname === item.path ? 'active' : ''}
                  onClick={() => handleMenuItemClick(item.path)}
                  sx={{ cursor: 'pointer' }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '1.1rem',
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    }}
                  />
                </AnimatedListItem>
              ))}

              {/* Cart Item */}
              <AnimatedListItem
                delay={menuItems.length}
                onClick={() => handleMenuItemClick('/cart')}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Badge badgeContent={cartItemsCount} color="error">
                    <ShoppingCart />
                  </Badge>
                </ListItemIcon>
                <ListItemText 
                  primary="Shopping Cart"
                  primaryTypographyProps={{
                    fontSize: '1.1rem',
                    fontWeight: 400,
                  }}
                />
                {cartItemsCount > 0 && (
                  <Chip 
                    label={cartItemsCount} 
                    size="small" 
                    color="error"
                    sx={{ ml: 1 }}
                  />
                )}
              </AnimatedListItem>

              {/* Wishlist Item */}
              <AnimatedListItem
                delay={menuItems.length + 1}
                onClick={() => handleMenuItemClick('/wishlist')}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Favorite />
                </ListItemIcon>
                <ListItemText 
                  primary="Wishlist"
                  primaryTypographyProps={{
                    fontSize: '1.1rem',
                    fontWeight: 400,
                  }}
                />
              </AnimatedListItem>

              <Divider sx={{ my: 2 }} />

              {/* User Actions */}
              {user ? (
                <>
                  <AnimatedListItem
                    delay={menuItems.length + 2}
                    onClick={() => handleMenuItemClick('/user-profile')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Person />
                    </ListItemIcon>
                    <ListItemText 
                      primary="My Profile"
                      primaryTypographyProps={{
                        fontSize: '1.1rem',
                        fontWeight: 400,
                      }}
                    />
                  </AnimatedListItem>

                  <AnimatedListItem
                    delay={menuItems.length + 3}
                    onClick={() => handleMenuItemClick('/orders')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <ShoppingCart />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Order History"
                      primaryTypographyProps={{
                        fontSize: '1.1rem',
                        fontWeight: 400,
                      }}
                    />
                  </AnimatedListItem>

                  {user.role === 'admin' && (
                    <>
                      <AnimatedListItem
                        delay={menuItems.length + 3}
                        onClick={() => handleMenuItemClick('/admin')}
                        sx={{ cursor: 'pointer' }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <AdminIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Admin Dashboard"
                          primaryTypographyProps={{
                            fontSize: '1.1rem',
                            fontWeight: 400,
                          }}
                        />
                      </AnimatedListItem>

                      <AnimatedListItem
                        delay={menuItems.length + 4}
                        onClick={() => handleMenuItemClick('/admin/users')}
                        sx={{ cursor: 'pointer' }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Person />
                        </ListItemIcon>
                        <ListItemText 
                          primary="User Management"
                          primaryTypographyProps={{
                            fontSize: '1.1rem',
                            fontWeight: 400,
                          }}
                        />
                      </AnimatedListItem>
                    </>
                  )}
                </>
              ) : (
                <>
                  <AnimatedListItem
                    delay={menuItems.length + 2}
                    onClick={() => handleMenuItemClick('/login')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <LoginIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Login"
                      primaryTypographyProps={{
                        fontSize: '1.1rem',
                        fontWeight: 400,
                      }}
                    />
                  </AnimatedListItem>

                  <AnimatedListItem
                    delay={menuItems.length + 3}
                    onClick={() => handleMenuItemClick('/register')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Person />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Register"
                      primaryTypographyProps={{
                        fontSize: '1.1rem',
                        fontWeight: 400,
                      }}
                    />
                  </AnimatedListItem>
                </>
              )}
            </List>
          </Box>
          </Box>

          {/* Logout Button for Authenticated Users - Fixed positioning */}
          {user && (
            <Box sx={{ 
              p: 3, 
              borderTop: '1px solid', 
              borderColor: 'divider',
              flexShrink: 0,
              backgroundColor: 'background.paper'
            }}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  animation: `${fadeIn} 0.6s ease 0.4s both`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          )}
        </Box>
      </StyledDrawer>
    </>
  );
};

export default Header;
