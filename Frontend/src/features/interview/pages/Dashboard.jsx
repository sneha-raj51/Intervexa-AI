import React, { useContext } from 'react';
import { useNavigate } from 'react-router';
import { useInterview } from '../hooks/useInterview';
import { useActivity } from '../../activity/hooks/useActivity';
import { useReminders } from '../../reminders/hooks/useReminders';
import { AuthContext } from '../../auth/auth.context';
import '../style/dashboard.scss';

const Dashboard = () => {
    const { reports, loading: interviewLoading } = useInterview();
    const { activities, loading: activityLoading } = useActivity();
    const { reminders, loading: reminderLoading, editReminder } = useReminders();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const loading = interviewLoading || activityLoading || reminderLoading;

    if (loading && reports.length === 0) {
        return (
            <main className='loading-screen'>
                <div className='spinner'></div>
            </main>
        );
    }

    // --- Readiness Engine V1 Calculations ---
    const hasData = reports && reports.length > 0;
    const latestReport = hasData ? reports[0] : null;

    // We'll calculate readiness from the latest report's match score.
    // If we have multiple reports, maybe we average them, but let's stick to the latest for clarity.
    const readinessScore = latestReport ? latestReport.matchScore : 0;
    
    // Derived sub-scores based on matchScore and skill gaps for visual purposes.
    // We constrain them to be roughly correlated to the real matchScore.
    const technicalScore = latestReport ? Math.max(0, latestReport.matchScore - (latestReport.skillGaps?.filter(g => g.severity === 'high').length * 5 || 0)) : 0;
    const behavioralScore = latestReport ? Math.min(100, latestReport.matchScore + 10) : 0;
    
    // Gather unique top skill gaps from all available reports
    let topGaps = [];
    if (hasData) {
        const gapMap = {};
        reports.forEach(report => {
            if (report.skillGaps) {
                report.skillGaps.forEach(gap => {
                    if (!gapMap[gap.skill] || gap.severity === 'high') {
                        gapMap[gap.skill] = gap.severity;
                    }
                });
            }
        });
        topGaps = Object.entries(gapMap).map(([skill, severity]) => ({ skill, severity })).slice(0, 5);
    }

    // Determine the next best action dynamically
    let nextAction = { msg: "Analyze a new job description to get started.", action: () => navigate('/analyze'), btn: "Analyze a Role" };
    if (hasData) {
        if (readinessScore < 70) {
            nextAction = { msg: "Your overall readiness is a bit low. Focus on improving missing skills.", action: () => navigate(`/interview/${latestReport._id}`), btn: "Review Latest Report" };
        } else if (topGaps.filter(g => g.severity === 'high').length > 0) {
            nextAction = { msg: `You have critical skill gaps. Review your technical preparation.`, action: () => navigate(`/interview/${latestReport._id}`), btn: "View Roadmap" };
        } else {
            nextAction = { msg: "You're in great shape! Practice your behavioral questions to build confidence.", action: () => navigate(`/interview/${latestReport._id}`), btn: "Practice Behavioral" };
        }
    }

    return (
        <div className="dashboard-page fade-in">
            <header className="dashboard-header">
                <div>
                    <h1>Good {new Date().getHours() < 12 ? 'morning' : 'evening'}, {user?.username || 'Guest'} 👋</h1>
                    <p>Ready to become interview-ready?</p>
                </div>
                <button className="btn-primary btn-glow" onClick={() => navigate('/analyze')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Analyze New Job
                </button>
            </header>

            {!hasData ? (
                <div className="empty-state card">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="empty-icon text-muted"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                    <h2>No interview strategies yet</h2>
                    <p>Analyze your first job to calculate your readiness and start building your preparation history.</p>
                    <button className="btn-secondary" onClick={() => navigate('/analyze')}>Start your first analysis</button>
                </div>
            ) : (
                <div className="dashboard-grid">
                    {/* Top Row: Readiness & Gaps */}
                    <div className="card readiness-card">
                        <div className="card__header">
                            <h2>INTERVIEW READINESS</h2>
                        </div>
                        <div className="card__body flex-row-center">
                            <div className="readiness-score">
                                <svg viewBox="0 0 36 36" className="circular-chart primary">
                                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path className="circle" strokeDasharray={`${readinessScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <div className="score-text">
                                    <span className="value">{readinessScore}</span>
                                    <span className="pct">%</span>
                                </div>
                            </div>
                            <div className="readiness-info">
                                <h3>Your current preparation level</h3>
                                <p className="text-muted text-sm">Your readiness score is based on your latest interview analysis.</p>
                            </div>
                        </div>
                    </div>

                    <div className="card snapshot-card">
                        <div className="card__header">
                            <h2>PREPARATION SNAPSHOT</h2>
                        </div>
                        <div className="card__body">
                            <div className="progress-item">
                                <div className="progress-item__labels">
                                    <span>Job Match</span>
                                    <span>{readinessScore}%</span>
                                </div>
                                <div className="progress-bar"><div className="progress-bar__fill" style={{ width: `${readinessScore}%` }}></div></div>
                            </div>
                            <div className="progress-item">
                                <div className="progress-item__labels">
                                    <span>Technical Alignment</span>
                                    <span>{technicalScore}%</span>
                                </div>
                                <div className="progress-bar"><div className="progress-bar__fill" style={{ width: `${technicalScore}%` }}></div></div>
                            </div>
                            <div className="progress-item">
                                <div className="progress-item__labels">
                                    <span>Behavioral Alignment</span>
                                    <span>{behavioralScore}%</span>
                                </div>
                                <div className="progress-bar"><div className="progress-bar__fill" style={{ width: `${behavioralScore}%` }}></div></div>
                            </div>
                        </div>
                    </div>

                    {/* Second Row: Gaps & Next Action */}
                    <div className="card gaps-card">
                        <div className="card__header">
                            <h2>TOP SKILL GAPS</h2>
                        </div>
                        <div className="card__body gaps-list">
                            {topGaps.length > 0 ? topGaps.map((gap, i) => (
                                <div key={i} className="gap-item">
                                    <span className="gap-item__name">{gap.skill}</span>
                                    <span className={`badge badge--${gap.severity}`}>
                                        {gap.severity === 'high' ? 'Needs Practice' : 'Improve Fundamentals'}
                                    </span>
                                </div>
                            )) : (
                                <p className="text-muted">No major skill gaps identified across your recent reports.</p>
                            )}
                        </div>
                    </div>

                    <div className="card action-card">
                        <div className="card__header">
                            <h2>NEXT BEST ACTION</h2>
                        </div>
                        <div className="card__body action-body">
                            <div className="action-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                            </div>
                            <p className="action-text">{nextAction.msg}</p>
                            <button className="btn-secondary" onClick={nextAction.action}>{nextAction.btn}</button>
                        </div>
                    </div>
                </div>
            )}

            {hasData && (
                <section className="recent-interviews-section">
                    <h2>Recent Interviews</h2>
                    <div className="reports-grid">
                        {reports.slice(0, 6).map(report => (
                            <div key={report._id} className="report-card" onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || 'Untitled Position'}</h3>
                                <p className="report-meta">{new Date(report.createdAt).toLocaleDateString()}</p>
                                <div className="report-footer">
                                    <span className={`score-badge ${report.matchScore >= 80 ? 'high' : report.matchScore >= 60 ? 'mid' : 'low'}`}>
                                        {report.matchScore}% Match
                                    </span>
                                    <span className="view-link">View Report →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="dashboard-bottom-row">
                <section className="reminders-section card">
                    <div className="card__header flex-between">
                        <h2>UPCOMING REMINDERS</h2>
                        <button className="btn-text btn-sm" onClick={() => navigate('/activity')}>View All</button>
                    </div>
                    <div className="card__body reminders-list">
                        {reminders.filter(r => !r.completed).slice(0, 5).map(reminder => (
                            <div key={reminder._id} className="reminder-item">
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={reminder.completed} 
                                        onChange={() => editReminder(reminder._id, { completed: true })} 
                                    />
                                    <span className="checkmark"></span>
                                </label>
                                <div className="reminder-content">
                                    <h4>{reminder.title}</h4>
                                    <span className="reminder-date">
                                        {new Date(reminder.dueDate).toLocaleDateString()} {new Date(reminder.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {reminders.filter(r => !r.completed).length === 0 && (
                            <p className="text-muted text-sm">No upcoming reminders.</p>
                        )}
                    </div>
                </section>

                <section className="activity-section card">
                    <div className="card__header flex-between">
                        <h2>RECENT ACTIVITY</h2>
                        <button className="btn-text btn-sm" onClick={() => navigate('/activity')}>View All</button>
                    </div>
                    <div className="card__body activity-list">
                        {activities.slice(0, 5).map(activity => (
                            <div key={activity._id} className="activity-item mini">
                                <div className="activity-icon-mini">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <div className="activity-content-mini">
                                    <h4>{activity.title}</h4>
                                    <span className="activity-time">{new Date(activity.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                        {activities.length === 0 && (
                            <p className="text-muted text-sm">No recent activity.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
