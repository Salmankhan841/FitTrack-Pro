/**
 * Sidebar.jsx
 * 
 * Main Navigation Sidebar & Mobile Drawer.
 * Clean, human, easy-to-use navigation for workouts, diet, and progress.
 */

import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LogOut, 
  LayoutDashboard, 
  Activity, 
  Apple, 
  TrendingUp, 
  Bell, 
  Search, 
  Settings, 
  FileText, 
  ShieldAlert,
  X
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { setSidebarOpen } from '../../store/slices/uiSlice';
import ftLogo from '../../assets/images/ft_logo.jpg';
import './Sidebar.css';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = useSelector((state) => state.auth.user);
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const notifications = useSelector((state) => state.notification.notifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    dispatch(setSidebarOpen(false));
  }, [location.pathname, dispatch]);

  const handleLogout = () => {
    dispatch(setSidebarOpen(false));
    dispatch(logout());
    navigate('/');
  };

  const handleLinkClick = () => {
    if (window.innerWidth <= 1024) {
      dispatch(setSidebarOpen(false));
    }
  };

  return (
    <>
      {/* Mobile/Tablet Backdrop Overlay */}
      <div 
        className={`sidebar-backdrop ${sidebarOpen ? 'active' : ''}`}
        onClick={() => dispatch(setSidebarOpen(false))}
        aria-hidden="true"
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={ftLogo} alt="FitTrack Pro" className="custom-ft-logo" />
            <div className="logo-text">
              <h2>FitTrack <span>Pro</span></h2>
              <span className="logo-badge">FITNESS TRACKER</span>
            </div>
          </div>
          
          {/* Close button on mobile/tablet */}
          <button 
            className="sidebar-close-btn"
            onClick={() => dispatch(setSidebarOpen(false))}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="sidebar-user-chip">
          <div className="sidebar-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="sidebar-user-meta">
            <span className="sidebar-user-name">{user?.name || 'My Profile'}</span>
            <span className="sidebar-user-role">{user?.role === 'admin' ? 'Admin' : 'Member'}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <span className="nav-section-label">TRACKING</span>

          {user?.role === 'admin' && (
            <NavLink 
              to="/admin" 
              className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <ShieldAlert size={19} className="nav-icon" />
              <span>Admin Panel</span>
            </NavLink>
          )}

          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <LayoutDashboard size={19} className="nav-icon" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/workouts" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <Activity size={19} className="nav-icon" />
            <span>Workouts</span>
          </NavLink>

          <NavLink 
            to="/nutrition" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <Apple size={19} className="nav-icon" />
            <span>Nutrition & Meals</span>
          </NavLink>

          <NavLink 
            to="/progress" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <TrendingUp size={19} className="nav-icon" />
            <span>Weight & Progress</span>
          </NavLink>

          <span className="nav-section-label" style={{ marginTop: '0.75rem' }}>TOOLS & REPORTS</span>

          <NavLink 
            to="/reports" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <FileText size={19} className="nav-icon" />
            <span>Export Reports</span>
          </NavLink>

          <NavLink 
            to="/notifications" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <Bell size={19} className="nav-icon" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="nav-badge-pill">{unreadCount}</span>
            )}
          </NavLink>

          <NavLink 
            to="/search" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <Search size={19} className="nav-icon" />
            <span>Search Records</span>
          </NavLink>
        </nav>

        {/* Footer Actions */}
        <div className="sidebar-footer">

          <NavLink 
            to="/settings" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <Settings size={19} className="nav-icon" />
            <span>Settings</span>
          </NavLink>

          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={19} className="nav-icon" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
