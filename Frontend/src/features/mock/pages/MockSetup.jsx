import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useMock } from "../hooks/useMock";
import "../style/mock.scss";

export const MockSetup = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('jobId');
    const { setupInterview, loading, error } = useMock();

    const [type, setType] = useState("Technical");
    const [difficulty, setDifficulty] = useState("Intermediate");
    const [questionCount, setQuestionCount] = useState(5);
    const [isTimed, setIsTimed] = useState(true);

    const handleSetup = async (e) => {
        e.preventDefault();
        const interview = await setupInterview({ type, difficulty, questionCount, isTimed, jobId });
        if (interview) {
            navigate(`/mock-interview/${interview._id}`);
        }
    };

    return (
        <div className="mock-setup-page page-container fade-in">
            <div className="mock-setup-header">
                <h1>Your Interview. Your Practice Room.</h1>
                <p>Practice realistic questions based on your role, resume and preparation gaps.</p>
            </div>

            <form className="mock-setup-form card" onSubmit={handleSetup}>
                <div className="form-group">
                    <label>Interview Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} required>
                        <option value="Technical">Technical</option>
                        <option value="Behavioral">Behavioral</option>
                        <option value="Mixed">Mixed</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Difficulty</label>
                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} required>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Number of Questions</label>
                    <select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} required>
                        <option value={5}>5 Questions</option>
                        <option value={10}>10 Questions</option>
                        <option value={15}>15 Questions</option>
                    </select>
                </div>

                <div className="form-group checkbox-group">
                    <label>
                        <input 
                            type="checkbox" 
                            checked={isTimed} 
                            onChange={(e) => setIsTimed(e.target.checked)} 
                        />
                        <span>Enable Timer (Track elapsed time)</span>
                    </label>
                </div>

                {error && <div className="error-message text-danger mb-4 text-center">{error}</div>}

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Preparing Interview..." : "Start Practice Session"}
                </button>
            </form>
        </div>
    );
};
