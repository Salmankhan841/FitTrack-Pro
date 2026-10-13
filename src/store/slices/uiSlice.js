import { createSlice } from '@reduxjs/toolkit';

if (typeof window !== 'undefined') {
  try {
    localStorage.setItem('theme', 'dark');
  } catch {}
}

const initialState = {
  theme: 'dark',
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = 'dark';
    },
    setTheme(state) {
      state.theme = 'dark';
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
