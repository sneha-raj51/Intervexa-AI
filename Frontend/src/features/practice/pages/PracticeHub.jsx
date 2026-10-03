import React, { useEffect, useState } from "react";
import { usePractice } from "../hooks/usePractice";
import { useNavigate } from "react-router";
import "../style/practice.scss";

export const PracticeHub = () => {
    const { questions, weakAreas, fetchQuestions, fetchWeakAreas, updateStatus, submitAnswer, loading } = usePractice();
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [difficulty, setDifficulty] = useState("All");
    const [status, setStatus] = useState("All");
    const [skill, setSkill] = useState("All");

    const [activePracticeId, setActivePracticeId] = useState(null);
    const [practiceAnswer, setPracticeAnswer] = useState("");
    const [showGuidance, setShowGuidance] = useState(false);

    useEffect(() => {
        fetchQuestions({ search, category, difficulty, status, skill });
    }, [search, category, difficulty, status, skill, fetchQuestions]);

    useEffect(() => {
        fetchWeakAreas();
    }, [fetchWeakAreas]);

    const bookmarkedCount = questions.filter(q => q.isBookmarked).length;
    const reviewCount = questions.filter(q => q.status === "Needs Review").length;

    // Derived unique skills for filter dropdown (if present)
    const uniqueSkills = [...new Set(questions.map(q => q.skill).filter(Boolean))];

    const handlePracticeClick = (id) => {
        setActivePracticeId(id === activePracticeId ? null : id);
        setPracticeAnswer("");
        setShowGuidance(false);
    };

    const handleSubmitPractice = async (id) => {
        if (!practiceAnswer.trim()) return;
        await submitAnswer(id, practiceAnswer);
        setPracticeAnswer("");
        // Status and attempts are optimistically updated in the hook
    };

    return (
        <div className="practice-hub-page page-container fade-in">
            <div className="hub-header mb-4">
                <h1>Practice Hub</h1>
                <p>Turn your weak areas into interview strengths.</p>
            </div>

            {/* Summary Metrics */}
            <div className="metrics-grid mb-4">
                <div className="metric-box">
                    <div className="metric-value">{questions.length}</div>
                    <div className="metric-label">Total Questions</div>
                </div>
                <div className="metric-box">
                    <div className="metric-value">{bookmarkedCount}</div>
                    <div className="metric-label">Bookmarked</div>
                </div>
                <div className="metric-box">
                    <div className="metric-value text-warning">{reviewCount}</div>
                    <div className="metric-label">Needs Review</div>
                </div>
            </div>

            {/* Weak Areas Section */}
            {weakAreas.length > 0 && (
                <div className="weak-areas-section mb-4 fade-in">
                    <h2>Your Weak Areas</h2>
                    <div className="weak-areas-grid mt-2">
                        {weakAreas.map((area, idx) => (
                            <div key={idx} className="card weak-area-card">
                                <h3>{area.area} <span className="badge badge-warning">Needs Practice</span></h3>
                                <p className="text-secondary mt-2 text-sm">{area.reason}</p>
                                <button className="btn btn-outline btn-sm mt-3" onClick={() => {
                                    setSkill(area.area);
                                    setStatus("Needs Review");
                                }}>
                                    Practice {area.area}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filters-section card mb-4">
                <div className="filters-grid">
                    <input 
                        type="text" 
                        placeholder="Search questions..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)}
                        className="filter-input"
                    />
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="filter-select">
                        <option value="All">All Categories</option>
                        <option value="Technical">Technical</option>
                        <option value="Behavioral">Behavioral</option>
                    </select>
                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="filter-select">
                        <option value="All">All Difficulties</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="filter-select">
                        <option value="All">All Statuses</option>
                        <option value="Not Practiced">Not Practiced</option>
                        <option value="Practiced">Practiced</option>
                        <option value="Needs Review">Needs Review</option>
                        <option value="Bookmarked">Bookmarked</option>
                    </select>
                    {uniqueSkills.length > 1 && (
                        <select value={skill} onChange={(e) => setSkill(e.target.value)} className="filter-select">
                            <option value="All">All Skills</option>
                            {uniqueSkills.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    )}
                </div>
            </div>

            {/* Questions List */}
            <div className="questions-list">
                {questions.length === 0 ? (
                    <div className="empty-state">
                        <h2>No practice questions yet.</h2>
                        <p className="text-secondary mt-2">Generate an interview strategy or complete a mock interview to start building your practice library.</p>
                        <button className="btn btn-primary btn-large btn-glow mt-5" onClick={() => navigate('/analyze')}>Analyze New Job</button>
                    </div>
                ) : (
                    questions.map((q) => {
                        const isPracticing = activePracticeId === q._id;
                        return (
                            <div key={q._id} className="question-card fade-in">
                                <div className="question-header flex justify-between items-start">
                                    <div className="question-info w-full">
                                        <div className="badges">
                                            <span className="badge badge-outline">{q.category}</span>
                                            <span className="badge badge-outline">{q.difficulty}</span>
                                            {q.status === 'Needs Review' && <span className="badge badge-warning">Needs Review</span>}
                                            {q.status === 'Practiced' && <span className="badge badge-success">Practiced</span>}
                                        </div>
                                        <h3 className="question-text">{q.question}</h3>
                                    </div>
                                    <div className="question-actions ml-4">
                                        <button 
                                            className="action-btn"
                                            onClick={() => updateStatus(q._id, { isBookmarked: !q.isBookmarked })}
                                            title={q.isBookmarked ? "Remove Bookmark" : "Bookmark"}
                                            aria-label="Bookmark"
                                        >
                                            {q.isBookmarked ? '🔖' : '🤍'}
                                        </button>
                                    </div>
                                </div>

                                <div className="action-row mt-4 pt-4 border-t border-light flex justify-between items-center">
                                    <div className="btn-group flex gap-3">
                                        <button className={`btn ${isPracticing ? 'btn-secondary' : 'btn-primary'}`} onClick={() => handlePracticeClick(q._id)}>
                                            {isPracticing ? "Close Practice" : "Practice"}
                                        </button>
                                        {q.status !== 'Practiced' ? (
                                            <button className="btn btn-outline" onClick={() => updateStatus(q._id, { status: "Practiced" })}>
                                                ✓ Mark as Practiced
                                            </button>
                                        ) : (
                                            <button className="btn btn-outline btn-success" disabled>
                                                ✓ Practiced
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-xs text-secondary opacity-70">Source: {q.source}</span>
                                </div>

                                {/* Practice Mode Section */}
                                {isPracticing && (
                                    <div className="practice-mode-section fade-in">
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="practice-label">Your Answer</label>
                                            {q.intention && (
                                                <button className="btn btn-outline btn-sm" onClick={() => setShowGuidance(!showGuidance)}>
                                                    {showGuidance ? "Hide Guidance" : "Show Guidance"}
                                                </button>
                                            )}
                                        </div>
                                        
                                        {showGuidance && q.intention && (
                                            <div className="guidance-box mb-4">
                                                <strong>What they're testing:</strong> {q.intention}
                                            </div>
                                        )}

                                        <textarea 
                                            className="practice-textarea"
                                            rows="6"
                                            placeholder="Type your answer here..."
                                            value={practiceAnswer}
                                            onChange={(e) => setPracticeAnswer(e.target.value)}
                                            disabled={loading}
                                        />
                                        <div className="mt-4 flex justify-end">
                                            <button 
                                                className="btn btn-primary btn-large btn-glow" 
                                                onClick={() => handleSubmitPractice(q._id)}
                                                disabled={loading || !practiceAnswer.trim()}
                                            >
                                                {loading ? "Evaluating..." : "Submit Answer"}
                                            </button>
                                        </div>

                                        {/* Show Previous Attempts */}
                                        {q.attempts && q.attempts.length > 0 && (
                                            <div className="attempts-history fade-in">
                                                <h4 className="practice-label mb-3">Recent Evaluations</h4>
                                                {[...q.attempts].reverse().map((attempt, idx) => (
                                                    <div key={idx} className="attempt-card">
                                                        <p className="attempt-answer">"{attempt.answer}"</p>
                                                        {attempt.evaluation.star && q.category === 'Behavioral' && (
                                                            <div className="text-xs mb-3 text-primary tracking-wider uppercase font-semibold">
                                                                S: {attempt.evaluation.star.situation} • T: {attempt.evaluation.star.task} • A: {attempt.evaluation.star.action} • R: {attempt.evaluation.star.result}
                                                            </div>
                                                        )}
                                                        <div className="text-sm mt-2"><strong className="text-success tracking-wider text-xs uppercase">Well Done:</strong> <span className="text-primary-light">{attempt.evaluation.whatYouDidWell}</span></div>
                                                        <div className="text-sm mt-2"><strong className="text-warning tracking-wider text-xs uppercase">To Improve:</strong> <span className="text-primary-light">{attempt.evaluation.whatToImprove}</span></div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
