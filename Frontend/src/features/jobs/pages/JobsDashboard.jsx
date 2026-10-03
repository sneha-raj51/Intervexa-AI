import React, { useEffect, useState } from "react";
import { useJobs } from "../hooks/useJobs";
import { useNavigate } from "react-router";
import "../style/jobs.scss";

export const JobsDashboard = () => {
    const { jobs, loading, fetchJobs, createJob } = useJobs();
    const navigate = useNavigate();

    const [isAdding, setIsAdding] = useState(false);
    const [newJob, setNewJob] = useState({ title: "", company: "", location: "", employmentType: "Full-time", url: "", status: "Saved", description: "" });
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const activeJobs = jobs.filter(j => j.status !== "Rejected" && j.status !== "Withdrawn");
    const interviewJobs = jobs.filter(j => j.status === "Interview");
    const offerJobs = jobs.filter(j => j.status === "Offer");

    const filteredJobs = jobs.filter(j => {
        if (filterStatus !== "All" && j.status !== filterStatus) return false;
        if (search) {
            const lowerSearch = search.toLowerCase();
            return j.title.toLowerCase().includes(lowerSearch) || j.company.toLowerCase().includes(lowerSearch);
        }
        return true;
    });

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newJob.title || !newJob.company) return;
        const created = await createJob(newJob);
        if (created) {
            setIsAdding(false);
            setNewJob({ title: "", company: "", location: "", employmentType: "Full-time", url: "", status: "Saved", description: "" });
            navigate(`/jobs/${created._id}`); // Navigate directly to workspace
        }
    };

    return (
        <div className="jobs-dashboard-page page-container fade-in">
            <div className="job-header flex justify-between items-end gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2 uppercase tracking-wide">JOB TRACKER</h1>
                    <p className="text-secondary text-lg">Keep every opportunity organized.</p>
                </div>
                <button className="btn btn-primary px-5 py-3 h-12 flex items-center justify-center" onClick={() => setIsAdding(true)}>+ Add Job</button>
            </div>

            {/* Metrics */}
            <div className="metrics-grid mb-6">
                <div className="metric-box">
                    <div className="metric-value">{jobs.length}</div>
                    <div className="metric-label">Total Jobs</div>
                </div>
                <div className="metric-box">
                    <div className="metric-value">{activeJobs.length}</div>
                    <div className="metric-label">Active</div>
                </div>
                <div className="metric-box">
                    <div className="metric-value text-warning">{interviewJobs.length}</div>
                    <div className="metric-label">Interview</div>
                </div>
                <div className="metric-box">
                    <div className="metric-value text-success">{offerJobs.length}</div>
                    <div className="metric-label">Offer</div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-toolbar mb-6">
                <input 
                    type="text" 
                    placeholder="Search by role or company..." 
                    className="filter-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="All">All Statuses</option>
                    <option value="Saved">Saved</option>
                    <option value="Applied">Applied</option>
                    <option value="Assessment">Assessment</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Withdrawn">Withdrawn</option>
                </select>
            </div>

            {/* Jobs Grid */}
            {jobs.length === 0 && !loading ? (
                <div className="empty-state text-center mb-6">
                    <div className="text-4xl mb-4">💼</div>
                    <h2>No job applications yet.</h2>
                    <p className="text-secondary mt-2 mb-5">Save a role to start building your preparation workspace.</p>
                    <button className="btn btn-primary btn-large" onClick={() => setIsAdding(true)}>Add Your First Job</button>
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="empty-state text-center mb-6">
                    <div className="text-4xl mb-4">🔍</div>
                    <h2>No matches found.</h2>
                    <p className="text-secondary mt-2">Adjust your filters to see your saved jobs.</p>
                </div>
            ) : (
                <div className="jobs-grid">
                    {filteredJobs.map(job => (
                        <div key={job._id} className="job-card fade-in cursor-pointer" onClick={() => navigate(`/jobs/${job._id}`)}>
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-600 text-xl pr-4 leading-tight">{job.title}</h3>
                                <span className={`badge badge-${job.status === 'Offer' ? 'success' : job.status === 'Rejected' ? 'danger' : job.status === 'Interview' ? 'warning' : 'outline'} flex-shrink-0`}>
                                    {job.status}
                                </span>
                            </div>
                            <p className="text-secondary text-base mb-5">{job.company}</p>
                            
                            <div className="pt-4 border-t border-light flex justify-between items-center text-sm">
                                <span className="text-secondary">Updated {new Date(job.updatedAt).toLocaleDateString()}</span>
                                <span className="text-primary font-medium group-hover:underline">Open Workspace →</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Job Modal */}
            {isAdding && (
                <div className="modal-overlay fade-in">
                    <div className="modal-content">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold mb-2">Add Job Application</h2>
                            <p className="text-secondary text-lg">Save a role and build a preparation workspace.</p>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="input-label font-semibold text-sm tracking-wide uppercase">Job Title <span className="text-danger">*</span></label>
                                    <input type="text" className="beautiful-input w-full" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} placeholder="e.g. Senior Frontend Engineer" />
                                </div>
                                <div className="form-group">
                                    <label className="input-label font-semibold text-sm tracking-wide uppercase">Company <span className="text-danger">*</span></label>
                                    <input type="text" className="beautiful-input w-full" required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} placeholder="e.g. Google" />
                                </div>
                                <div className="form-group">
                                    <label className="input-label font-semibold text-sm tracking-wide uppercase">Location</label>
                                    <input type="text" className="beautiful-input w-full" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} placeholder="e.g. Remote, NY" />
                                </div>
                                <div className="form-group">
                                    <label className="input-label font-semibold text-sm tracking-wide uppercase">Employment Type</label>
                                    <select className="beautiful-input w-full" value={newJob.employmentType} onChange={e => setNewJob({...newJob, employmentType: e.target.value})}>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label className="input-label font-semibold text-sm tracking-wide uppercase">Job URL</label>
                                    <input type="url" className="beautiful-input w-full" placeholder="https://..." value={newJob.url} onChange={e => setNewJob({...newJob, url: e.target.value})} />
                                </div>
                                <div className="form-group full-width">
                                    <label className="input-label font-semibold text-sm tracking-wide uppercase">Job Description</label>
                                    <textarea className="beautiful-input w-full min-h-[120px]" placeholder="Paste the full job description here..." value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-light">
                                <button type="button" className="btn btn-ghost px-6 py-3" onClick={() => setIsAdding(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary px-8 py-3" disabled={loading}>{loading ? 'Saving...' : 'Save Job'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
