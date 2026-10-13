import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  workouts: [
    {
      id: 1,
      exerciseName: 'Barbell Flat Bench Press',
      muscleGroup: 'Chest',
      sets: 4,
      reps: 10,
      weight: 85,
      date: new Date().toISOString().split('T')[0],
      duration: 35
    },
    {
      id: 2,
      exerciseName: 'Weighted Pull-Ups',
      muscleGroup: 'Back',
      sets: 4,
      reps: 8,
      weight: 15,
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      duration: 30
    },
    {
      id: 3,
      exerciseName: 'Standing Overhead Press',
      muscleGroup: 'Shoulders',
      sets: 3,
      reps: 12,
      weight: 50,
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      duration: 25
    }
  ],
  loading: false,
  error: null,
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    addWorkout(state, action) {
      state.workouts.unshift(action.payload); // Add to beginning of array so newest is first
    },
    deleteWorkout(state, action) {
      state.workouts = state.workouts.filter(w => w.id !== action.payload);
    },
    editWorkout(state, action) {
      const index = state.workouts.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.workouts[index] = action.payload;
      }
    },
    setWorkouts(state, action) {
      state.workouts = action.payload;
    },
  },
});

export const { setLoading, setError, addWorkout, deleteWorkout, editWorkout, setWorkouts } = workoutSlice.actions;
export default workoutSlice.reducer;
