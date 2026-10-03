import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { useResumeVersions } from "../hooks/useResumeVersions";
import "../style/resumeVersion.scss";

export const ResumeTailor = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('jobId');
    const navigate = useNavigate();
    
    const { fetchResumeById, currentResume, loading, updateResume, duplicateResume, tailorResume } = useResumeVersions();

    const [content, setContent] = useState("");
    const [name, setName] = useState("");
    
    const [suggestions, setSuggestions] = useState([]);
    const [isTailoring, setIsTailoring] = useState(false);
    const [tailoringStatus, setTailoringStatus] = useState("");

    useEffect(() => {
        if (id) {
            fetchResumeById(id).then(data => {
                if (data) {
                    setContent(data.content || "");
                    setName(data.name || "");
                }
            });
        }
    }, [id, fetchResumeById]);

    if (loading && !currentResume) return <div className="page-container">Loading...</div>;
    if (!currentResume) return <div className="page-container">Resume not found.</div>;

    const handleSaveAsNew = async () => {
        // First duplicate
        const newResume = await duplicateResume(id, `${name} (Tailored)`);
        if (newResume) {
            // Then update its content
            await updateResume(newResume._id, { content });
            navigate(`/resumes/${newResume._id}`);
        }
    };

    const handleGenerateSuggestions = async () => {
        if (!jobId) {
            alert("This resume is not linked to a Job Application. Open this from a Job Workspace to tailor it.");
            return;
        }
        setIsTailoring(true);
        setTailoringStatus("Reading your resume...");
        setTimeout(() => setTailoringStatus("Understanding the target role..."), 2000);
        setTimeout(() => setTailoringStatus("Finding opportunities for improvement..."), 4000);
        
        const result = await tailorResume(id, jobId);
        if (result) {
            setSuggestions(result);
        }
        setIsTailoring(false);
    };

    const acceptSuggestion = (suggestion, index) => {
        // Simple string replace for now.
        const newContent = content.replace(suggestion.originalText, suggestion.suggestedText);
        setContent(newContent);
        
        // Remove from list
        setSuggestions(prev => prev.filter((_, i) => i !== index));
    };

    const rejectSuggestion = (index) => {
        setSuggestions(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="resume-tailor-page page-container fade-in flex flex-col h-screen">
            <div className="tailor-header mb-4 flex justify-between items-end shrink-0">
                <div>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="bg-transparent text-2xl font-bold border-b border-dashed border-light outline-none"
                    />
                    <p className="text-secondary text-sm mt-1">
                        Editing raw content. {jobId && <span className="text-primary font-bold">Job linked.</span>}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-primary" onClick={handleSaveAsNew}>Save as New Version</button>
                    <button className="btn btn-outline" onClick={() => updateResume(id, { name, content })}>Save Current</button>
                </div>
            </div>

            <div className="tailor-workspace flex flex-1 gap-6 min-h-0">
                {/* Left: Editor */}
                <div className="editor-panel flex-1 card flex flex-col">
                    <h3 className="font-bold mb-2">Resume Content</h3>
                    <textarea 
                        className="flex-1 w-full bg-input border border-light rounded p-4 font-mono text-sm resize-none"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>

                {/* Right: AI Tailoring */}
                <div className="suggestions-panel flex-1 card flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-primary">AI Tailoring</h3>
                        {jobId && suggestions.length === 0 && !isTailoring && (
                            <button className="btn btn-sm btn-primary" onClick={handleGenerateSuggestions}>
                                Generate Suggestions
                            </button>
                        )}
                    </div>

                    {!jobId && (
                        <div className="text-secondary text-sm">
                            Open this resume from a Job Application Workspace to access AI Tailoring against a Job Description.
                        </div>
                    )}

                    {isTailoring && (
                        <div className="tailoring-state my-auto text-center">
                            <div className="spinner mb-4 mx-auto"></div>
                            <h3 className="text-lg font-bold text-primary">Tailoring Your Resume</h3>
                            <p className="text-secondary mt-2">{tailoringStatus}</p>
                        </div>
                    )}

                    {!isTailoring && suggestions.length > 0 && (
                        <div className="suggestions-list space-y-4">
                            {suggestions.map((s, idx) => (
                                <div key={idx} className="suggestion-card bg-surface-elevated border border-light rounded p-4">
                                    <div className="text-xs uppercase text-secondary mb-2">{s.section}</div>
                                    <div className="bg-danger bg-opacity-10 text-danger p-2 rounded text-sm mb-2 line-through opacity-70">
                                        {s.originalText}
                                    </div>
                                    <div className="bg-success bg-opacity-10 text-success p-2 rounded text-sm mb-3">
                                        {s.suggestedText}
                                    </div>
                                    <p className="text-xs text-secondary mb-3">
                                        <span className="font-bold">Why: </span>{s.explanation}
                                    </p>
                                    <div className="flex gap-2">
                                        <button className="btn btn-sm btn-outline text-success border-success hover:bg-success hover:bg-opacity-10" onClick={() => acceptSuggestion(s, idx)}>Accept</button>
                                        <button className="btn btn-sm btn-outline text-danger border-danger hover:bg-danger hover:bg-opacity-10" onClick={() => rejectSuggestion(idx)}>Reject</button>
                                    </div>
                                </div>
                            ))}
                            {suggestions.length === 0 && <p className="text-secondary text-center mt-4">All suggestions processed.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
