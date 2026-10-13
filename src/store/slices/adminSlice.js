import { createSlice } from '@reduxjs/toolkit';

const initialMockUsers = [
  { 
    id: '1', 
    name: 'John Doe', 
    email: 'john@example.com', 
    role: 'user', 
    status: 'active', 
    joined: '2026-01-15',
    progressLogs: [
      { id: 101, date: '2026-01-15', weight: 88.0, bodyFat: 24.5, note: 'Initial weigh-in & body scan' },
      { id: 102, date: '2026-01-30', weight: 86.2, bodyFat: 23.4, note: 'First 2 weeks of calorie deficit' },
      { id: 103, date: '2026-02-14', weight: 84.5, bodyFat: 22.0, note: 'Hit cardio milestone' },
      { id: 104, date: '2026-02-28', weight: 83.1, bodyFat: 20.8, note: 'Down 4.9kg & visible abs!' },
      { id: 105, date: '2026-03-15', weight: 81.8, bodyFat: 19.5, note: 'Plateau broken, great energy' },
    ]
  },
  { 
    id: '2', 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    role: 'user', 
    status: 'active', 
    joined: '2026-02-20',
    progressLogs: [
      { id: 201, date: '2026-02-20', weight: 62.0, bodyFat: 26.0, note: 'Starting hyper-trophy program' },
      { id: 202, date: '2026-03-01', weight: 62.8, bodyFat: 25.2, note: 'Squat and deadlift numbers up' },
      { id: 203, date: '2026-03-15', weight: 63.5, bodyFat: 24.5, note: 'Lean muscle mass increase' },
    ]
  },
  { 
    id: '3', 
    name: 'Mike Johnson', 
    email: 'mike@example.com', 
    role: 'user', 
    status: 'suspended', 
    joined: '2026-03-05',
    progressLogs: [
      { id: 301, date: '2026-03-05', weight: 95.0, bodyFat: 29.0, note: 'Baseline entry' },
      { id: 302, date: '2026-03-12', weight: 94.2, bodyFat: 28.5, note: 'First week done' },
    ]
  },
  { 
    id: '4', 
    name: 'Super Admin', 
    email: 'admin@fitnesstracker.com', 
    role: 'admin', 
    status: 'active', 
    joined: '2025-12-01',
    progressLogs: [
      { id: 401, date: '2026-01-01', weight: 80.0, bodyFat: 15.0, note: 'Maintenance phase' },
      { id: 402, date: '2026-02-01', weight: 79.5, bodyFat: 14.2, note: 'Conditioning peak' },
    ]
  },
];

const initialState = {
  users: initialMockUsers,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    suspendUser(state, action) {
      const user = state.users.find(u => u.id === action.payload);
      if (user) user.status = 'suspended';
    },
    activateUser(state, action) {
      const user = state.users.find(u => u.id === action.payload);
      if (user) user.status = 'active';
    },
    deleteUser(state, action) {
      state.users = state.users.filter(u => u.id !== action.payload);
    },
    setAdminUsers(state, action) {
      state.users = action.payload;
    },
  },
});

export const { suspendUser, activateUser, deleteUser, setAdminUsers } = adminSlice.actions;
export default adminSlice.reducer;
