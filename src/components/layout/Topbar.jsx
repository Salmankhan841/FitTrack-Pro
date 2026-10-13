/**
 * Topbar.jsx
 * 
 * Top Navigation Bar.
 * Clean, practical, humanized header with navigation drawer toggle,
 * search link, theme switcher, and user profile pill.
 */

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  LogOut, 
  Menu, 
  Search 
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
import ftLogo from '../../assets/images/ft_logo.jpg';
import './Topbar.css';

const Topbar = () => {
  const user = useSelector((state) => state.auth.user);
  const notifications = useSelector((state) => state.notification.notifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="topbar">
      {/* Left: Mobile Drawer Button & Logo / Search */}
      <div className="topbar-left">
        <button 
          className="topbar-menu-btn" 
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="topbar-mobile-logo">
          <img src={ftLogo} alt="FitTrack Pro" className="topbar-logo-img" />
          <span className="topbar-logo-title">FitTrack <span>Pro</span></span>
        </div>

        {/* Desktop Search Link */}
        <Link to="/search" className="topbar-search-link">
          <Search size={16} className="search-icon" />
          <span className="search-placeholder">Search your workouts, meals, logs...</span>
        </Link>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="topbar-actions">
        <Link to="/search" className="icon-btn mobile-search-btn" title="Search">
          <Search size={18} />
        </Link>

        {/* Notification Bell */}
        <Link to="/notifications" className="icon-btn notification-btn" title="Notifications">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </Link>

        {/* User Pill */}
        <Link to="/settings" className="user-profile-pill" title="My Profile & Settings">
          <div className="avatar-wrap">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user?.name || 'User'} className="avatar-img" />
            ) : (
              <span className="avatar-letter">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            )}
            <span className="avatar-status-dot" />
          </div>
          <div className="user-text-wrap">
            <span className="user-name">{user?.name || 'Member'}</span>
            <span className="user-role-tag">{user?.role === 'admin' ? 'Admin' : 'Athlete'}</span>
          </div>
        </Link>

        {/* Quick Logout for mobile */}
        <button 
          className="icon-btn logout-mobile-btn" 
          onClick={handleLogout} 
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
