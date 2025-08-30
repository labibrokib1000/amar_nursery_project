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
  Gavel,
  ShoppingCart,
  AccountCircle,
  Warning,
  Copyright,
} from '@mui/icons-material';

const TermsConditions = () => {
  const articles = [
    {
      title: "Account Terms",
      content: [
        "Must be 18+ years old to create account.",
        "Provide accurate information and keep it updated.",
        "You're responsible for account security."
      ],
      icon: <AccountCircle color="primary" />
    },
    {
      title: "Purchase Terms",
      content: [
        "Prices in BDT include applicable taxes.",
        "Orders accepted upon email confirmation.",
        "Payment required before order processing."
      ],
      icon: <ShoppingCart color="primary" />
    },
    {
      title: "Plant Care & Warranties",
      content: [
        "24-hour health guarantee from delivery.",
        "Must follow provided care instructions.",
        "Natural plant variations are normal."
      ],
      icon: <Warning color="primary" />
    },
    {
      title: "Intellectual Property",
      content: [
        "All website content owned by AmarNursery.",
        "No reproduction without permission.",
        "Plant care guides for personal use only."
      ],
      icon: <Copyright color="primary" />
    },
    {
      title: "Limitation of Liability",
      content: [
        "Liability limited to purchase price.",
        "Not liable for indirect damages.",
        "Disputes resolved in Rajshahi, Bangladesh."
      ],
      icon: <Gavel color="primary" />
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Terms & Conditions
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Service usage guidelines and customer responsibilities
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Last updated: August 25, 2025 | Effective Date: August 25, 2025
          </Typography>
          <Divider sx={{ my: 3 }} />
        </Box>

        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="body1">
            <strong>Important:</strong> By using AmarNursery's website and services, you agree to these terms and conditions. 
            Please read them carefully before making any purchases or creating an account.
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

        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, bgcolor: 'primary.light', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom color="primary.contrastText">
                Questions About Terms?
              </Typography>
              <Typography variant="body1" color="primary.contrastText">
                Need clarification on any terms? Contact our legal team at 
                <strong> legal@amarnursery.com</strong> or call <strong>+880 1755163782</strong>.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, bgcolor: 'secondary.light', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom color="secondary.contrastText">
                Terms Updates
              </Typography>
              <Typography variant="body1" color="secondary.contrastText">
                We may update these terms periodically. Significant changes will be 
                communicated via email and posted on our website with the new effective date.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="body2">
            <strong>Acceptance of Terms:</strong> Continued use of our website and services after any modifications 
            constitutes acceptance of the updated terms and conditions. If you disagree with any changes, 
            please discontinue use of our services.
          </Typography>
        </Alert>
      </Container>
  );
};

export default TermsConditions;
