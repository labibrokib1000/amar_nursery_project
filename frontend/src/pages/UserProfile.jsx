import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';
import api from '../utils/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    age: '',
    dateOfBirth: ''
  });

  // Address form state
  const [addressForm, setAddressForm] = useState({
    type: 'home',
    fullAddress: '',
    area: '',
    city: '',
    district: '',
    division: '',
    landmark: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    if (!token) {
      setError('Authentication token not available');
      return;
    }
    
    try {
      const profile = await api.userAPI.getProfile(token);
      setUserProfile(profile);
      setProfileForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.profile?.phone || '',
        gender: profile.profile?.gender || '',
        age: profile.profile?.age || '',
        dateOfBirth: profile.profile?.dateOfBirth?.split('T')[0] || ''
      });
    } catch (error) {
      setError('Failed to fetch profile');
      console.error('Profile fetch error:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileUpdate = async () => {
    if (!token) {
      setError('Authentication token not available');
      return;
    }
    
    try {
      setLoading(true);
      const updateData = {
        name: profileForm.name,
        profile: {
          phone: profileForm.phone,
          gender: profileForm.gender,
          age: parseInt(profileForm.age) || undefined,
          dateOfBirth: profileForm.dateOfBirth || undefined
        }
      };

      // Only include avatar if it exists
      if (userProfile?.profile?.avatar) {
        updateData.profile.avatar = userProfile.profile.avatar;
      }

      const response = await api.userAPI.updateProfile(updateData, token);
      setSuccess('Profile updated successfully');
      setEditDialogOpen(false);
      fetchUserProfile();
    } catch (error) {
      setError('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      const response = await api.userAPI.uploadAvatar(file, token);
      setSuccess('Avatar updated successfully');
      fetchUserProfile();
    } catch (error) {
      setError('Failed to upload avatar');
      console.error('Avatar upload error:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      type: 'home',
      fullAddress: '',
      area: '',
      city: '',
      district: '',
      division: '',
      landmark: ''
    });
  };

  const openAddressDialog = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm(address);
    } else {
      setEditingAddress(null);
      resetAddressForm();
    }
    setAddressDialogOpen(true);
  };

  const handleAddAddress = async () => {
    if (!addressForm.fullAddress.trim() || !addressForm.city.trim()) {
      setError('Full Address and City are required');
      return;
    }

    try {
      setLoading(true);
      await api.userAPI.addAddress(addressForm, token);
      setSuccess('Address added successfully');
      setAddressDialogOpen(false);
      resetAddressForm();
      fetchUserProfile();
    } catch (error) {
      setError('Failed to add address');
      console.error('Add address error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async () => {
    if (!addressForm.fullAddress.trim() || !addressForm.city.trim()) {
      setError('Full Address and City are required');
      return;
    }

    try {
      setLoading(true);
      await api.userAPI.updateAddress(editingAddress._id, addressForm, token);
      setSuccess('Address updated successfully');
      setAddressDialogOpen(false);
      setEditingAddress(null);
      resetAddressForm();
      fetchUserProfile();
    } catch (error) {
      setError('Failed to update address');
      console.error('Update address error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await api.userAPI.deleteAddress(addressId, token);
      setSuccess('Address deleted successfully');
      fetchUserProfile();
    } catch (error) {
      setError('Failed to delete address');
      console.error('Delete address error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && !userProfile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: 'primary.main',
            fontWeight: 600
          }}>
            <PersonIcon />
            {userProfile?.name || user?.name || 'User Profile'}
          </Typography>

          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
              }
            }}
          >
            <Tab 
              icon={<PersonIcon />} 
              label="Profile" 
              iconPosition="start"
              sx={{ 
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500
              }}
            />
            <Tab 
              icon={<LocationIcon />} 
              label="Addresses" 
              iconPosition="start"
              sx={{ 
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500
              }}
            />
          </Tabs>

          {/* Profile Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Avatar
                    src={userProfile?.profile?.avatar?.url || ''}
                    sx={{ width: 100, height: 100, mb: 2 }}
                  >
                    {userProfile?.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload"
                    type="file"
                    onChange={handleAvatarUpload}
                  />
                  <label htmlFor="avatar-upload">
                    <Button 
                      variant="outlined" 
                      component="span" 
                      size="small"
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                    </Button>
                  </label>
                </Box>
              </Grid>

              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="between" alignItems="center">
                      <Typography variant="h6">Personal Information</Typography>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => setEditDialogOpen(true)}
                      >
                        Edit Profile
                      </Button>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={userProfile?.name || ''}
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={userProfile?.email || ''}
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={userProfile?.profile?.phone || 'Not provided'}
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Gender"
                      value={userProfile?.profile?.gender || 'Not specified'}
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Age"
                      value={userProfile?.profile?.age || 'Not provided'}
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      value={userProfile?.profile?.dateOfBirth ? 
                        new Date(userProfile.profile.dateOfBirth).toLocaleDateString() : 
                        'Not provided'
                      }
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Addresses Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
              <Typography variant="h6">My Addresses</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openAddressDialog()}
              >
                Add Address
              </Button>
            </Box>

            <Grid container spacing={2}>
              {userProfile?.addresses?.map((address) => (
                <Grid item xs={12} md={6} key={address._id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="between" alignItems="start" mb={2}>
                        <Chip
                          label={address.type}
                          size="small"
                          color={address.type === 'home' ? 'primary' : 'secondary'}
                        />
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => openAddressDialog(address)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteAddress(address._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="body2" gutterBottom>
                        {address.fullAddress}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {address.area}, {address.city}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {address.district}, {address.division}
                      </Typography>
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

            {(!userProfile?.addresses || userProfile.addresses.length === 0) && (
              <Typography textAlign="center" color="textSecondary" py={4}>
                No addresses added yet. Click "Add Address" to add your first address.
              </Typography>
            )}
          </TabPanel>
        </Box>
      </Paper>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={profileForm.gender}
                  label="Gender"
                  onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={profileForm.age}
                onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={profileForm.dateOfBirth}
                onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleProfileUpdate} variant="contained">
            Update Profile
          </Button>
        </DialogActions>
      </Dialog>

      {/* Address Dialog */}
      <Dialog open={addressDialogOpen} onClose={() => setAddressDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Address Type</InputLabel>
                <Select
                  value={addressForm.type}
                  label="Address Type"
                  onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                >
                  <MenuItem value="home">Home</MenuItem>
                  <MenuItem value="work">Work</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Address *"
                multiline
                rows={2}
                value={addressForm.fullAddress}
                onChange={(e) => setAddressForm({ ...addressForm, fullAddress: e.target.value })}
                required
                error={!addressForm.fullAddress.trim()}
                helperText={!addressForm.fullAddress.trim() ? 'Full Address is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Area"
                value={addressForm.area}
                onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Upazilla *"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                required
                error={!addressForm.city.trim()}
                helperText={!addressForm.city.trim() ? 'Upazilla is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="District"
                value={addressForm.district}
                onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Division"
                value={addressForm.division}
                onChange={(e) => setAddressForm({ ...addressForm, division: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Landmark (Optional)"
                value={addressForm.landmark}
                onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddressDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
            variant="contained"
          >
            {editingAddress ? 'Update' : 'Add'} Address
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile;
