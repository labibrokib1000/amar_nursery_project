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
  Alert,
} from '@mui/material';
import {
  AssignmentReturn,
  Schedule,
  CheckCircle,
  Cancel,
  AccountBalance,
} from '@mui/icons-material';

const ReturnPolicy = () => {
  const articles = [
    {
      title: "24-Hour Return Guarantee",
      content: [
        "24-hour return policy for all live tree and plant purchases.",
        "Return window starts from delivery timestamp.",
        "Immediate reporting required for damaged or diseased trees."
      ],
      icon: <Schedule color="primary" />
    },
    {
      title: "Eligible Items for Return",
      content: [
        "Trees arriving damaged, diseased, or dying.",
        "Plant accessories in unused condition (24 hours).",
        "Special order trees with visible shipping damage."
      ],
      icon: <CheckCircle color="primary" />
    },
    {
      title: "Non-Returnable Items",
      content: [
        "Trees reported after 24-hour window.",
        "Trees that have been repotted or modified.",
        "Clearance sale items (marked as final sale)."
      ],
      icon: <Cancel color="secondary" />
    },
    {
      title: "Return Process",
      content: [
        "Contact us within 24 hours with order number and photos.",
        "Receive return authorization within 2 hours.",
        "Follow specialized tree return instructions."
      ],
      icon: <AssignmentReturn color="primary" />
    },
    {
      title: "Refunds & Exchanges",
      content: [
        "Full refund within 3-5 business days for valid claims.",
        "Store credit with 10% bonus value available.",
        "Emergency replacement trees for immediate needs."
      ],
      icon: <AccountBalance color="primary" />
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Return Policy
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
            24-hour return policy for live trees and plants - immediate action required
          </Typography>
          <Divider sx={{ my: 3 }} />
        </Box>

        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="body1">
            <strong>URGENT - 24 Hour Policy:</strong> Since we sell live trees and plants, you must contact us within 24 hours of delivery 
            for any return requests. Trees are living organisms that change rapidly after delivery, making it difficult to assess 
            shipping-related issues after this window.
          </Typography>
        </Alert>

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

        <Box sx={{ mt: 4, p: 3, bgcolor: 'error.light', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="error.contrastText">
            URGENT Return Request - 24 Hour Window
          </Typography>
          <Typography variant="body1" color="error.contrastText">
            For tree and plant returns, call us IMMEDIATELY at <strong>+880 1755163782</strong> or email 
            <strong> returns@amarnursery.com</strong> within 24 hours of delivery. 
            Have your order number and photos ready for fastest response.
          </Typography>
        </Box>
      </Container>
  );
};

export default ReturnPolicy;
