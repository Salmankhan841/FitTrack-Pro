import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import workoutReducer from './slices/workoutSlice';
import nutritionReducer from './slices/nutritionSlice';
import progressReducer from './slices/progressSlice';
import notificationReducer from './slices/notificationSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    workout: workoutReducer,
    nutrition: nutritionReducer,
    progress: progressReducer,
    notification: notificationReducer,
    admin: adminReducer,
  },
});

export default store;
