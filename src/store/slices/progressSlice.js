import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  logs: [
    // Pre-populate with some mock data for the chart
    { id: 1, date: '2023-10-01', weight: 180, bodyFat: 20 },
    { id: 2, date: '2023-10-08', weight: 178, bodyFat: 19.5 },
    { id: 3, date: '2023-10-15', weight: 176, bodyFat: 19 },
    { id: 4, date: '2023-10-22', weight: 175, bodyFat: 18.5 },
  ],
  loading: false,
  error: null,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    addProgressLog(state, action) {
      state.logs.push(action.payload);
      // Sort logs by date to ensure the chart renders correctly
      state.logs.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    deleteProgressLog(state, action) {
      state.logs = state.logs.filter(log => log.id !== action.payload);
    },
    setProgressLogs(state, action) {
      state.logs = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { addProgressLog, deleteProgressLog, setProgressLogs, setLoading, setError } = progressSlice.actions;
export default progressSlice.reducer;
