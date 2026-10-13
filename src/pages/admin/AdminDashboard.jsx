/**
 * AdminDashboard.jsx
 * 
 * Super Admin Control Panel.
 * 
 * This page provides super administrators with a complete overview of the system.
 * Features include viewing user statistics, searching for users, performing
 * administrative actions (suspend/activate/delete), and inspecting individual
 * member Progress & Improvement History Cards.
 * 
 * Linked to:
 * - src/App.jsx (Mounted at /admin)
 * - src/store/slices/adminSlice.js (Redux state for user management & progress records)
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ShieldAlert, UserCheck, Trash2, Search, LineChart, History, 
  Award, TrendingDown, Calendar, X, Scale, CheckCircle2, ArrowDownRight, ArrowUpRight 
} from 'lucide-react';
import Card from '../../components/common/Card';
import toast from 'react-hot-toast';
import { suspendUser, activateUser, deleteUser, setAdminUsers } from '../../store/slices/adminSlice';
import { fetchAllUsersFromFirebase } from '../../firebase/authService';
import { isFirebaseConfigured } from '../../firebase/config';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  
  // Pull the user database from Redux
  const users = useSelector((state) => state.admin.users);
  
  // Fetch real users from Firestore if configured
  useEffect(() => {
    let isMounted = true;
    const loadUsers = async () => {
      if (isFirebaseConfigured) {
        try {
          const fbUsers = await fetchAllUsersFromFirebase();
          if (isMounted && fbUsers.length > 0) {
            dispatch(setAdminUsers(fbUsers));
          }
        } catch (err) {
          console.error('Error fetching admin users from Firestore:', err);
        }
      }
    };
    loadUsers();
    return () => { isMounted = false; };
  }, [dispatch]);
  
  // Active Tab: 'users' or 'progress'
  const [activeTab, setActiveTab] = useState('users');
  
  // State for the local search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Selected user for Progress History Modal
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter users based on search term matching name or email
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total platform progress records
  const totalPlatformLogs = users.reduce((sum, u) => sum + (u.progressLogs?.length || 0), 0);

  /**
   * Suspends a user account, preventing them from logging in.
   */
  const handleSuspend = (id) => {
    dispatch(suspendUser(id));
    toast.success('User suspended');
  };

  /**
   * Reactivates a suspended user account.
   */
  const handleActivate = (id) => {
    dispatch(activateUser(id));
    toast.success('User activated');
  };

  /**
   * Permanently deletes a user from the database.
   */
  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to permanently delete this user?')) {
      dispatch(deleteUser(id));
      if (selectedUser?.id === id) setSelectedUser(null);
      toast.success('User deleted');
    }
  };

  return (
    <div className="admin-dashboard-container" data-aos="fade-in">
      {/* Header Section */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>Admin Control Panel</h1>
          <p>Manage user accounts, monitor system access, and review member progress history.</p>
        </div>

        {/* View Switcher Tabs */}
        <div className="admin-tabs-toggle">
          <button 
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Accounts
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            <History size={16} /> Member Progress Logs
          </button>
        </div>
      </header>

      {/* Key Statistics Grid */}
      <div className="admin-stats-grid">
        <Card glow className="stat-card" data-aos="fade-up" data-aos-delay="0">
          <div className="stat-content">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{users.length}</span>
          </div>
        </Card>
        <Card glow className="stat-card" data-aos="fade-up" data-aos-delay="100">
          <div className="stat-content">
            <span className="stat-label">Active Users</span>
            <span className="stat-value" style={{ color: 'var(--accent-success)' }}>
              {users.filter(u => u.status === 'active').length}
            </span>
          </div>
        </Card>
        <Card glow className="stat-card" data-aos="fade-up" data-aos-delay="200">
          <div className="stat-content">
            <span className="stat-label">Suspended Users</span>
            <span className="stat-value" style={{ color: 'var(--accent-warning)' }}>
              {users.filter(u => u.status === 'suspended').length}
            </span>
          </div>
        </Card>
        <Card glow className="stat-card" data-aos="fade-up" data-aos-delay="300">
          <div className="stat-content">
            <span className="stat-label">Progress Records</span>
            <span className="stat-value" style={{ color: 'var(--accent-primary)' }}>
              {totalPlatformLogs}
            </span>
          </div>
        </Card>
      </div>

      {/* =========================================
          TAB 1: USER MANAGEMENT
          ========================================= */}
      {activeTab === 'users' && (
        <Card title="User Management Directory" className="admin-table-card" data-aos="fade-up" data-aos-delay="300">
          {/* Table Toolbar (Search) */}
          <div className="table-controls">
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search users by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
            </div>
          </div>

          {/* Responsive Table Wrapper */}
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Progress Logs</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => {
                    const logsCount = user.progressLogs?.length || 0;
                    return (
                      <tr key={user.id} className={user.status === 'suspended' ? 'suspended-row' : ''}>
                        <td>{user.id}</td>
                        <td className="user-name-cell">{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.status}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>{user.joined}</td>
                        <td>
                          <button 
                            className="view-logs-badge"
                            onClick={() => setSelectedUser(user)}
                            title="Inspect improvement history"
                          >
                            <History size={14} />
                            <span>{logsCount} check-ins</span>
                          </button>
                        </td>
                        <td className="action-cells">
                          {/* Progress Quick View */}
                          <button 
                            className="icon-btn info" 
                            onClick={() => setSelectedUser(user)} 
                            title="View Improvement Cards"
                          >
                            <LineChart size={16} />
                          </button>

                          {/* Admin Account Controls */}
                          {user.role !== 'admin' && (
                            <>
                              {user.status === 'active' ? (
                                <button className="icon-btn warning" onClick={() => handleSuspend(user.id)} title="Suspend User">
                                  <ShieldAlert size={16} />
                                </button>
                              ) : (
                                <button className="icon-btn success" onClick={() => handleActivate(user.id)} title="Activate User">
                                  <UserCheck size={16} />
                                </button>
                              )}
                              <button className="icon-btn danger" onClick={() => handleDelete(user.id)} title="Delete User">
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =========================================
          TAB 2: MEMBER PROGRESS & IMPROVEMENT CARDS
          ========================================= */}
      {activeTab === 'progress' && (
        <div className="admin-progress-section" data-aos="fade-up">
          <div className="progress-section-banner glass-panel">
            <div className="banner-text">
              <h2>Member Improvements & Transformation Feeds</h2>
              <p>Review real-time client body composition changes, weight milestones, and consistency records.</p>
            </div>
          </div>

          <div className="users-progress-cards-list">
            {filteredUsers.map(user => {
              const logs = user.progressLogs || [];
              const starting = logs.length > 0 ? logs[0] : null;
              const current = logs.length > 0 ? logs[logs.length - 1] : null;
              const weightDiff = (starting && current) ? Number((current.weight - starting.weight).toFixed(1)) : 0;
              const fatDiff = (starting?.bodyFat && current?.bodyFat) ? Number((current.bodyFat - starting.bodyFat).toFixed(1)) : null;

              return (
                <Card key={user.id} glow className="user-progress-overview-card">
                  <div className="user-card-top">
                    <div className="user-meta-info">
                      <h3>{user.name}</h3>
                      <span className="user-meta-email">{user.email}</span>
                    </div>
                    <span className={`status-badge ${user.status}`}>{user.status}</span>
                  </div>

                  {/* Summary Transformation Numbers */}
                  <div className="user-stats-strip">
                    <div className="stat-strip-box">
                      <span className="strip-label">Starting Weight</span>
                      <span className="strip-val">{starting ? `${starting.weight} kg` : '--'}</span>
                    </div>
                    <div className="stat-strip-box">
                      <span className="strip-label">Current Weight</span>
                      <span className="strip-val">{current ? `${current.weight} kg` : '--'}</span>
                    </div>
                    <div className="stat-strip-box">
                      <span className="strip-label">Total Delta</span>
                      <span className={`strip-val ${weightDiff <= 0 ? 'text-success' : 'text-warning'}`}>
                        {weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg
                      </span>
                    </div>
                    {fatDiff !== null && (
                      <div className="stat-strip-box">
                        <span className="strip-label">Body Fat</span>
                        <span className="strip-val">{fatDiff > 0 ? `+${fatDiff}%` : `${fatDiff}%`}</span>
                      </div>
                    )}
                  </div>

                  {/* Improvement History Cards for this user */}
                  <div className="user-history-cards-scroll">
                    <h4>History Cards ({logs.length} Milestones)</h4>
                    {logs.length === 0 ? (
                      <p className="no-logs-msg">No progress logged yet by this user.</p>
                    ) : (
                      <div className="admin-history-cards-row">
                        {[...logs].reverse().map((log, lIdx) => {
                          const prevLog = logs[logs.length - 1 - lIdx - 1];
                          const delta = prevLog ? Number((log.weight - prevLog.weight).toFixed(1)) : null;
                          return (
                            <div key={log.id || lIdx} className="admin-mini-history-card glass-panel">
                              <div className="mini-card-head">
                                <span className="mini-date"><Calendar size={13} /> {log.date}</span>
                                {delta !== null && (
                                  <span className={`mini-delta ${delta <= 0 ? 'delta-good' : 'delta-up'}`}>
                                    {delta <= 0 ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                                    {delta > 0 ? `+${delta}` : delta} kg
                                  </span>
                                )}
                              </div>
                              <div className="mini-card-weight">
                                <span className="mini-num">{log.weight}</span>
                                <span className="mini-kg">kg</span>
                              </div>
                              {log.bodyFat && (
                                <span className="mini-fat">Body Fat: {log.bodyFat}%</span>
                              )}
                              {log.note && (
                                <p className="mini-note">"{log.note}"</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================
          MODAL: USER PROGRESS HISTORY INSPECTOR
          ========================================= */}
      {selectedUser && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-user-identity">
                <div className="modal-avatar">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h2>{selectedUser.name}'s Improvement Journey</h2>
                  <p>{selectedUser.email} • Joined {selectedUser.joined}</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedUser(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Overview Metrics */}
              {selectedUser.progressLogs && selectedUser.progressLogs.length > 0 ? (
                <>
                  <div className="modal-summary-grid">
                    <div className="modal-metric-card">
                      <Scale size={20} className="modal-metric-icon" />
                      <div>
                        <span className="m-label">Current Weight</span>
                        <span className="m-val">{selectedUser.progressLogs[selectedUser.progressLogs.length - 1].weight} kg</span>
                      </div>
                    </div>
                    <div className="modal-metric-card">
                      <TrendingDown size={20} className="modal-metric-icon text-success" />
                      <div>
                        <span className="m-label">Total Weight Change</span>
                        <span className="m-val text-success">
                          {(selectedUser.progressLogs[selectedUser.progressLogs.length - 1].weight - selectedUser.progressLogs[0].weight).toFixed(1)} kg
                        </span>
                      </div>
                    </div>
                    <div className="modal-metric-card">
                      <Award size={20} className="modal-metric-icon text-warning" />
                      <div>
                        <span className="m-label">Total Checkpoints</span>
                        <span className="m-val">{selectedUser.progressLogs.length} Entries</span>
                      </div>
                    </div>
                  </div>

                  {/* History Cards Grid */}
                  <h3 className="modal-subheading">Chronological History Cards</h3>
                  <div className="modal-history-cards-grid">
                    {[...selectedUser.progressLogs].reverse().map((log, idx) => {
                      const prevLog = selectedUser.progressLogs[selectedUser.progressLogs.length - 1 - idx - 1];
                      const delta = prevLog ? Number((log.weight - prevLog.weight).toFixed(1)) : null;

                      return (
                        <div key={log.id || idx} className="history-card modal-history-card glass-panel">
                          <div className="history-card-header">
                            <div className="history-date-box">
                              <Calendar size={14} />
                              <span>{log.date}</span>
                            </div>
                            <span className="status-done">
                              <CheckCircle2 size={13} /> Recorded
                            </span>
                          </div>
                          <div className="history-card-body">
                            <div className="history-main-stat">
                              <div className="weight-display">
                                <span className="weight-number">{log.weight}</span>
                                <span className="weight-unit">kg</span>
                              </div>
                              {delta !== null && (
                                <div className={`history-delta-badge ${delta <= 0 ? 'delta-good' : 'delta-up'}`}>
                                  {delta <= 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                                  <span>{delta > 0 ? `+${delta}` : delta} kg</span>
                                </div>
                              )}
                            </div>
                            {log.bodyFat && (
                              <div className="sub-stat-item">
                                <span className="sub-stat-label">Body Fat</span>
                                <span className="sub-stat-value">{log.bodyFat}%</span>
                              </div>
                            )}
                            {log.note && (
                              <p className="modal-log-note">"{log.note}"</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="empty-modal-state">
                  <History size={48} />
                  <p>This user has not logged any measurements yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
