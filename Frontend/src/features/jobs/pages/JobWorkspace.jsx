import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useJobs } from "../hooks/useJobs";
import "../style/jobs.scss";

export const JobWorkspace = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchJobWorkspace, currentWorkspace, loading, updateJob, deleteJob } = useJobs();

    const [status, setStatus] = useState("");
    const [notes, setNotes] = useState("");
    const [resumeId, setResumeId] = useState("");

    useEffect(() => {
        if (id) {
            fetchJobWorkspace(id).then(data => {
                if (data && data.job) {
                    setStatus(data.job.status);
                    setNotes(data.job.notes || "");
                    setResumeId(data.job.resumeId || "");
                }
            });
        }
    }, [id, fetchJobWorkspace]);

    if (loading && !currentWorkspace) {
        return <div className="page-container"><p>Loading workspace...</p></div>;
    }

    if (!currentWorkspace) {
        return <div className="page-container"><p>Job not found.</p></div>;
    }

    const { job, resumeAnalysis, interviewReport, mockInterviews } = currentWorkspace;

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        await updateJob(job._id, { status: newStatus });
    };

    const handleSaveNotes = async () => {
        await updateJob(job._id, { notes });
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this job and all its linked preparation data?")) {
            const success = await deleteJob(job._id);
            if (success) navigate('/jobs');
        }
    };

    // Derived Match Intelligence
    const matchScore = resumeAnalysis?.matchBreakdown?.overallMatch || interviewReport?.matchScore || null;
    const matchedSkills = resumeAnalysis?.matchBreakdown?.matchedSkills || [];
    const missingSkills = resumeAnalysis?.matchBreakdown?.missingSkills || interviewReport?.skillGaps?.map(g => g.skill) || [];

    return (
        <div className="job-workspace-page page-container fade-in">
            {/* Header */}
            <div className="workspace-header flex justify-between items-end">
                <div className="pr-6">
                    <h1 className="text-3xl font-bold mb-2 tracking-wide leading-tight">{job.title}</h1>
                    <p className="text-xl text-secondary">{job.company}</p>
                </div>
                <div className="flex gap-4 items-center flex-shrink-0">
                    <div className="status-selector">
                        <select className="badge-select" value={status} onChange={handleStatusChange}>
                            <option value="Saved">SAVED</option>
                            <option value="Applied">APPLIED</option>
                            <option value="Assessment">ASSESSMENT</option>
                            <option value="Interview">INTERVIEW</option>
                            <option value="Offer">OFFER</option>
                            <option value="Rejected">REJECTED</option>
                            <option value="Withdrawn">WITHDRAWN</option>
                        </select>
                    </div>
                    {matchScore !== null && (
                        <div className="match-badge bg-primary bg-opacity-10 border border-primary border-opacity-30 px-4 py-2 rounded-full flex items-center">
                            <span className="text-xs uppercase font-medium text-secondary mr-2">Match</span>
                            <span className="font-bold text-primary text-lg">{matchScore}%</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="workspace-grid">
                {/* Left Column: Intelligence & Preparation */}
                <div className="grid-left flex flex-col gap-6">
                    
                    {/* Your Match Intelligence */}
                    <div className="card match-card">
                        <h2 className="text-xl mb-5 font-bold tracking-wide uppercase">YOUR MATCH</h2>
                        
                        {matchScore !== null ? (
                            <div className="fade-in">
                                <div className="text-5xl font-800 text-primary mb-6">{matchScore}%</div>
                                
                                <div className="skills-grid flex gap-6">
                                    <div className="flex-1 bg-surface rounded-lg p-4 border border-light">
                                        <h4 className="text-sm font-semibold uppercase text-success mb-3 tracking-wider">Matched</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {matchedSkills.length > 0 ? matchedSkills.slice(0, 5).map((s, i) => <span key={i} className="text-xs bg-success bg-opacity-20 text-success px-2 py-1 rounded font-medium">{s}</span>) : <span className="text-xs text-secondary">None identified</span>}
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-surface rounded-lg p-4 border border-light">
                                        <h4 className="text-sm font-semibold uppercase text-warning mb-3 tracking-wider">Needs Attention</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {missingSkills.length > 0 ? missingSkills.slice(0, 5).map((s, i) => <span key={i} className="text-xs bg-warning bg-opacity-20 text-warning px-2 py-1 rounded font-medium">{s}</span>) : <span className="text-xs text-secondary">None identified</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-intelligence text-center py-6">
                                <p className="text-secondary mb-5 text-lg">Analyze this job to see how well your resume matches.</p>
                                <button className="btn btn-outline btn-large" onClick={() => navigate(`/analyze?jobId=${job._id}`)}>Analyze Job</button>
                            </div>
                        )}
                    </div>

                    {/* Preparation Links */}
                    <div className="card prep-card mt-6">
                        <h2 className="text-xl mb-5 font-bold tracking-wide uppercase">PREPARATION</h2>
                        <div className="prep-links flex flex-col gap-4">
                            <button className="flex justify-between items-center bg-input p-5 rounded-xl hover:border-primary border border-transparent cursor-pointer transition-colors text-left" onClick={() => navigate(`/analyze?jobId=${job._id}`)}>
                                <div>
                                    <h4 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">Interview Strategy</h4>
                                    <p className="text-sm text-secondary">{interviewReport ? 'Updated recently' : 'Not generated yet'}</p>
                                </div>
                                <span className="text-xl opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all">→</span>
                            </button>
                            <button className="flex justify-between items-center bg-input p-5 rounded-xl hover:border-primary border border-transparent cursor-pointer transition-colors text-left" onClick={() => navigate(`/mock-interview?jobId=${job._id}`)}>
                                <div>
                                    <h4 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">Mock Interview</h4>
                                    <p className="text-sm text-secondary">{mockInterviews.length} completed</p>
                                </div>
                                <span className="text-xl opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all">→</span>
                            </button>
                            <button className="flex justify-between items-center bg-input p-5 rounded-xl hover:border-primary border border-transparent cursor-pointer transition-colors text-left" onClick={() => navigate(`/practice`)}>
                                <div>
                                    <h4 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">Practice Questions</h4>
                                    <p className="text-sm text-secondary">Global practice hub</p>
                                </div>
                                <span className="text-xl opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all">→</span>
                            </button>
                        </div>
                    </div>

                </div>

                {/* Right Column: Details & Application */}
                <div className="grid-right flex flex-col gap-6">
                    
                    {/* Overview */}
                    <div className="card overview-card text-sm">
                        <h3 className="font-bold mb-4 uppercase tracking-wide">Job Overview</h3>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                            <div><div className="text-secondary text-xs uppercase mb-1">Location</div><div className="font-medium text-base">{job.location || 'N/A'}</div></div>
                            <div><div className="text-secondary text-xs uppercase mb-1">Type</div><div className="font-medium text-base">{job.employmentType}</div></div>
                            {job.url && <div className="col-span-2 pt-2"><a href={job.url} target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline inline-flex items-center gap-1">View Original Job Post <span className="text-xs">↗</span></a></div>}
                        </div>
                    </div>

                    {/* Resume Association */}
                    <div className="card resume-assoc-card">
                        <h3 className="font-bold mb-4 uppercase tracking-wide">Resume for this Application</h3>
                        {resumeId ? (
                            <div className="flex justify-between items-center bg-surface-elevated p-4 rounded-lg border border-light mb-4">
                                <div className="font-semibold text-sm">Resume Selected</div>
                                <button className="btn btn-sm btn-primary" onClick={() => navigate(`/resumes/${resumeId}?jobId=${job._id}`)}>
                                    Tailor Resume
                                </button>
                            </div>
                        ) : (
                            <div className="text-secondary text-sm mb-4 p-4 bg-surface rounded-lg border border-light border-dashed text-center">
                                No resume linked. Update your application status to link one later.
                            </div>
                        )}
                        <button className="btn btn-outline w-full" onClick={() => navigate('/resumes')}>Manage Resumes</button>
                    </div>

                    {/* Timeline */}
                    <div className="card timeline-card">
                        <h3 className="font-bold mb-5 uppercase tracking-wide">Application Timeline</h3>
                        <div className="timeline-list">
                            {job.timeline.slice().reverse().map((t, idx) => (
                                <div key={idx} className="timeline-item flex items-start mb-4 relative">
                                    <div className="timeline-dot mt-1.5 mr-4 bg-primary w-2.5 h-2.5 rounded-full z-10 relative"></div>
                                    {idx < job.timeline.length - 1 && <div className="absolute left-1.5 top-3 w-px h-10 bg-light -ml-0.5"></div>}
                                    <div>
                                        <div className="font-600 text-base">{t.status}</div>
                                        <div className="text-sm text-secondary">{new Date(t.date).toLocaleDateString()} at {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="card notes-card">
                        <h3 className="font-bold mb-3 uppercase tracking-wide">
                            Notes
                        </h3>
                        <textarea 
                            className="w-full bg-input border border-light rounded p-4 min-h-[120px] text-base mb-2 focus:border-primary focus:outline-none transition-colors"
                            placeholder="Add private notes, recruiter feedback, etc..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            onBlur={handleSaveNotes}
                        />
                        <div className="text-xs text-secondary mt-2">Auto-saves on blur</div>
                    </div>

                    <div className="text-right pt-2">
                        <button className="btn btn-ghost text-danger hover:text-white hover:bg-danger hover:bg-opacity-80 transition-colors px-4 py-2" onClick={handleDelete}>Delete Job</button>
                    </div>

                </div>
            </div>
        </div>
    );
};
