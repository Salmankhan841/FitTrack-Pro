import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  meals: [
    {
      id: 1,
      mealName: 'Grilled Chicken Breast & Sweet Potato',
      mealType: 'Lunch',
      calories: 650,
      protein: 56,
      carbs: 62,
      fats: 12,
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: 2,
      mealName: 'Oatmeal with Whey Protein & Almonds',
      mealType: 'Breakfast',
      calories: 520,
      protein: 44,
      carbs: 58,
      fats: 14,
      date: new Date().toISOString().split('T')[0]
    }
  ],
  dailyGoal: {
    calories: 2500,
    protein: 150,
    carbs: 300,
    fats: 70
  },
  lastCongratulatedDate: null,
  loading: false,
  error: null,
};

const nutritionSlice = createSlice({
  name: 'nutrition',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    addMeal(state, action) {
      state.meals.unshift(action.payload); // Add to beginning
    },
    editMeal(state, action) {
      const index = state.meals.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.meals[index] = action.payload;
      }
    },
    deleteMeal(state, action) {
      state.meals = state.meals.filter(m => m.id !== action.payload);
    },
    setMeals(state, action) {
      state.meals = action.payload;
    },
    setDailyGoal(state, action) {
      // If a number is passed (legacy support), just update calories. Otherwise update the object.
      if (typeof action.payload === 'number') {
        state.dailyGoal.calories = action.payload;
      } else {
        state.dailyGoal = { ...state.dailyGoal, ...action.payload };
      }
    },
    setLastCongratulatedDate(state, action) {
      state.lastCongratulatedDate = action.payload;
    }
  },
});

export const { setLoading, setError, addMeal, editMeal, deleteMeal, setMeals, setDailyGoal, setLastCongratulatedDate } = nutritionSlice.actions;
export default nutritionSlice.reducer;
