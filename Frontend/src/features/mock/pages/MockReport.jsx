import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useMock } from "../hooks/useMock";
import "../style/mock.scss";

export const MockReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getInterview, interview, loading } = useMock();
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    useEffect(() => {
        if (id) {
            getInterview(id);
        }
    }, [id, getInterview]);

    if (loading || !interview) {
        return <div className="page-container"><p>Loading report...</p></div>;
    }

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="mock-report-page page-container fade-in">
            <div className="report-header card text-center mb-4">
                <h1>INTERVIEW COMPLETE 🎉</h1>
                <p className="text-secondary mt-2">You've completed your {interview.context?.jobTitle} mock interview.</p>
                
                <div className="metrics-grid mt-4">
                    <div className="metric-box">
                        <div className="metric-value">{interview.questions.length}</div>
                        <div className="metric-label">Questions</div>
                    </div>
                    <div className="metric-box">
                        <div className="metric-value">{interview.questions.filter(q => q.category === 'Technical').length}</div>
                        <div className="metric-label">Technical</div>
                    </div>
                    <div className="metric-box">
                        <div className="metric-value">{interview.questions.filter(q => q.category === 'Behavioral').length}</div>
                        <div className="metric-label">Behavioral</div>
                    </div>
                    {interview.isTimed && (
                        <div className="metric-box">
                            <div className="metric-value">{formatTime(interview.completedTime)}</div>
                            <div className="metric-label">Time Elapsed</div>
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
                </div>
            </div>

            <h2 className="mb-4">Question-by-Question Review</h2>
            <div className="questions-list">
                {interview.questions.map((q, index) => {
                    const ans = interview.answers.find(a => a.questionIndex === index);
                    const isExpanded = expandedQuestion === index;
                    
                    return (
                        <div className="card question-review-card mb-4" key={index}>
                            <div className="review-header flex justify-between items-center cursor-pointer" onClick={() => setExpandedQuestion(isExpanded ? null : index)}>
                                <h3>Q{index + 1}: {q.question}</h3>
                                <span className="badge badge-outline">{q.category}</span>
                            </div>
                            
                            {isExpanded && ans && (
                                <div className="review-body mt-4 pt-4 border-t border-light">
                                    <div className="mb-4">
                                        <h4 className="text-secondary mb-2">Your Answer</h4>
                                        <p className="p-3 bg-surface rounded">{ans.userAnswer}</p>
                                    </div>
                                    
                                    <div className="feedback-block mb-3">
                                        <h4 className="text-success text-sm">WHAT YOU DID WELL</h4>
                                        <p>{ans.evaluation.whatYouDidWell}</p>
                                    </div>
                                    
                                    <div className="feedback-block mb-3">
                                        <h4 className="text-warning text-sm">WHAT TO IMPROVE</h4>
                                        <p>{ans.evaluation.whatToImprove}</p>
                                    </div>
                                    
                                    <div className="feedback-block">
                                        <h4 className="text-primary text-sm">HOW TO APPROACH IT BETTER</h4>
                                        <p>{ans.evaluation.exampleDirection}</p>
                                    </div>
                                </div>
                            )}
                            
                            {isExpanded && !ans && (
                                <div className="review-body mt-4 pt-4 border-t border-light text-secondary">
                                    You skipped or did not answer this question.
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
