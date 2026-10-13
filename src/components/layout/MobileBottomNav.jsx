import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  LayoutDashboard, 
  Activity, 
  Apple, 
  TrendingUp, 
  Menu 
} from 'lucide-react';
import { toggleSidebar } from '../../store/slices/uiSlice';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
  const dispatch = useDispatch();

  return (
    <nav className="mobile-bottom-nav">
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <LayoutDashboard size={20} className="bottom-nav-icon" />
        <span>Dashboard</span>
      </NavLink>

      <NavLink 
        to="/workouts" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Activity size={20} className="bottom-nav-icon" />
        <span>Workouts</span>
      </NavLink>

      <NavLink 
        to="/nutrition" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Apple size={20} className="bottom-nav-icon" />
        <span>Nutrition</span>
      </NavLink>

      <NavLink 
        to="/progress" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <TrendingUp size={20} className="bottom-nav-icon" />
        <span>Progress</span>
      </NavLink>

      <button 
        className="bottom-nav-item bottom-nav-more"
        onClick={() => dispatch(toggleSidebar())}
        aria-label="Open full menu"
      >
        <Menu size={20} className="bottom-nav-icon" />
        <span>More</span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
