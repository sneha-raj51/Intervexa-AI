import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useMock } from "../hooks/useMock";
import "../style/mock.scss";

export const MockRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getInterview, submitAnswer, completeInterview, interview, loading, error } = useMock();
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState("");
    const [timeElapsed, setTimeElapsed] = useState(0);
    
    const timerRef = useRef(null);

    useEffect(() => {
        if (id) {
            getInterview(id).then((data) => {
                if (data) {
                    // Find first unanswered question
                    const answeredCount = data.answers.length;
                    setCurrentIndex(Math.min(answeredCount, data.questions.length - 1));
                    setTimeElapsed(data.completedTime || 0);
                }
            });
        }
    }, [id, getInterview]);

    useEffect(() => {
        if (interview?.isTimed && interview.status !== "Completed") {
            timerRef.current = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [interview]);

    if (loading && !interview) {
        return <div className="page-container"><p>Loading interview room...</p></div>;
    }

    if (!interview) {
        return <div className="page-container"><p>Interview not found.</p></div>;
    }

    if (interview.status === "Completed") {
        return (
            <div className="page-container flex-col-center">
                <h2>This interview is already completed.</h2>
                <button className="btn btn-primary mt-4" onClick={() => navigate(`/mock-interview/${id}/report`)}>
                    View Report
                </button>
            </div>
        );
    }

    const currentQuestion = interview.questions[currentIndex];
    const existingAnswer = interview.answers.find(a => a.questionIndex === currentIndex);

    const handleSubmit = async () => {
        if (!userAnswer.trim()) {
            // Local error handled gracefully (button is disabled anyway)
            return;
        }
        await submitAnswer(id, currentIndex, userAnswer);
    };

    const handleNext = async () => {
        if (currentIndex < interview.questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserAnswer("");
        } else {
            await completeInterview(id, timeElapsed);
            navigate(`/mock-interview/${id}/report`);
        }
    };

    const handleRetry = () => {
        setUserAnswer("");
        // Doesn't delete the existing answer until resubmitted
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="mock-room-page page-container fade-in">
            <div className="room-header-section text-center mb-5">
                <p className="text-secondary text-sm font-semibold tracking-wider uppercase mb-2">Question {currentIndex + 1} of {interview.questions.length}</p>
                <div className="room-meta flex justify-center items-center gap-3">
                    <span className="badge badge-primary">{interview.type}</span>
                    <span className="text-muted">•</span>
                    <span className="badge badge-outline">{interview.difficulty}</span>
                </div>
            </div>

            <div className="card question-card fade-in mb-5">
                <p className="question-label text-xs tracking-widest text-secondary uppercase mb-4">Question</p>
                <h2 className="question-text">{currentQuestion.question}</h2>
                <div className="question-meta mt-4 pt-4 border-t border-light">
                    <span className="text-sm text-secondary">Category: <span className="text-primary font-medium">{currentQuestion.category}</span></span>
                </div>
            </div>

            {!existingAnswer ? (
                <div className="answer-section fade-in">
                    <p className="answer-label text-xs tracking-widest text-secondary uppercase mb-3">Your Answer</p>
                    <textarea 
                        className="answer-textarea" 
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        disabled={loading}
                        rows={8}
                    />
                    <div className="mt-4 flex justify-between items-center">
                        <div>
                            {error && <span className="error-message text-danger">{error}</span>}
                        </div>
                        <button className="btn btn-primary btn-large btn-glow" onClick={handleSubmit} disabled={loading || !userAnswer.trim()}>
                            {loading ? "Analyzing..." : "Submit Answer →"}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="evaluation-section fade-in">
                    <div className="card evaluation-card">
                        <h3 className="eval-title">✨ AI Evaluation</h3>
                        
                        {currentQuestion.category === "Behavioral" && existingAnswer.evaluation.star && (
                            <div className="star-evaluation mt-4 mb-5">
                                <h4 className="text-xs tracking-widest text-secondary uppercase mb-3">STAR Assessment</h4>
                                <div className="star-grid">
                                    <div className="star-item">S: {existingAnswer.evaluation.star.situation}</div>
                                    <div className="star-item">T: {existingAnswer.evaluation.star.task}</div>
                                    <div className="star-item">A: {existingAnswer.evaluation.star.action}</div>
                                    <div className="star-item">R: {existingAnswer.evaluation.star.result}</div>
                                </div>
                            </div>
                        )}

                        <div className="feedback-block">
                            <h4 className="text-xs tracking-widest text-success uppercase mb-2">WHAT YOU DID WELL</h4>
                            <p className="text-primary-light leading-relaxed">{existingAnswer.evaluation.whatYouDidWell}</p>
                        </div>

                        <div className="feedback-block mt-5">
                            <h4 className="text-xs tracking-widest text-warning uppercase mb-2">WHAT TO IMPROVE</h4>
                            <p className="text-primary-light leading-relaxed">{existingAnswer.evaluation.whatToImprove}</p>
                        </div>

                        <div className="feedback-block mt-5">
                            <h4 className="text-xs tracking-widest text-primary uppercase mb-2">HOW TO APPROACH BETTER</h4>
                            <p className="text-primary-light leading-relaxed">{existingAnswer.evaluation.exampleDirection}</p>
                        </div>
                    </div>

                    <div className="room-actions mt-5 pt-5 border-t border-light flex justify-between items-center">
                        <button className="btn btn-secondary" onClick={handleRetry} disabled={loading}>
                            ↻ Try Again
                        </button>
                        <button className="btn btn-primary btn-large" onClick={handleNext} disabled={loading}>
                            {currentIndex < interview.questions.length - 1 ? "Next Question →" : "Complete Interview ✓"}
                        </button>
                    </div>
                </div>
            )}

            <div className="room-footer mt-5 pt-5 flex flex-col items-center gap-3">
                {interview.isTimed && (
                    <div className="timer-badge">
                        <span className="text-xs tracking-widest text-secondary uppercase mr-3">Time Remaining</span>
                        <span className="room-timer">{formatTime(timeElapsed)}</span>
                    </div>
                )}
                <div className="progress-indicator flex gap-1 justify-center mt-2">
                    {interview.questions.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`progress-dot ${idx < currentIndex + (existingAnswer ? 1 : 0) ? 'active' : ''}`}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
};
