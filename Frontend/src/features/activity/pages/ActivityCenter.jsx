import React, { useState } from 'react';
import { useActivity } from '../hooks/useActivity';
import '../style/activity.scss';

export const ActivityCenter = () => {
    const { activities, loading } = useActivity();
    const [filter, setFilter] = useState('ALL');

    const filters = ['ALL', 'INTERVIEW', 'PRACTICE', 'JOB', 'RESUME', 'PROGRESS'];

    const filteredActivities = activities.filter(a => {
        if (filter === 'ALL') return true;
        // Mapping general types to filters
        return a.type.startsWith(filter);
    });

    return (
        <div className="activity-page fade-in">
            <div className="activity-container">
                <header className="page-header">
                    <div className="header-content">
                        <h1>Activity Center</h1>
                        <p>Track your interview preparation journey.</p>
                    </div>
                </header>

                <div className="filters-bar">
                    {filters.map(f => (
                        <button 
                            key={f}
                            className={`filter-chip ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                    </div>
                ) : filteredActivities.length === 0 ? (
                    <div className="empty-state card text-center p-8 mx-auto mt-8 max-w-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted mx-auto mb-4"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        <h2 className="text-xl font-bold mb-2">No activity yet</h2>
                        <p className="text-secondary mb-4">Complete an interview, practice questions, analyze a role, or add a job to start building your preparation history.</p>
                    </div>
                ) : (
                    <div className="timeline">
                        {filteredActivities.map(activity => (
                            <div key={activity._id} className="timeline-item">
                                <div className="timeline-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <div className="timeline-content card">
                                    <span className="timeline-time">{new Date(activity.createdAt).toLocaleString()}</span>
                                    <h3 className="timeline-title">{activity.title}</h3>
                                    <p className="timeline-desc">{activity.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
