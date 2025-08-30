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
  Security,
  Storage,
  Share,
  Cookie,
  ContactMail,
} from '@mui/icons-material';

const PrivacyPolicy = () => {
  const articles = [
    {
      title: "Information We Collect",
      content: [
        "Personal info: Name, email, phone, shipping address.",
        "Payment data: Processed securely (not stored by us).",
        "Usage data: Website interactions for improvements."
      ],
      icon: <Storage color="primary" />
    },
    {
      title: "How We Use Your Info",
      content: [
        "Order processing and shipping updates.",
        "Customer service and plant care support.",
        "Personalized plant recommendations."
      ],
      icon: <Security color="primary" />
    },
    {
      title: "Information Sharing",
      content: [
        "We NEVER sell your personal information.",
        "Share delivery address with shipping partners only.",
        "Legal disclosure only when required by law."
      ],
      icon: <Share color="primary" />
    },
    {
      title: "Cookies & Tracking",
      content: [
        "Essential cookies for website functionality.",
        "Analytics cookies to improve performance.",
        "Marketing cookies with your consent only."
      ],
      icon: <Cookie color="primary" />
    },
    {
      title: "Your Rights",
      content: [
        "Access, correct, or delete your personal data.",
        "Opt-out of marketing emails anytime.",
        "Request data in portable format."
      ],
      icon: <ContactMail color="primary" />
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Privacy Policy
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Your privacy and data protection are our top priorities
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Last updated: August 25, 2025
          </Typography>
          <Divider sx={{ my: 3 }} />
        </Box>

        <Alert severity="success" sx={{ mb: 4 }}>
          <Typography variant="body1">
            <strong>Privacy Commitment:</strong> AmarNursery is committed to protecting your privacy. 
            We use industry-standard security measures and only collect information necessary to provide excellent service.
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
            Privacy Questions or Concerns?
          </Typography>
          <Typography variant="body1" color="error.contrastText">
            Contact our Privacy Officer at <strong>privacy@amarnursery.com</strong> or call 
            <strong> +880 1755163782</strong>. We respond to all privacy inquiries within 48 hours.
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="body2">
            <strong>Policy Updates:</strong> We may update this privacy policy to reflect changes in our practices or legal requirements. 
            We'll notify you via email of any significant changes and post the updated date at the top of this page.
          </Typography>
        </Alert>
      </Container>
  );
};

export default PrivacyPolicy;
