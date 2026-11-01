import { createSlice } from '@reduxjs/toolkit';

export const SAMPLE_LOGS = [
  { id: 1, date: '2023-10-01', weight: 80, bodyFat: 20 },
  { id: 2, date: '2023-10-08', weight: 78.5, bodyFat: 19.5 },
  { id: 3, date: '2023-10-15', weight: 76.8, bodyFat: 19 },
  { id: 4, date: '2023-10-22', weight: 75.2, bodyFat: 18.5 },
];

const initialState = {
  logs: [],
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
  extraReducers: (builder) => {
    builder.addCase('auth/logout', (state) => {
      state.logs = [];
    });
  },
});

export const { addProgressLog, deleteProgressLog, setProgressLogs, setLoading, setError } = progressSlice.actions;
export default progressSlice.reducer;
