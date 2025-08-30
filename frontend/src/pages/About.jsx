import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';

const About = () => {
  return (
    <Box sx={{ 
      py: 6,
      background: 'linear-gradient(135deg, #f8fffe 0%, #f1f8e9 50%, #e8f5e8 100%)',
      minHeight: '100vh'
    }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          align="center"
          sx={{
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
            mb: 4,
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
          }}
        >
          About AmarNursery
        </Typography>
        <Grid container spacing={6} sx={{ mt: 2 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{
                color: '#2e7d32',
                fontWeight: 700,
                mb: 3
              }}
            >
              Our Story
            </Typography>
            <Typography 
              paragraph
              sx={{
                fontSize: '1.1rem',
                lineHeight: 1.8,
                color: '#388e3c',
                mb: 3
              }}
            >
              AmarNursery was founded in 2025 with a simple mission: to help people bring more 
              greenery into their lives and spaces. What started as a small nursery has grown 
              into a thriving online plant shop serving customers across the country.
            </Typography>
            <Typography 
              paragraph
              sx={{
                fontSize: '1.1rem',
                lineHeight: 1.8,
                color: '#388e3c',
                mb: 3
              }}
            >
              We believe that plants make life better. They purify our air, boost our mood, 
              and create beautiful, living spaces. Our team of plant experts carefully selects 
              and nurtures each plant to ensure it arrives at your doorstep healthy and ready to thrive.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src="https://thumbs.dreamstime.com/b/man-hands-holding-green-young-plant-22685129.jpg"
              alt="Our Nursery"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(76, 175, 80, 0.2)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 15px 35px rgba(76, 175, 80, 0.3)',
                },
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default About;
