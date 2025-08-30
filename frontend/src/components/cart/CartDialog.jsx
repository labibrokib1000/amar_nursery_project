import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
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

const CartDialog = ({ open, onClose, cartItems = [], onRemoveItem, onCheckout }) => {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Your Cart
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
      </DialogTitle>

      <DialogContent>
        {cartItems.length === 0 ? (
          <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
            Your cart is empty
          </Typography>
        ) : (
          <List>
            {cartItems.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" onClick={() => onRemoveItem(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      variant="rounded"
                      src={item.image}
                      alt={item.name}
                      sx={{ width: 56, height: 56, mr: 2 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.name}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          ৳{item.price} × {item.quantity}
                        </Typography>
                        <Typography variant="subtitle2" color="primary">
                          Subtotal: ৳{item.price * item.quantity}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>

      {cartItems.length > 0 && (
        <DialogActions sx={{ flexDirection: 'column', gap: 2, p: 3 }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6" color="primary">
              ৳{total}
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={onCheckout}
          >
            Proceed to Checkout
          </Button>
        </DialogActions>
      )}
    </StyledDialog>
  );
};

export default CartDialog;
