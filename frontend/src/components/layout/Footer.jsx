import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledFooter = styled('footer')(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: '#dddddd',
  padding: theme.spacing(8, 0, 3),
}));

const FooterTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.3rem',
  fontWeight: 600,
  marginBottom: theme.spacing(3),
  position: 'relative',
  paddingBottom: theme.spacing(1.5),
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 50,
    height: 3,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 1.5,
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: '#dddddd',
  margin: theme.spacing(0.5),
  width: 45,
  height: 45,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    transform: 'translateY(-3px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  transition: 'all 0.3s ease',
}));

const Footer = () => {
  return (
    <StyledFooter>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6} md={4}>
            <FooterTitle variant="h6">AmarNursery</FooterTitle>
            <Typography paragraph sx={{ lineHeight: 1.7, mb: 3 }}>
              Your trusted online plant nursery offering a wide variety of indoor
              and outdoor plants to greenify your spaces and bring nature into your home.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Follow Us
              </Typography>
              <Stack direction="row" spacing={1}>
                <SocialButton aria-label="facebook">
                  <Facebook />
                </SocialButton>
                <SocialButton aria-label="twitter">
                  <Twitter />
                </SocialButton>
                <SocialButton aria-label="instagram">
                  <Instagram />
                </SocialButton>
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FooterTitle variant="h6">Customer Service</FooterTitle>
            <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
              {[
                'Shipping Policy',
                'Return Policy',
                'Plant Care Guide',
                'Privacy Policy',
                'Terms & Conditions',
              ].map((item) => (
                <Box component="li" key={item} sx={{ mb: 2 }}>
                  <Link
                    component={RouterLink}
                    to={`/${item.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                    color="inherit"
                    onClick={() => {
                      // Scroll to top when footer link is clicked
                      setTimeout(() => {
                        window.scrollTo({
                          top: 0,
                          behavior: 'smooth'
                        });
                      }, 100);
                    }}
                    sx={{ 
                      textDecoration: 'none',
                      '&:hover': { 
                        color: 'primary.light',
                        textDecoration: 'underline'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {item}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FooterTitle variant="h6">Contact Us</FooterTitle>
            <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
              <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                  Address:
                </Typography>
                <Typography variant="body2">
                  Plant City, Rajshahi, Motihar, Bangladesh
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                  Phone:
                </Typography>
                <Typography variant="body2">
                  +880 1755163782
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                  Email:
                </Typography>
                <Typography variant="body2">
                  info@amarnursery.com
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            mt: 6,
            pt: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            © {new Date().getFullYear()} AmarNursery. All Rights Reserved. | Made with 🌱 for plant lovers
          </Typography>
        </Box>
      </Container>
    </StyledFooter>
  );
};

export default Footer;
