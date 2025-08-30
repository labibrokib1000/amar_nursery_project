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
  Chip,
} from '@mui/material';
import {
  WbSunny,
  Opacity,
  Grass,
  BugReport,
  Thermostat,
} from '@mui/icons-material';

const PlantCareGuide = () => {
  const articles = [
    {
      title: "Light Requirements",
      content: [
        "Full Sun: 6+ hours direct sunlight (outdoor plants, cacti).",
        "Partial Sun: 4-6 hours (most flowering plants).",
        "Shade: Less than 4 hours (ferns, tropicals)."
      ],
      icon: <WbSunny color="primary" />,
      difficulty: "Beginner"
    },
    {
      title: "Watering Techniques",
      content: [
        "Check soil moisture 1-2 inches deep before watering.",
        "Water thoroughly until drainage, then empty saucers.",
        "Morning watering is best, use room temperature water."
      ],
      icon: <Opacity color="primary" />,
      difficulty: "Beginner"
    },
    {
      title: "Soil & Fertilization",
      content: [
        "Use well-draining potting mix for plant type.",
        "Fertilize spring/summer with diluted balanced fertilizer.",
        "Stop fertilizing in fall/winter dormancy period."
      ],
      icon: <Grass color="primary" />,
      difficulty: "Intermediate"
    },
    {
      title: "Pest Prevention",
      content: [
        "Weekly inspection for aphids, mites, scale insects.",
        "Quarantine new plants for 2 weeks.",
        "Neem oil spray effective for most common pests."
      ],
      icon: <BugReport color="primary" />,
      difficulty: "Advanced"
    },
    {
      title: "Temperature & Humidity",
      content: [
        "Most houseplants prefer 65-75°F (18-24°C).",
        "Tropical plants need 40-60% humidity.",
        "Avoid heat sources and cold drafts."
      ],
      icon: <Thermostat color="primary" />,
      difficulty: "Intermediate"
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'error';
      default: return 'primary';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Plant Care Guide
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Expert tips and techniques for healthy, thriving plants
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {article.icon}
                    <Typography variant="h5" component="h2" sx={{ ml: 2, fontWeight: 600 }}>
                      {article.title}
                    </Typography>
                  </Box>
                  <Chip 
                    label={article.difficulty} 
                    color={getDifficultyColor(article.difficulty)}
                    size="small"
                    variant="outlined"
                  />
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
            <Box sx={{ p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom color="info.contrastText">
                Free Plant Consultation
              </Typography>
              <Typography variant="body1" color="info.contrastText">
                Need personalized advice? Our plant experts offer free consultations. 
                Email us at <strong>care@amarnursery.com</strong> with photos and questions.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, bgcolor: 'warning.light', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom color="warning.contrastText">
                Emergency Plant Care
              </Typography>
              <Typography variant="body1" color="warning.contrastText">
                Plant emergency? Contact us immediately at <strong>+880 1755163782</strong>. 
                We provide urgent care advice for dying or severely stressed plants.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
  );
};

export default PlantCareGuide;
