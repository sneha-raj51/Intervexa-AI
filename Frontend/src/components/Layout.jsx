import React, { useContext, useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { AuthContext } from '../features/auth/auth.context';
import { logout } from '../features/auth/services/auth.api';
import { NotificationDrawer } from '../features/notifications/components/NotificationDrawer';
import { useNotifications } from '../features/notifications/hooks/useNotifications';
import '../style/layout.scss';

const Layout = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const moreMenuRef = useRef(null);
    const { unreadCount } = useNotifications();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
                setIsMoreOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsMoreOpen(false);
            }
        };

        if (isMoreOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isMoreOpen]);

    const handleLogout = async () => {
        await logout();
        setUser(null);
        navigate('/login');
    };

    return (
        <div className="app-layout">
            <nav className="navbar">
                <div className="navbar__container">
                    <div className="navbar__brand" onClick={() => navigate('/')}>
                        <span className="navbar__logo">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                        </span>
                        <h1 className="navbar__title">INTERVEXA <span className="navbar__title-ai">AI</span></h1>
                    </div>

                    {user && (
                        <>
                            <div className="navbar__menu">
                                <button
                                    className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Dashboard
                                </button>
                                <button
                                    className={`nav-link ${location.pathname === '/analyze' ? 'active' : ''}`}
                                    onClick={() => navigate('/analyze')}
                                >
                                    Analyze Role
                                </button>
                                <button
                                    className={`nav-link ${location.pathname.startsWith('/mock-interview') ? 'active' : ''}`}
                                    onClick={() => navigate('/mock-interview')}
                                >
                                    Interview
                                </button>
                                <button
                                    className={`nav-link ${location.pathname.startsWith('/practice') ? 'active' : ''}`}
                                    onClick={() => navigate('/practice')}
                                >
                                    Practice
                                </button>

                                <div
                                    className="more-dropdown-container"
                                    ref={moreMenuRef}
                                >
                                    <button
                                        className={`nav-link ${['/resume', '/progress', '/jobs', '/resumes', '/activity', '/career-insights'].some(path => location.pathname.startsWith(path)) ? 'active' : ''
                                            }`}
                                        onClick={() => setIsMoreOpen(prev => !prev)}
                                    >
                                        More ▾
                                    </button>
                                    {isMoreOpen && (
                                        <div className="dropdown-menu">
                                            <button className={`dropdown-item ${location.pathname.startsWith('/resume') ? 'active' : ''}`} onClick={() => { navigate('/resume'); setIsMoreOpen(false); }}>Resume Intelligence</button>
                                            <button className={`dropdown-item ${location.pathname.startsWith('/progress') ? 'active' : ''}`} onClick={() => { navigate('/progress'); setIsMoreOpen(false); }}>Progress</button>
                                            <button className={`dropdown-item ${location.pathname.startsWith('/jobs') ? 'active' : ''}`} onClick={() => { navigate('/jobs'); setIsMoreOpen(false); }}>Job Tracker</button>
                                            <button className={`dropdown-item ${location.pathname.startsWith('/resumes') ? 'active' : ''}`} onClick={() => { navigate('/resumes'); setIsMoreOpen(false); }}>Resumes</button>
                                            <button className={`dropdown-item ${location.pathname.startsWith('/activity') ? 'active' : ''}`} onClick={() => { navigate('/activity'); setIsMoreOpen(false); }}>Activity</button>
                                            <button className={`dropdown-item ${location.pathname.startsWith('/career-insights') ? 'active' : ''}`} onClick={() => { navigate('/career-insights'); setIsMoreOpen(false); }}>Insights</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="navbar__profile">
                                <button className="btn-icon bell-btn" onClick={() => setIsDrawerOpen(true)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                    {unreadCount > 0 && <span className="notification-badge"></span>}
                                </button>
                                <div className="avatar">
                                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="username">{user.username}</span>
                                <button className="btn-logout" onClick={handleLogout}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </nav>

            <main className="main-content">
                <Outlet />
            </main>

            <NotificationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </div>
    );
};

export default Layout;
