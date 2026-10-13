import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileBottomNav from './MobileBottomNav';
import './AppLayout.css';

const AppLayout = () => {
  return (
    <div className="app-layout">
      {/* Viewport-locked responsive dark theme gym canvas */}
      <div className="app-bg-canvas" aria-hidden="true" />
      <Sidebar />
      <div className="app-content-wrapper">
        <Topbar />
        <main className="app-main-content">
          <Outlet />
        </main>
        <footer className="app-footer">
          <div className="app-footer-inner">
            <span className="app-footer-brand">FitTrack <span>Pro</span> &copy; {new Date().getFullYear()} · All rights reserved</span>
            <div className="app-footer-status">
              <span className="status-dot" />
              <span>Cloud Synced · v2.4</span>
            </div>
          </div>
        </footer>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default AppLayout;
