import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const Contact = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          Contact Us
        </Typography>
        {/* Add your contact content here */}
      </Container>
    </Box>
  );
};

export default Contact;
