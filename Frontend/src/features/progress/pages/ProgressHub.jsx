import React, { useEffect, useState } from "react";
import { useProgress } from "../hooks/useProgress";
import { useNavigate } from "react-router";
import "../style/progress.scss";

export const ProgressHub = () => {
    const { fetchReadiness, data, loading, error } = useProgress();
    const navigate = useNavigate();
    const [showExplanation, setShowExplanation] = useState(false);

    useEffect(() => {
        fetchReadiness();
    }, [fetchReadiness]);

    if (loading) {
        return <div className="page-container"><p>Calculating your readiness...</p></div>;
    }

    if (!data) {
        return <div className="page-container"><p>Failed to load progress data.</p></div>;
    }

    const { overallReadiness, breakdown, roadmap, nextBestAction, weakAreas, activity, achievements } = data;

    const renderMetricCard = (label, value) => (
        <div className="card metric-card p-6">
            <div className="metric-header flex justify-between items-center mb-4">
                <span className="text-base font-semibold tracking-wide text-secondary">{label}</span>
                <span className="text-xl font-bold text-primary-light">{value !== null ? `${value}%` : '--'}</span>
            </div>
            <div className="progress-bar-bg w-full h-2 rounded bg-input overflow-hidden">
                <div 
                    className={`h-full ${value !== null ? 'bg-primary' : 'bg-transparent'}`} 
                    style={{ width: `${value || 0}%`, transition: 'width 1s ease-out' }}
                />
            </div>
        </div>
    );

    return (
        <div className="progress-hub-page page-container fade-in">
            {/* Hero Section */}
            <div className="hero-section text-center mb-10">
                <h1 className="text-4xl font-bold mb-3 tracking-wide uppercase">YOUR INTERVIEW READINESS</h1>
                <p className="text-secondary text-xl mb-10">Track your preparation, identify weak areas, and focus on what matters next.</p>
                
                {overallReadiness !== null ? (
                    <div className="readiness-score-container mb-12">
                        <div className="readiness-ring flex-col-center mx-auto">
                            <span className="score-value">{overallReadiness}%</span>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state-hero mb-8 card p-10">
                        <h2 className="text-2xl font-bold">No Data Yet</h2>
                        <p className="text-secondary mt-3 mb-6 text-lg">Complete your first interview analysis to calculate your readiness.</p>
                        <button className="btn btn-primary btn-large mx-auto" onClick={() => navigate('/analyze')}>Start Analysis</button>
                    </div>
                )}
                
                <button className="btn btn-ghost text-sm mx-auto" onClick={() => setShowExplanation(!showExplanation)}>
                    How is this calculated?
                </button>
                {showExplanation && (
                    <div className="explanation-box card mt-4 text-left fade-in max-w-md mx-auto p-6">
                        <p className="text-sm text-secondary leading-relaxed">
                            Your readiness combines:
                            <br/>• Resume analysis
                            <br/>• Latest job match
                            <br/>• Interview practice
                            <br/>• Mock interview feedback
                            <br/><br/>
                            Some factors may be unavailable until you complete more activities.
                        </p>
                    </div>
                )}
            </div>

            {overallReadiness !== null && (
                <div className="dashboard-content">
                    {/* Next Best Action (Full Width) */}
                    <div className="card next-action-card gradient-border p-8 mb-8">
                        <h2 className="text-2xl mb-3 flex items-center gap-3 font-bold uppercase tracking-wide">🚀 Next Best Action</h2>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <p className="text-lg font-medium leading-relaxed text-primary-light">{nextBestAction.message}</p>
                            <button className="btn btn-primary px-8 py-3 whitespace-nowrap" onClick={() => navigate(nextBestAction.action)}>
                                {nextBestAction.label} →
                            </button>
                        </div>
                    </div>

                    {/* Readiness Metrics Grid */}
                    <div className="metrics-grid mb-8">
                        {renderMetricCard("Resume", breakdown.resume)}
                        {renderMetricCard("Job Match", breakdown.jobMatch)}
                        {renderMetricCard("Technical", breakdown.technical)}
                        {renderMetricCard("Behavioral", breakdown.behavioral)}
                        {renderMetricCard("Practice", breakdown.practice)}
                    </div>

                    {/* 2-Column Dashboard */}
                    <div className="dashboard-grid">
                        {/* Left Column */}
                        <div className="grid-left flex flex-col gap-8">
                            {/* Roadmap */}
                            <div className="card roadmap-card p-8">
                                <h2 className="text-2xl mb-2 font-bold tracking-wide uppercase">Preparation Roadmap</h2>
                                <p className="text-secondary mb-8">Your recommended preparation path</p>
                                <div className="roadmap-steps">
                                    {roadmap.map((r, idx) => (
                                        <div key={idx} className={`roadmap-step flex items-start pb-8 ${r.status === 'Completed' ? 'completed' : r.status === 'In Progress' ? 'in-progress' : 'not-started'}`}>
                                            <div className="step-icon-col flex flex-col items-center mr-6 relative">
                                                <div className={`step-icon flex items-center justify-center rounded-full w-10 h-10 border-2 z-10 relative bg-surface ${r.status === 'Completed' ? 'border-success text-success' : r.status === 'In Progress' ? 'border-primary text-primary bg-[#6366F1]/10' : 'border-secondary text-secondary'}`}>
                                                    {r.status === 'Completed' ? '✓' : r.status === 'In Progress' ? '●' : '○'}
                                                </div>
                                                {idx < roadmap.length - 1 && <div className="step-connector absolute top-10 w-px h-full bg-light"></div>}
                                            </div>
                                            <div className="step-content pt-1">
                                                <div className="text-sm tracking-widest uppercase text-secondary font-bold mb-2">STEP {r.step}</div>
                                                <div className="font-bold text-xl mb-2">{r.title}</div>
                                                <div className={`text-base font-semibold ${r.status === 'Completed' ? 'text-success' : r.status === 'In Progress' ? 'text-primary' : 'text-secondary'}`}>
                                                    {r.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="grid-right flex flex-col gap-8">
                            {/* Activity History */}
                            <div className="card activity-card p-8">
                                <h2 className="text-2xl mb-6 font-bold tracking-wide uppercase">Recent Activity</h2>
                                {activity.length === 0 ? (
                                    <p className="text-secondary text-lg">Your progress timeline will appear after you complete more activities.</p>
                                ) : (
                                    <div className="activity-list flex flex-col gap-2">
                                        {activity.map((act, idx) => (
                                            <div key={idx} className="flex items-start gap-4 py-4 border-b border-light last:border-0">
                                                <span className="activity-icon text-2xl mt-1">{act.icon}</span>
                                                <div>
                                                    <div className="text-lg font-semibold mb-1">{act.title}</div>
                                                    <div className="text-sm text-secondary">{new Date(act.date).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Weak Areas */}
                            {weakAreas.length > 0 && (
                                <div className="card weak-areas-card p-8">
                                    <h2 className="text-xl mb-6 font-bold uppercase tracking-wide">Top Areas to Improve</h2>
                                    <div className="weak-area-list flex flex-col gap-5">
                                        {weakAreas.map((w, idx) => (
                                            <div key={idx} className="weak-area-item p-5 bg-surface rounded-xl border border-light">
                                                <div className="font-bold text-lg mb-2">{w.area}</div>
                                                <div className="text-base text-secondary mb-4 leading-relaxed">{w.reason}</div>
                                                <button className="btn btn-secondary" onClick={() => navigate('/practice')}>Practice Now</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Achievements (Full Width) */}
                    {achievements.length > 0 && (
                        <div className="card achievements-card p-8 mt-8">
                            <h2 className="text-2xl mb-6 font-bold tracking-wide uppercase">Achievements</h2>
                            <div className="flex flex-wrap gap-4">
                                {achievements.map((ach, idx) => (
                                    <div key={idx} className="achievement-item bg-[#6366F1]/10 border border-[#6366F1]/30 text-primary py-3 px-5 rounded-lg flex items-center gap-3 font-semibold text-lg uppercase tracking-wide">
                                        <span className="text-2xl">🏆</span> {ach}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
