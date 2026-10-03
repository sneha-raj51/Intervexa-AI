import React, { useEffect, useState, useRef } from "react";
import { useResumeVersions } from "../hooks/useResumeVersions";
import { useNavigate } from "react-router";
import "../style/resumeVersion.scss";

export const ResumesDashboard = () => {
    const { resumes, loading, fetchResumes, uploadResume, updateResume } = useResumeVersions();
    const navigate = useNavigate();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef();

    useEffect(() => {
        fetchResumes();
    }, [fetchResumes]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setIsUploading(true);
            const newName = file.name.replace(".pdf", "");
            await uploadResume(file, newName);
            setIsUploading(false);
        } else {
            alert("Only PDF files are supported");
        }
    };

    const handleStatusChange = async (id, status) => {
        await updateResume(id, { status });
    };

    return (
        <div className="resumes-dashboard-page page-container fade-in">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold">MY RESUMES</h1>
                    <p className="text-secondary text-lg mt-1">Keep every version of your resume organized.</p>
                </div>
                <div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".pdf" 
                        style={{ display: 'none' }} 
                    />
                    <button 
                        className="btn btn-primary" 
                        onClick={() => fileInputRef.current.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? "Uploading..." : "+ Upload Resume"}
                    </button>
                </div>
            </div>

            {resumes.length === 0 && !loading ? (
                <div className="empty-state card text-center mt-8">
                    <h2>No resume versions yet.</h2>
                    <p className="text-secondary mt-2 mb-4">Upload your first resume to start tailoring for specific jobs.</p>
                    <button className="btn btn-primary" onClick={() => fileInputRef.current.click()}>Upload Resume</button>
                </div>
            ) : (
                <div className="resumes-grid">
                    {resumes.map(resume => (
                        <div key={resume._id} className="resume-card card fade-in">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-lg">{resume.name}</h3>
                                    {resume.targetRole && <p className="text-sm text-primary mt-1">Target: {resume.targetRole}</p>}
                                </div>
                                <select 
                                    className={`status-select ${resume.status.toLowerCase()}`}
                                    value={resume.status}
                                    onChange={(e) => handleStatusChange(resume._id, e.target.value)}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Archived">Archived</option>
                                </select>
                            </div>
                            
                            <div className="text-sm text-secondary mb-4">
                                <div>Updated: {new Date(resume.updatedAt).toLocaleDateString()}</div>
                                {resume.originalSourceId && <div>Tailored Version</div>}
                            </div>
                            
                            <div className="card-actions flex gap-2 pt-3 border-t border-light">
                                <button className="btn btn-outline flex-1 text-sm" onClick={() => navigate(`/resumes/${resume._id}`)}>
                                    Open / Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
