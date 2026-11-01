import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser as loginApi, registerUser as registerApi } from '../../api/authApi';
import { setToken, clearToken } from '../../utils/tokenHelpers';
import { 
  loginWithFirebase, 
  registerWithFirebase, 
  logoutFromFirebase, 
  updateUserProfileInFirebase 
} from '../../firebase/authService';
import { isFirebaseConfigured } from '../../firebase/config';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const emailLower = credentials.email.toLowerCase().trim();

    // 1. Super Admin credentials check
    if (emailLower === 'admin@fitnesstracker.com') {
      if (credentials.password !== 'Salman987$') {
        throw new Error('Invalid admin credentials. Use: Salman987$');
      }
      const response = await loginApi(credentials);
      setToken(response.data.token);
      return response.data;
    }

    // 2. Demo athlete credentials check
    const isDemoAthlete = 
      (emailLower === 'athlete@fitnesstracker.com' || 
       emailLower === 'alex@fitnesspro.com' || 
       emailLower === 'alex@fitnesstracker.com') &&
      (credentials.password === 'Password123!' || credentials.password === 'password123');

    // 3. Firebase Authentication when configured
    if (isFirebaseConfigured) {
      try {
        const fbResult = await loginWithFirebase(credentials.email, credentials.password);
        setToken(fbResult.token);
        return fbResult;
      } catch (fbError) {
        // If demo athlete login fails in Firebase, fall back to robust mock session
        if (isDemoAthlete) {
          const response = await loginApi({
            email: 'athlete@fitnesstracker.com',
            password: 'Password123!'
          });
          response.data.user = {
            ...response.data.user,
            name: 'Demo Athlete (Alex)',
            email: 'athlete@fitnesstracker.com',
            role: 'user'
          };
          setToken(response.data.token);
          return response.data;
        }
        return rejectWithValue(fbError.message || 'Firebase login failed');
      }
    }

    // 4. Fallback to mock login
    const response = await loginApi(credentials);
    response.data.user = {
      ...response.data.user,
      role: 'user'
    };
    setToken(response.data.token);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message || error.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const emailLower = userData.email.toLowerCase().trim();

    // 1. Super Admin mock registration check
    if (emailLower === 'admin@fitnesstracker.com') {
      const response = await registerApi(userData);
      response.data.user = {
        ...response.data.user,
        name: 'Super Admin',
        email: 'admin@fitnesstracker.com',
        role: 'admin'
      };
      setToken(response.data.token);
      return response.data;
    }

    // 2. Demo athlete registration check
    const isDemoAthlete = 
      (emailLower === 'athlete@fitnesstracker.com' || 
       emailLower === 'alex@fitnesspro.com' || 
       emailLower === 'alex@fitnesstracker.com') &&
      (userData.password === 'Password123!' || userData.password === 'password123');

    if (isDemoAthlete) {
      if (isFirebaseConfigured) {
        try {
          const fbResult = await registerWithFirebase(userData.email, userData.password, userData.name || 'Demo Athlete');
          setToken(fbResult.token);
          return fbResult;
        } catch {
          // If already registered in Firebase, attempt login with same credentials
          try {
            const loginResult = await loginWithFirebase(userData.email, userData.password);
            setToken(loginResult.token);
            return loginResult;
          } catch {
            // Fall back to clean mock demo session
            const response = await registerApi(userData);
            response.data.user = {
              ...response.data.user,
              name: userData.name || 'Demo Athlete (Alex)',
              email: 'athlete@fitnesstracker.com',
              role: 'user'
            };
            setToken(response.data.token);
            return response.data;
          }
        }
      }

      // If firebase is not configured
      const response = await registerApi(userData);
      response.data.user = {
        ...response.data.user,
        name: userData.name || 'Demo Athlete (Alex)',
        email: 'athlete@fitnesstracker.com',
        role: 'user'
      };
      setToken(response.data.token);
      return response.data;
    }

    // 3. Firebase Registration for regular users
    if (isFirebaseConfigured) {
      try {
        const fbResult = await registerWithFirebase(userData.email, userData.password, userData.name);
        setToken(fbResult.token);
        return fbResult;
      } catch (fbError) {
        return rejectWithValue(fbError.message || 'Registration failed');
      }
    }

    // 4. Fallback to mock registration
    const response = await registerApi(userData);
    response.data.user = {
      ...response.data.user,
      role: 'user'
    };

    setToken(response.data.token);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message || error.response?.data?.message || 'Registration failed');
  }
});

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      clearToken();
      logoutFromFirebase().catch(() => {});
    },
    setAuthSession(state, action) {
      if (action.payload) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      } else {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }
      state.loading = false;
    },
    updateProfile(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (isFirebaseConfigured && state.user.uid) {
          updateUserProfileInFirebase(state.user.uid, action.payload).catch(console.error);
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const { logout, updateProfile, setAuthSession } = authSlice.actions;
export default authSlice.reducer;
