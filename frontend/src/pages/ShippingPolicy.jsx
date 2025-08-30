import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  LocalShipping,
  Schedule,
  Payment,
  Security,
  LocationOn,
} from '@mui/icons-material';

const ShippingPolicy = () => {
  const articles = [
    {
      title: "Shipping Methods",
      content: [
        "Standard Shipping (3-7 days): Careful packaging for regular orders.",
        "Express Shipping (1-3 days): For time-sensitive deliveries.",
        "Local Delivery: Same-day within 25km radius."
      ],
      icon: <LocalShipping color="primary" />
    },
    {
      title: "Delivery Guidelines",
      content: [
        "Processing time: 1-2 business days for plant health check.",
        "Tracking provided for orders above ৳500.",
        "Delivery attempts during 9 AM - 6 PM business hours."
      ],
      icon: <Schedule color="primary" />
    },
    {
      title: "Shipping Costs",
      content: [
        "Free shipping on orders over ৳1,500 within Bangladesh.",
        "Inside Rajshahi: ৳50 standard delivery.",
        "Outside Rajshahi: ৳100 standard delivery."
      ],
      icon: <Payment color="primary" />
    },
    {
      title: "Plant Safety",
      content: [
        "Health inspection before packaging.",
        "Breathing packaging for air circulation.",
        "Live arrival guarantee with replacement policy."
      ],
      icon: <Security color="primary" />
    },
    {
      title: "Delivery Areas",
      content: [
        "All major cities and towns across Bangladesh.",
        "Remote areas may have extended delivery times.",
        "Seasonal restrictions for extreme weather."
      ],
      icon: <LocationOn color="primary" />
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Shipping Policy
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Affordable delivery across Bangladesh - ৳50 in Rajshahi, ৳100 outside
          </Typography>
          <Divider sx={{ my: 3 }} />
        </Box>

        <Grid container spacing={4}>
          {articles.map((article, index) => (
            <Grid item xs={12} key={index}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  mb: 3,
                  '&:hover': {
                    elevation: 4,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {article.icon}
                  <Typography variant="h5" component="h2" sx={{ ml: 2, fontWeight: 600 }}>
                    {article.title}
                  </Typography>
                </Box>
                <List>
                  {article.content.map((point, pointIndex) => (
                    <ListItem key={pointIndex} sx={{ py: 0.5 }}>
                      <ListItemIcon>
                        <Box 
                          sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            bgcolor: 'primary.main' 
                          }} 
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={point}
                        sx={{ 
                          '& .MuiListItemText-primary': {
                            fontSize: '1rem',
                            lineHeight: 1.6
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.light', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="primary.contrastText">
            Need Help with Shipping?
          </Typography>
          <Typography variant="body1" color="primary.contrastText">
            Contact our customer service team at <strong>info@amarnursery.com</strong> or call 
            <strong> +880 1755163782</strong> for any shipping-related questions.
          </Typography>
        </Box>
      </Container>
  );
};

export default ShippingPolicy;
