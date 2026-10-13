import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [
    {
      id: 1,
      category: 'Workout',
      title: 'Workout Goal Met',
      message: 'You have hit your goal of 4 workouts this week! Keep it up!',
      date: new Date().toISOString(),
      read: false,
    },
    {
      id: 2,
      category: 'Diet',
      title: 'Calorie Alert',
      message: 'You are 200 calories away from your daily goal.',
      date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      read: false,
    },
    {
      id: 3,
      category: 'System',
      title: 'Welcome to FitTrack',
      message: 'Your account has been successfully set up. Let\'s get moving!',
      date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      read: true,
    },
    {
      id: 4,
      category: 'Workout',
      title: 'Rest Day Reminder',
      message: 'You have taken 2 rest days this week. Remember, recovery is just as important as training!',
      date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      read: false,
    },
    {
      id: 5,
      category: 'System',
      title: 'Goals Update',
      message: 'You have 3 remaining goals to achieve this month. Keep pushing!',
      date: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      read: false,
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
        id: Date.now(),
        read: false,
        date: new Date().toISOString(),
        ...action.payload
      });
    }
  }
});

export const { markAsRead, markAllAsRead, markAllAsUnread, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
