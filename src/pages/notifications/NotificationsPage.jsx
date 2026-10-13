import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { markAsRead, markAllAsRead, markAllAsUnread } from '../../store/slices/notificationSlice';
import { Bell, Dumbbell, Apple, Settings, Check, CheckCircle2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.notification.notifications);
  
  const getIcon = (category) => {
    switch(category) {
      case 'Workout': return <Dumbbell size={24} />;
      case 'Diet': return <Apple size={24} />;
      case 'System': return <Settings size={24} />;
      default: return <Bell size={24} />;
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Workout': return 'var(--accent-primary)';
      case 'Diet': return 'var(--accent-success)';
      case 'System': return 'var(--accent-secondary)';
      default: return 'var(--text-secondary)';
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-container" data-aos="fade-in">
      <header className="notifications-header">
        <div className="header-title">
          <h1>Notifications</h1>
          {unreadCount > 0 && <span className="badge">{unreadCount} new</span>}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" onClick={() => dispatch(markAllAsUnread())} disabled={unreadCount === notifications.length}>
            <CheckCircle2 size={18} style={{ marginRight: '8px' }} />
            Mark all as unread
          </Button>
          <Button variant="secondary" onClick={() => dispatch(markAllAsRead())} disabled={unreadCount === 0}>
            <Check size={18} style={{ marginRight: '8px' }} />
            Mark all as read
          </Button>
        </div>
      </header>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} className="empty-icon" />
            <p>You're all caught up! No notifications right now.</p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <div key={notification.id} data-aos="fade-left" data-aos-delay={index * 50}>
              <Card 
                className={`notification-card ${!notification.read ? 'unread' : 'read'}`}
              >
                <div className="notification-content">
                  <div 
                    className="notification-icon" 
                    style={{ 
                      color: getCategoryColor(notification.category),
                      backgroundColor: `${getCategoryColor(notification.category)}15` 
                    }}
                  >
                    {getIcon(notification.category)}
                  </div>
                  
                  <div className="notification-text">
                    <h3>{notification.title}</h3>
                    <p>{notification.message}</p>
                    <span className="notification-date">{formatDate(notification.date)}</span>
                  </div>
                  
                  <div className="notification-actions">
                    {!notification.read ? (
                      <button 
                        className="mark-read-btn" 
                        onClick={() => dispatch(markAsRead(notification.id))}
                        title="Mark as read"
                      >
                        <span className="dot-indicator"></span>
                      </button>
                    ) : (
                      <CheckCircle2 size={20} color="var(--text-muted)" />
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
