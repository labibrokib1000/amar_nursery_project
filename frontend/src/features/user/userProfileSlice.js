import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserProfile, updateUserProfile, addUserAddress, updateUserAddress, deleteUserAddress, setDefaultAddress } from '../../services/userApi';

// Async thunks
export const fetchUserProfileAsync = createAsyncThunk(
  'userProfile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateUserProfileAsync = createAsyncThunk(
  'userProfile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await updateUserProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addUserAddressAsync = createAsyncThunk(
  'userProfile/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await addUserAddress(addressData);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateUserAddressAsync = createAsyncThunk(
  'userProfile/updateAddress',
  async ({ addressId, addressData }, { rejectWithValue }) => {
    try {
      const response = await updateUserAddress(addressId, addressData);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteUserAddressAsync = createAsyncThunk(
  'userProfile/deleteAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await deleteUserAddress(addressId);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const setDefaultAddressAsync = createAsyncThunk(
  'userProfile/setDefaultAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await setDefaultAddress(addressId);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState: {
    profile: null,
    loading: false,
    error: null,
    addressLoading: false,
    addressError: null,
    successMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.addressError = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfileAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfileAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfileAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update user profile
      .addCase(updateUserProfileAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfileAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.successMessage = 'Profile updated successfully';
        state.error = null;
      })
      .addCase(updateUserProfileAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add user address
      .addCase(addUserAddressAsync.pending, (state) => {
        state.addressLoading = true;
        state.addressError = null;
      })
      .addCase(addUserAddressAsync.fulfilled, (state, action) => {
        state.addressLoading = false;
        state.profile = action.payload;
        state.successMessage = 'Address added successfully';
        state.addressError = null;
      })
      .addCase(addUserAddressAsync.rejected, (state, action) => {
        state.addressLoading = false;
        state.addressError = action.payload;
      })

      // Update user address
      .addCase(updateUserAddressAsync.pending, (state) => {
        state.addressLoading = true;
        state.addressError = null;
      })
      .addCase(updateUserAddressAsync.fulfilled, (state, action) => {
        state.addressLoading = false;
        state.profile = action.payload;
        state.successMessage = 'Address updated successfully';
        state.addressError = null;
      })
      .addCase(updateUserAddressAsync.rejected, (state, action) => {
        state.addressLoading = false;
        state.addressError = action.payload;
      })

      // Delete user address
      .addCase(deleteUserAddressAsync.pending, (state) => {
        state.addressLoading = true;
        state.addressError = null;
      })
      .addCase(deleteUserAddressAsync.fulfilled, (state, action) => {
        state.addressLoading = false;
        state.profile = action.payload;
        state.successMessage = 'Address deleted successfully';
        state.addressError = null;
      })
      .addCase(deleteUserAddressAsync.rejected, (state, action) => {
        state.addressLoading = false;
        state.addressError = action.payload;
      })

      // Set default address
      .addCase(setDefaultAddressAsync.pending, (state) => {
        state.addressLoading = true;
        state.addressError = null;
      })
      .addCase(setDefaultAddressAsync.fulfilled, (state, action) => {
        state.addressLoading = false;
        state.profile = action.payload;
        state.successMessage = 'Default address updated successfully';
        state.addressError = null;
      })
      .addCase(setDefaultAddressAsync.rejected, (state, action) => {
        state.addressLoading = false;
        state.addressError = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage } = userProfileSlice.actions;

// Selectors
export const selectUserProfile = (state) => state.userProfile.profile;
export const selectUserProfileLoading = (state) => state.userProfile.loading;
export const selectUserProfileError = (state) => state.userProfile.error;
export const selectAddressLoading = (state) => state.userProfile.addressLoading;
export const selectAddressError = (state) => state.userProfile.addressError;
export const selectSuccessMessage = (state) => state.userProfile.successMessage;

export default userProfileSlice.reducer;
