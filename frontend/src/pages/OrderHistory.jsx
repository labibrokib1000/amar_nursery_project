import React from 'react';
import { Container, Typography, Box, Breadcrumbs, Link } from '@mui/material';
import { Home as HomeIcon, ShoppingBag as OrderIcon } from '@mui/icons-material';
import OrderList from '../components/orders/OrderList';

const OrderHistory = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Link href="/user-profile" color="inherit">
          Profile
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <OrderIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Order History
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Order History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all your orders in one place
        </Typography>
      </Box>

      {/* Order List */}
      <OrderList />
    </Container>
  );
};

export default OrderHistory;
