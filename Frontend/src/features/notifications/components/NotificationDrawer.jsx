import React from 'react';
import { useNavigate } from 'react-router';
import { useNotifications } from '../hooks/useNotifications';
import '../style/notification.scss';

export const NotificationDrawer = ({ isOpen, onClose }) => {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            await markAsRead(notif._id);
        }
        
        // Basic routing based on type
        if (notif.type === 'INTERVIEW') navigate(`/interview/${notif.relatedEntityId}`);
        else if (notif.type === 'PRACTICE') navigate('/practice');
        else if (notif.type === 'JOB') navigate(`/jobs/${notif.relatedEntityId}`);
        else if (notif.type === 'RESUME') navigate('/resumes');
        else if (notif.type === 'PROGRESS') navigate('/progress');
        
        onClose();
    };

    return (
        <>
            <div className="drawer-overlay" onClick={onClose}></div>
            <div className={`notification-drawer ${isOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <h2>Notifications {unreadCount > 0 && <span className="badge">{unreadCount}</span>}</h2>
                    <div className="drawer-actions">
                        {unreadCount > 0 && (
                            <button className="btn-text btn-sm" onClick={markAllAsRead}>Mark all as read</button>
                        )}
                        <button className="btn-icon" onClick={onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>

                <div className="drawer-content">
                    {loading ? (
                        <div className="drawer-loading">
                            <div className="spinner"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="empty-state">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            <p>You’re all caught up.</p>
                            <span className="text-sm text-muted">Meaningful updates from your interview preparation will appear here.</span>
                        </div>
                    ) : (
                        <div className="notification-list">
                            {notifications.map(notif => (
                                <div 
                                    key={notif._id} 
                                    className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notif)}
                                >
                                    {!notif.isRead && <div className="unread-dot"></div>}
                                    <div className="notif-content">
                                        <h4 className="notif-title">{notif.title}</h4>
                                        <p className="notif-message">{notif.message}</p>
                                        <span className="notif-time">{new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
