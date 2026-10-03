import React from 'react';
import { useNavigate } from 'react-router';
import { useInsights } from '../hooks/useInsights';
import '../style/insights.scss';

export const CareerInsights = () => {
    const { insight, loading, refreshing, refreshInsights } = useInsights();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="insights-page fade-in">
                <div className="insights-container">
                    <div className="insights-loading flex flex-col items-center justify-center min-h-[50vh]">
                        <div className="spinner mb-4"></div>
                        <p className="text-secondary font-medium">Analyzing your preparation journey...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!insight || !insight.data) {
        return (
            <div className="insights-page fade-in">
                <div className="insights-container">
                    <header className="insights-header mb-8">
                        <div>
                            <h1>AI Career Insights</h1>
                            <p>Turn your preparation data into actionable interview guidance.</p>
                            <small className="text-secondary">Personalized insights based on your resume, job matches, practice activity, and interview performance.</small>
                        </div>
                    </header>
                    <div className="insights-empty card text-center p-12 max-w-2xl mx-auto mt-8">
                        <h2 className="text-2xl font-bold mb-4">No Insights Yet</h2>
                        <p className="text-secondary mb-8">Complete a mock interview, analyze a job, or track your resume to start gathering insights.</p>
                        <button className="btn-primary px-8 py-3 rounded-xl font-medium" onClick={() => navigate('/analyze')}>Analyze a Role</button>
                    </div>
                </div>
            </div>
        );
    }

    const { data } = insight;

    return (
        <div className="insights-page fade-in">
            <div className="insights-container">
                <header className="insights-header">
                    <div>
                        <h1>AI Career Insights</h1>
                        <p>Turn your preparation data into actionable interview guidance.</p>
                        <small className="text-secondary">Personalized insights based on your resume, job matches, practice activity, and interview performance.</small>
                    </div>
                    <button className="btn-secondary" onClick={refreshInsights} disabled={refreshing}>
                        {refreshing ? 'Refreshing...' : 'Refresh Insights'}
                    </button>
                </header>

                <div className="insights-grid">
                {/* Top Row: Readiness & Strengths/Focus */}
                <div className="card hero-card">
                    <div className="card__body flex-row">
                        <div className="readiness-block">
                            <h3>Overall Readiness</h3>
                            <div className="readiness-score-lg">
                                <span className="value">{data.overallReadiness}</span>
                                <span className="pct">%</span>
                            </div>
                            <p className="text-muted text-sm">Based on recent metrics.</p>
                        </div>
                        <div className="lists-block">
                            <div className="strengths">
                                <h4>Top Strengths</h4>
                                <ul>
                                    {data.topStrengths?.map((s, i) => <li key={i}>✓ {s}</li>)}
                                </ul>
                            </div>
                            <div className="focus-areas">
                                <h4>Focus Areas</h4>
                                <ul>
                                    {data.focusAreas?.map((f, i) => <li key={i}>⚠ {f}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Best Action */}
                <div className="card action-card highlight">
                    <div className="card__body action-body">
                        <h2>Your Next Best Action</h2>
                        <h3>{data.nextBestAction?.title}</h3>
                        <p>{data.nextBestAction?.description}</p>
                        <button className="btn-primary btn-glow" onClick={() => navigate(data.nextBestAction?.recommendedRoute || '/')}>
                            Start Now
                        </button>
                    </div>
                </div>

                {/* Skill Intelligence */}
                <div className="card skill-intel-card">
                    <div className="card__header">
                        <h2>SKILL INTELLIGENCE</h2>
                    </div>
                    <div className="card__body skill-grid">
                        {data.skillIntelligence?.map((skill, i) => (
                            <div key={i} className="skill-item">
                                <span className="skill-name">{skill.skill}</span>
                                <span className={`badge badge--${skill.level.replace(/\s+/g, '-').toLowerCase()}`}>{skill.level}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Interview Insights */}
                <div className="card interview-intel-card">
                    <div className="card__header">
                        <h2>INTERVIEW INSIGHTS</h2>
                    </div>
                    <div className="card__body">
                        <div className="progress-item">
                            <div className="progress-item__labels">
                                <span>Technical Accuracy</span>
                                <span>{data.interviewInsights?.technicalAccuracy}/10</span>
                            </div>
                            <div className="progress-bar"><div className="progress-bar__fill" style={{ width: `${(data.interviewInsights?.technicalAccuracy || 0) * 10}%` }}></div></div>
                        </div>
                        <div className="progress-item">
                            <div className="progress-item__labels">
                                <span>Answer Depth</span>
                                <span>{data.interviewInsights?.answerDepth}/10</span>
                            </div>
                            <div className="progress-bar"><div className="progress-bar__fill" style={{ width: `${(data.interviewInsights?.answerDepth || 0) * 10}%` }}></div></div>
                        </div>
                        <div className="progress-item">
                            <div className="progress-item__labels">
                                <span>Behavioral Structure</span>
                                <span>{data.interviewInsights?.behavioralStructure}/10</span>
                            </div>
                            <div className="progress-bar"><div className="progress-bar__fill" style={{ width: `${(data.interviewInsights?.behavioralStructure || 0) * 10}%` }}></div></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="insights-bottom">
                <section className="card recommendations-card">
                    <div className="card__header">
                        <h2>PERSONALIZED RECOMMENDATIONS</h2>
                    </div>
                    <div className="card__body">
                        <ul className="custom-list">
                            {data.personalizedRecommendations?.map((rec, i) => (
                                <li key={i}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="card roadmap-card">
                    <div className="card__header">
                        <h2>PREPARATION ROADMAP</h2>
                    </div>
                    <div className="card__body roadmap-timeline">
                        {data.preparationRoadmap?.map((step, i) => (
                            <div key={i} className={`roadmap-step status-${step.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                <div className="step-marker"></div>
                                <div className="step-content">
                                    <h4>{step.step}</h4>
                                    <span>{step.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            
            {data.jobRequirementPatterns && data.jobRequirementPatterns.length > 0 && (
                <section className="card patterns-card">
                    <div className="card__header">
                        <h2>JOB REQUIREMENT PATTERNS</h2>
                    </div>
                    <div className="card__body">
                        <p className="text-muted" style={{marginBottom: '1rem'}}>Skills repeatedly appearing across your analyzed target roles.</p>
                        <div className="tags-flex">
                            {data.jobRequirementPatterns.map((pat, i) => (
                                <span key={i} className="pattern-tag">{pat}</span>
                            ))}
                        </div>
                    </div>
                </section>
            )}
            </div>
        </div>
    );
};
