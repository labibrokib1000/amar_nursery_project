import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 8,
    padding: theme.spacing(2),
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: 8,
  top: 8,
  color: theme.palette.grey[500],
}));

const AuthDialog = ({ open, onClose, mode = 'login', onModeChange, onSubmit }) => {
  const isLogin = mode === 'login';

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
      ...(isLogin ? {} : { name: formData.get('name') }),
    };
    onSubmit(data);
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {isLogin ? 'Login' : 'Register'}
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {!isLogin && (
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Full Name"
              type="text"
              fullWidth
              required
              variant="outlined"
            />
          )}
          <TextField
            margin="dense"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            required
            variant="outlined"
          />
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            required
            variant="outlined"
          />
          {!isLogin && (
            <TextField
              margin="dense"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              fullWidth
              required
              variant="outlined"
            />
          )}
        </DialogContent>

        <DialogActions sx={{ flexDirection: 'column', gap: 1, px: 3, pb: 3 }}>
          <Button type="submit" variant="contained" fullWidth>
            {isLogin ? 'Login' : 'Register'}
          </Button>
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Button
                color="primary"
                onClick={() => onModeChange(isLogin ? 'register' : 'login')}
              >
                {isLogin ? 'Register' : 'Login'}
              </Button>
            </Typography>
          </Box>
        </DialogActions>
      </Box>
    </StyledDialog>
  );
};

export default AuthDialog;
