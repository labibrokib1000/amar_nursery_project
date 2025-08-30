import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardMedia,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const HiddenInput = styled('input')({
  display: 'none',
});

const ImageUploadBox = styled(Box)(({ theme }) => ({
  border: '2px dashed',
  borderColor: theme.palette.primary.main,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  minHeight: 200,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  backgroundColor: 'rgba(76, 175, 80, 0.04)',
  '&:hover': {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    borderColor: theme.palette.primary.dark,
  },
  '&.uploading': {
    pointerEvents: 'none',
    opacity: 0.7,
  },
}));

const SampleImage = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const sampleImages = [
  '/images/sample-plants/sample-plant-1.svg',
  '/images/sample-plants/sample-plant-2.svg',
  '/images/sample-plants/sample-plant-3.svg',
  '/plant.svg',
];

const ImageUploadComponent = ({
  currentImage,
  onImageChange,
  onImageUpload,
  onImageDelete,
  uploading = false,
  disabled = false,
}) => {
  const [showSampleImages, setShowSampleImages] = useState(false);
  const [imageError, setImageError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageError('Please select a valid image file (JPEG, PNG, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setImageError('Image size should be less than 5MB');
      return;
    }

    setImageError(null);
    if (onImageUpload) {
      await onImageUpload(file);
    }
  };

  const handleSampleImageSelect = (imageUrl) => {
    if (onImageChange) {
      onImageChange(imageUrl);
    }
    setShowSampleImages(false);
  };

  const getDisplayImage = () => {
    if (currentImage) {
      // Ensure local images start with /
      if (!currentImage.startsWith('/') && !currentImage.startsWith('http')) {
        return `/${currentImage}`;
      }
      return currentImage;
    }
    return '/plant.svg'; // Default fallback
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Product Image
      </Typography>
      
      {imageError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setImageError(null)}>
          {imageError}
        </Alert>
      )}

      <ImageUploadBox
        className={uploading ? 'uploading' : ''}
        onClick={() => !uploading && !disabled && document.getElementById('image-upload-input').click()}
      >
        <HiddenInput
          id="image-upload-input"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading || disabled}
        />
        
        {uploading ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="primary">
              Uploading image...
            </Typography>
          </Box>
        ) : currentImage ? (
          <Box>
            <Avatar
              src={getDisplayImage()}
              key={`image-${Date.now()}`}
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto', 
                mb: 2,
                border: '3px solid',
                borderColor: 'primary.main'
              }}
              variant="rounded"
              onError={(e) => {
                console.warn('Image failed to load, using fallback:', e.target.src);
                e.target.src = '/plant.svg';
                e.target.onerror = null;
              }}
            >
              <ImageIcon />
            </Avatar>
            <Typography variant="body2" color="primary">
              Click to change image
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary">
              Current image loaded
            </Typography>
          </Box>
        ) : (
          <Box>
            <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" color="primary" gutterBottom>
              Upload Product Image
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Click to select an image file
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
              Supported formats: JPEG, PNG, WebP (Max: 5MB)
            </Typography>
          </Box>
        )}
      </ImageUploadBox>
      
      {/* Action buttons */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowSampleImages(true)}
          disabled={uploading || disabled}
        >
          Use Sample Image
        </Button>
        
        {currentImage && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            disabled={uploading || disabled}
            onClick={() => {
              if (onImageDelete) {
                onImageDelete();
              } else if (onImageChange) {
                onImageChange('');
              }
            }}
          >
            Remove Image
          </Button>
        )}
      </Box>

      {/* Sample Images Dialog */}
      <Dialog
        open={showSampleImages}
        onClose={() => setShowSampleImages(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Choose a Sample Plant Image</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {sampleImages.map((imageUrl, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <SampleImage onClick={() => handleSampleImageSelect(imageUrl)}>
                  <CardMedia
                    component="img"
                    height="120"
                    image={imageUrl}
                    alt={`Sample plant ${index + 1}`}
                    onError={(e) => {
                      e.target.src = '/plant.svg';
                      e.target.onerror = null;
                    }}
                  />
                </SampleImage>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSampleImages(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageUploadComponent;
