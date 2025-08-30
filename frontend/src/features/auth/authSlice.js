import { createSlice, createSelector } from '@reduxjs/toolkit';

// Load user from localStorage if available
const loadUserFromStorage = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
    return null;
  }
};

const initialState = {
  user: loadUserFromStorage(), // Load from localStorage on initialization
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token || state.token;
      
      // Save to localStorage for persistence
      if (user) {
        localStorage.setItem('userInfo', JSON.stringify(user));
      }
      if (token) {
        localStorage.setItem('token', token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      
      // Clear localStorage
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCredentials,
  logout,
  setLoading,
  setError,
} = authSlice.actions;

// Memoized selectors to prevent unnecessary rerenders
export const selectAuth = (state) => state.auth;

export const selectUser = createSelector(
  [selectAuth],
  (auth) => auth.user
);

export const selectToken = createSelector(
  [selectAuth],
  (auth) => auth.token
);

export const selectIsAuthenticated = createSelector(
  [selectUser],
  (user) => !!user
);

export const selectAuthLoading = createSelector(
  [selectAuth],
  (auth) => auth.isLoading
);

export const selectAuthError = createSelector(
  [selectAuth],
  (auth) => auth.error
);

export default authSlice.reducer;
