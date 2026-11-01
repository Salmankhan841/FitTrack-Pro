import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [
    {
      id: 'demo-welcome',
      category: 'System',
      title: 'Welcome to FitTrack Pro!',
      message: 'Your account has been created successfully. Welcome to the elite fitness platform. Start tracking your heavy lifts and daily nutrition.',
      date: new Date().toISOString(),
      read: false,
    },
    {
      id: 'demo-goal',
      category: 'Workout',
      title: 'Workout Target Ready',
      message: 'Organize your sets by chest, back, shoulders, arms, legs, and abs for balanced strength gains.',
      date: new Date(Date.now() - 3600000).toISOString(),
      read: false,
    },
    {
      id: 'demo-diet',
      category: 'Diet',
      title: 'Daily Nutrition Goals',
      message: 'Customize your calorie, protein, carbohydrate, and fat targets in the Nutrition Journal.',
      date: new Date(Date.now() - 7200000).toISOString(),
      read: true,
    }
  ]
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    markAsRead(state, action) {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllAsRead(state) {
      state.notifications.forEach(n => {
        n.read = true;
      });
    },
    markAllAsUnread(state) {
      state.notifications.forEach(n => {
        n.read = false;
      });
    },
    addNotification(state, action) {
      state.notifications.unshift({
        id: String(Date.now()),
        read: false,
        date: new Date().toISOString(),
        ...action.payload
      });
    },
    setNotifications(state, action) {
      state.notifications = action.payload;
    },
    deleteNotification(state, action) {
      state.notifications = state.notifications.filter(n => String(n.id) !== String(action.payload));
    }
  }
});

export const { 
  markAsRead, 
  markAllAsRead, 
  markAllAsUnread, 
  addNotification, 
  setNotifications, 
  deleteNotification 
} = notificationSlice.actions;
export default notificationSlice.reducer;
