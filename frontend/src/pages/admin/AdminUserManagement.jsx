import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  InputAdornment,
  Snackbar
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  ShoppingBag as OrderIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectUser, selectToken } from '../../features/auth/authSlice';
import { adminUserAPI } from '../../utils/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-detail-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminUserManagement = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailDialog, setUserDetailDialog] = useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await adminUserAPI.getAllUsers(token);
      setUsers(usersData);
    } catch (error) {
      showToast('Failed to fetch users', 'error');
      console.error('Users fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      setUserDetailsLoading(true);
      const response = await adminUserAPI.getUserDetails(userId, token);
      console.log('User details response:', response); // Debug log
      
      // Handle both old and new response formats
      const userData = response.user || response;
      const ordersData = response.orders || [];
      
      // Backend returns { user, orders }, but we need to combine them
      const userDetails = {
        ...userData,
        orders: ordersData
      };
      console.log('Processed user details:', userDetails); // Debug log
      setSelectedUser(userDetails);
      setUserDetailDialog(true);
      setTabValue(0); // Reset to first tab when opening dialog
    } catch (error) {
      showToast('Failed to fetch user details', 'error');
      console.error('User details fetch error:', error);
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteUserDialog(true);
  };

  const confirmDeleteUser = async () => {
    try {
      setLoading(true);
      await adminUserAPI.deleteUser(userToDelete._id, token);
      showToast('User deleted successfully', 'success');
      setDeleteUserDialog(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      showToast('Failed to delete user', 'error');
      console.error('User delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile?.phone?.includes(searchTerm)
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'moderator': return 'warning';
      case 'user': return 'primary';
      default: return 'default';
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. You need admin privileges to view this page.
        </Alert>
      </Container>
    );
  }

  if (loading && users.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            Manage and view all registered users
          </Typography>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Joined</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar
                                src={
                                  typeof (user.profile?.avatar?.url || user.profile?.avatar) === 'string' 
                                    ? (user.profile?.avatar?.url || user.profile?.avatar)
                                    : undefined
                                }
                                sx={{ mr: 2 }}
                              >
                                {user.name?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">
                                  {user.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {user.profile?.gender && user.profile?.age && 
                                    `${user.profile.gender}, ${user.profile.age} years`
                                  }
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.profile?.phone || 'Not provided'}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.role}
                              color={getRoleColor(user.role)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => fetchUserDetails(user._id)}
                              color="primary"
                              disabled={userDetailsLoading}
                            >
                              {userDetailsLoading ? <CircularProgress size={20} /> : <ViewIcon />}
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeleteUser(user)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredUsers.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </Box>
      </Paper>

      {/* User Details Dialog */}
      <Dialog
        open={userDetailDialog}
        onClose={() => setUserDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          User Details: {selectedUser?.name}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                <Tab label="Profile" icon={<PersonIcon />} />
                <Tab label="Addresses" icon={<LocationIcon />} />
                <Tab label="Orders" icon={<OrderIcon />} />
              </Tabs>

              {/* Profile Tab */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Avatar
                          src={
                            (() => {
                              const avatar = selectedUser.profile?.avatar || selectedUser.avatar;
                              if (typeof avatar === 'string') return avatar;
                              if (avatar && typeof avatar === 'object' && avatar.url) return avatar.url;
                              return undefined;
                            })()
                          }
                          sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                        >
                          {selectedUser.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Typography variant="h6">{selectedUser.name}</Typography>
                        <Chip
                          label={selectedUser.role}
                          color={getRoleColor(selectedUser.role)}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Personal Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" mb={2}>
                              <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                              <Box>
                                <Typography variant="subtitle2" color="textSecondary">
                                  Email
                                </Typography>
                                <Typography>{selectedUser.email}</Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" mb={2}>
                              <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                              <Box>
                                <Typography variant="subtitle2" color="textSecondary">
                                  Phone
                                </Typography>
                                <Typography>
                                  {selectedUser.profile?.phone || 'Not provided'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" mb={2}>
                              <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                              <Box>
                                <Typography variant="subtitle2" color="textSecondary">
                                  Gender
                                </Typography>
                                <Typography>
                                  {selectedUser.profile?.gender || 'Not provided'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" mb={2}>
                              <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                              <Box>
                                <Typography variant="subtitle2" color="textSecondary">
                                  Age
                                </Typography>
                                <Typography>
                                  {selectedUser.profile?.age || 'Not provided'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box display="flex" alignItems="center" mb={2}>
                              <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                              <Box>
                                <Typography variant="subtitle2" color="textSecondary">
                                  Joined
                                </Typography>
                                <Typography>{formatDate(selectedUser.createdAt)}</Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Addresses Tab */}
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>
                  Saved Addresses
                </Typography>
                {selectedUser.addresses && selectedUser.addresses?.length > 0 ? (
                  <Grid container spacing={2}>
                    {selectedUser.addresses.map((address, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card>
                          <CardContent>
                            <Chip
                              label={address.type || 'address'}
                              size="small"
                              color={address.type === 'home' ? 'primary' : 'secondary'}
                              sx={{ mb: 2 }}
                            />
                            <Typography variant="body2" gutterBottom>
                              {address.fullAddress || address.address || 'Address not provided'}
                            </Typography>
                            {address.area && (
                              <Typography variant="body2" color="textSecondary">
                                {address.area}{address.city ? `, ${address.city}` : ''}
                              </Typography>
                            )}
                            {address.district && (
                              <Typography variant="body2" color="textSecondary">
                                {address.district}{address.division ? `, ${address.division}` : ''}
                              </Typography>
                            )}
                            {address.landmark && (
                              <Typography variant="body2" color="textSecondary">
                                Landmark: {address.landmark}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No addresses added yet.
                  </Alert>
                )}
              </TabPanel>

              {/* Orders Tab */}
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  Order History
                </Typography>
                {userDetailsLoading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : selectedUser.orders?.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Order ID</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Items</TableCell>
                          <TableCell>Total</TableCell>
                          <TableCell>Payment</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedUser.orders.map((order) => (
                          <TableRow key={order._id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                {order._id?.slice(-8)}
                              </Typography>
                            </TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell>
                              {order.orderItems?.length || 0} items
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                ৳{(order.totalPrice || order.totalAmount || 0).toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={order.isPaid ? 'Paid' : 'Unpaid'} 
                                size="small" 
                                color={order.isPaid ? 'success' : 'warning'}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={order.orderStatus || order.status || 'Processing'} 
                                size="small" 
                                color={
                                  (order.orderStatus || order.status) === 'Delivered' ? 'success' :
                                  (order.orderStatus || order.status) === 'Shipped' ? 'info' :
                                  (order.orderStatus || order.status) === 'Cancelled' ? 'error' : 'default'
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No orders found for this user.
                  </Alert>
                )}
              </TabPanel>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog
        open={deleteUserDialog}
        onClose={() => setDeleteUserDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "{userToDelete?.name}"? 
            This action cannot be undone and will permanently remove all user data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUserDialog(false)}>Cancel</Button>
          <Button 
            onClick={confirmDeleteUser} 
            variant="contained" 
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            minWidth: '300px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
            '&.MuiAlert-filledSuccess': {
              backgroundColor: '#4caf50',
              color: '#ffffff',
              '& .MuiAlert-icon': {
                color: '#ffffff',
              },
              '& .MuiAlert-action .MuiIconButton-root': {
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminUserManagement;
