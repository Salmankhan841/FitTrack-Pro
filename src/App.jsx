/**
 * App.jsx
 * 
 * Core Application Router and Configuration.
 * 
 * This file is the root entry point for all routing logic in the FitTrack Pro application.
 * It connects the URL paths to their respective React page components and enforces
 * authentication rules (e.g., preventing logged-out users from seeing the dashboard).
 * 
 * Linked to: 
 * - src/main.jsx (Entry point)
 * - src/routes/ProtectedRoute.jsx (Authentication guard)
 * - src/routes/AdminRoute.jsx (Admin guard)
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';
import useFirebaseSync from './hooks/useFirebaseSync';

// Layouts
import AppLayout from './components/layout/AppLayout';
import LandingLayout from './components/layout/LandingLayout';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

// Pages
import LandingPage from './pages/landing/LandingPage';
import Dashboard from './pages/dashboard/Dashboard';
import WorkoutTracking from './pages/workout/WorkoutTracking';
import NutritionTracking from './pages/nutrition/NutritionTracking';
import ProgressTracking from './pages/progress/ProgressTracking';
import SettingsPage from './pages/settings/SettingsPage';
import ReportsPage from './pages/reports/ReportsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import SearchPage from './pages/search/SearchPage';
import AdminDashboard from './pages/admin/AdminDashboard';

// Route listener to refresh card slide animations on page transition
function RouteTransitionHandler() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const timer = setTimeout(() => {
      AOS.refresh();
    }, 60);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

function App() {
  useFirebaseSync();

  useEffect(() => {
    // Initialize Animate On Scroll (AOS) with lightweight settings to avoid scroll jank
    AOS.init({
      duration: 500,
      once: true,
      offset: 20
    });

    // Enforce dark theme across the entire application
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  }, []);

  return (
    <BrowserRouter>
      <RouteTransitionHandler />
      {/* Global Toast Notification Container */}
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)'
          }
        }}
      />
      
      <Routes>
        {/* =========================================
            PUBLIC ROUTES
            ========================================= */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* =========================================
            PROTECTED USER ROUTES 
            Requires user to be logged in (token active)
            ========================================= */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workouts" element={<WorkoutTracking />} />
          <Route path="/nutrition" element={<NutritionTracking />} />
          <Route path="/progress" element={<ProgressTracking />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Route>

        {/* =========================================
            ADMIN ROUTES 
            Requires user to have role === 'admin'
            ========================================= */}
        <Route element={<AdminRoute><AppLayout /></AdminRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<div><h2>404 Not Found</h2></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
