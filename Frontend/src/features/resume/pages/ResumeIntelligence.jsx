import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useResume } from '../hooks/useResume'
import '../style/resume.scss'

const LoadingScreen = () => (
    <div className='loading-screen'>
        <div className='loading-screen__card'>
            <div className='loading-screen__spinner'>
                <svg viewBox="0 0 50 50">
                    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle>
                </svg>
            </div>
            <h2 className='loading-screen__title'>Analyzing your resume</h2>
            <p className='loading-screen__subtitle'>Evaluating your skills and extracting insights.</p>
            
            <div className='loading-screen__steps'>
                <div className='step step--active'>✓ Extracting resume content</div>
                <div className='step step--active'>✓ Understanding your experience</div>
                <div className='step step--pulse'>● Evaluating skills</div>
                <div className='step'>○ Comparing target role</div>
                <div className='step'>○ Finding improvement opportunities</div>
            </div>
        </div>
    </div>
)

const ResumeIntelligence = () => {
    const { analysisId } = useParams()
    const navigate = useNavigate()
    const { loading, error, analyzeResume, analysis, getAnalysisById } = useResume()

    const [jobDescription, setJobDescription] = useState("")
    const [selectedFile, setSelectedFile] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const [localError, setLocalError] = useState("")
    const resumeInputRef = useRef()

    useEffect(() => {
        if (analysisId) {
            getAnalysisById(analysisId)
        }
    }, [analysisId, getAnalysisById])

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    }

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        setLocalError("");
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === "application/pdf") {
                setSelectedFile(file);
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                resumeInputRef.current.files = dataTransfer.files;
                // Handled in UI by not accepting the file
            }
        }
    }

    const handleAnalyze = async () => {
        const resumeFile = resumeInputRef.current?.files?.[0]
        if (!resumeFile) {
            setLocalError("A Resume (PDF) is required for analysis.")
            return
        }
        setLocalError("")
        
        const data = await analyzeResume({ resumeFile, jobDescription })
        if (data) {
            navigate(`/resume/${data._id}`)
        }
    }

    if (loading) {
        return <LoadingScreen />
    }

    // ── UPLOAD VIEW ──
    if (!analysis) {
        return (
            <div className='resume-page upload-view'>
                <header className='page-header'>
                    <h1 className='page-header__title'>Resume Intelligence.</h1>
                    <p className='page-header__subtitle'>Understand how strong your resume is and see how it matches your target role.</p>
                </header>

                <div className='dashboard-grid'>
                    <div className='dashboard-grid__left'>
                        <div className='card input-card h-full'>
                            <div className='card__header'>
                                <h2>YOUR RESUME</h2>
                                <span className='badge badge--required'>Required</span>
                            </div>
                            <div className='card__body'>
                                <p className='input-label'>Upload your resume (PDF only)</p>
                                <label 
                                    className={`dropzone ${isDragging ? 'dropzone--active' : ''} ${selectedFile ? 'dropzone--filled' : ''}`}
                                    htmlFor='resume'
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <span className='dropzone__icon'>
                                        {selectedFile ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                        )}
                                    </span>
                                    {selectedFile ? (
                                        <div className='dropzone__info'>
                                            <p className='dropzone__title'>Selected:</p>
                                            <p className='dropzone__filename'>{selectedFile.name}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className='dropzone__title'>Click to upload or drag & drop</p>
                                        </>
                                    )}
                                    <input onChange={(e) => setSelectedFile(e.target.files[0])} ref={resumeInputRef} hidden type='file' id='resume' accept='.pdf' />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className='dashboard-grid__right'>
                        <div className='card input-card h-full flex-col'>
                            <div className='card__header'>
                                <h2>TARGET ROLE</h2>
                                <span className='badge badge--optional'>Optional</span>
                            </div>
                            <div className='card__body flex-1 flex-col'>
                                <p className='input-label'>Paste a Job Description to get Smart Match analysis.</p>
                                <textarea
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    className='beautiful-input flex-1'
                                    placeholder="Paste the job description here..."
                                    maxLength={5000}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {(error || localError) && (
                    <div className="error-message text-danger mb-4 text-center">
                        {error || localError}
                    </div>
                )}

                <div className='action-footer'>
                    <button onClick={handleAnalyze} className='btn-primary btn-large btn-glow'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="12" y1="15" x2="12" y2="3"></line><polyline points="8 7 12 3 16 7"></polyline></svg>
                        Analyze Resume
                    </button>
                </div>
            </div>
        )
    }

    // ── ANALYSIS VIEW ──
    const hasJd = !!analysis.matchBreakdown

    return (
        <div className='resume-page analysis-view'>
            <header className='report-header'>
                <div className='report-header__content'>
                    <div className='report-header__titles'>
                        <h1 className='report-header__role'>Resume Intelligence Report</h1>
                        <p className='report-header__sub'>Data-driven feedback on your profile</p>
                    </div>
                    <button onClick={() => navigate('/resume')} className='btn-secondary'>
                        Analyze Another
                    </button>
                </div>
            </header>

            <div className='report-layout'>
                <aside className='report-sidebar'>
                    <div className='card health-card fade-in'>
                        <div className='card__header'><h2>RESUME HEALTH</h2></div>
                        <div className='card__body'>
                            <div className='health-meter'>
                                <div className='health-meter__label'>
                                    <span>ATS Compatibility</span>
                                    <span>{analysis.score.atsCompatibility}%</span>
                                </div>
                                <div className='progress-bar'><div className='progress-bar__fill' style={{ width: `${analysis.score.atsCompatibility}%`, background: 'var(--primary)' }}></div></div>
                            </div>
                            <div className='health-meter'>
                                <div className='health-meter__label'>
                                    <span>Content Strength</span>
                                    <span>{analysis.score.contentStrength}%</span>
                                </div>
                                <div className='progress-bar'><div className='progress-bar__fill' style={{ width: `${analysis.score.contentStrength}%`, background: 'var(--accent)' }}></div></div>
                            </div>
                            <div className='health-meter'>
                                <div className='health-meter__label'>
                                    <span>Skills Coverage</span>
                                    <span>{analysis.score.skillsCoverage}%</span>
                                </div>
                                <div className='progress-bar'><div className='progress-bar__fill' style={{ width: `${analysis.score.skillsCoverage}%`, background: 'var(--success)' }}></div></div>
                            </div>
                        </div>
                    </div>

                    <div className='card breakdown-card fade-in delay-1'>
                        <div className='card__header'><h2>BREAKDOWN</h2></div>
                        <div className='card__body'>
                            <div className='breakdown-section'>
                                <h3>Strengths</h3>
                                <ul>{analysis.breakdown.strengths.map((s,i) => <li key={i}><span className='icon check'>✓</span>{s}</li>)}</ul>
                            </div>
                            <div className='breakdown-section'>
                                <h3>Needs Attention</h3>
                                <ul>{analysis.breakdown.needsAttention.map((s,i) => <li key={i}><span className='icon warn'>!</span>{s}</li>)}</ul>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className='report-main'>
                    {hasJd ? (
                        <div className='card match-card fade-in delay-2'>
                            <div className='card__header'><h2>SMART MATCH: TARGET ROLE</h2></div>
                            <div className='card__body'>
                                <div className='overall-match'>
                                    <div className='overall-match__score'>{analysis.matchBreakdown.overallMatch}%</div>
                                    <div className='overall-match__text'>Overall Match Score</div>
                                </div>
                                
                                <div className='match-tables'>
                                    <div className='match-group'>
                                        <h3>Matched Skills</h3>
                                        <div className='chips-container'>
                                            {analysis.matchBreakdown.matchedSkills.length > 0 
                                                ? analysis.matchBreakdown.matchedSkills.map(s => <span key={s} className='chip chip--success'>✓ {s}</span>)
                                                : <span className='text-muted'>None detected</span>
                                            }
                                        </div>
                                    </div>
                                    <div className='match-group'>
                                        <h3>Missing / Not Found</h3>
                                        <div className='chips-container'>
                                            {analysis.matchBreakdown.missingSkills.length > 0 
                                                ? analysis.matchBreakdown.missingSkills.map(s => <span key={s} className='chip chip--danger'>- {s}</span>)
                                                : <span className='text-muted'>None detected</span>
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className='recommendations'>
                                    <h3>How to improve your match</h3>
                                    <ul>
                                        {analysis.recommendations.map((r,i) => <li key={i}>{r}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='card empty-jd-card fade-in delay-2'>
                            <div className='card__body'>
                                <h3>Job Description Not Provided</h3>
                                <p className='text-muted'>Provide a Target Role Job Description next time to unlock Smart Match analysis, keyword coverage, and tailored recommendations.</p>
                            </div>
                        </div>
                    )}

                    <div className='card section-analysis-card fade-in delay-3'>
                        <div className='card__header'><h2>SECTION ANALYSIS</h2></div>
                        <div className='card__body'>
                            {/* OVERVIEW / SUMMARY */}
                            <div className='section-item'>
                                <div className='section-item__header'>
                                    <h3>RESUME OVERVIEW (Summary)</h3>
                                    {analysis.sectionAnalysis?.summary ? <span className='badge badge--status'>{analysis.sectionAnalysis.summary.status}</span> : null}
                                </div>
                                <div className='section-item__body'>
                                    {analysis.sectionAnalysis?.summary ? (
                                        <>
                                            <p><strong>Observation:</strong> {analysis.sectionAnalysis.summary.observations}</p>
                                            <p><strong>Suggestion:</strong> {analysis.sectionAnalysis.summary.suggestions}</p>
                                        </>
                                    ) : (
                                        <p className="text-muted italic">Not detected in this resume.</p>
                                    )}
                                </div>
                            </div>

                            {/* SKILLS */}
                            <div className='section-item'>
                                <div className='section-item__header'>
                                    <h3>SKILLS (Technical & Soft)</h3>
                                </div>
                                <div className='section-item__body'>
                                    {(analysis.jdIntelligence?.requiredSkills?.length > 0 || analysis.jdIntelligence?.preferredSkills?.length > 0 || analysis.matchBreakdown?.matchedSkills?.length > 0) ? (
                                        <>
                                            <p><strong>Identified Technical/Soft Skills:</strong> {(analysis.matchBreakdown?.matchedSkills || []).join(', ') || 'N/A'}</p>
                                            <p><strong>Missing Skills (from JD):</strong> {(analysis.matchBreakdown?.missingSkills || []).join(', ') || 'None'}</p>
                                        </>
                                    ) : (
                                        <p className="text-muted italic">Not detected in this resume.</p>
                                    )}
                                </div>
                            </div>

                            {/* EXPERIENCE */}
                            <div className='section-item'>
                                <div className='section-item__header'>
                                    <h3>EXPERIENCE</h3>
                                    {analysis.sectionAnalysis?.experience ? <span className='badge badge--status'>{analysis.sectionAnalysis.experience.status}</span> : null}
                                </div>
                                <div className='section-item__body'>
                                    {analysis.sectionAnalysis?.experience ? (
                                        <>
                                            <p><strong>Observation:</strong> {analysis.sectionAnalysis.experience.observations}</p>
                                            <p><strong>Suggestion:</strong> {analysis.sectionAnalysis.experience.suggestions}</p>
                                        </>
                                    ) : (
                                        <p className="text-muted italic">Not detected in this resume.</p>
                                    )}
                                </div>
                            </div>

                            {/* EDUCATION */}
                            <div className='section-item'>
                                <div className='section-item__header'>
                                    <h3>EDUCATION</h3>
                                </div>
                                <div className='section-item__body'>
                                    <p className="text-muted italic">Not detected in this resume.</p>
                                </div>
                            </div>

                            {/* PROJECTS */}
                            <div className='section-item'>
                                <div className='section-item__header'>
                                    <h3>PROJECTS</h3>
                                    {analysis.sectionAnalysis?.projects ? <span className='badge badge--status'>{analysis.sectionAnalysis.projects.status}</span> : null}
                                </div>
                                <div className='section-item__body'>
                                    {analysis.sectionAnalysis?.projects ? (
                                        <>
                                            <p><strong>Observation:</strong> {analysis.sectionAnalysis.projects.observations}</p>
                                            <p><strong>Suggestion:</strong> {analysis.sectionAnalysis.projects.suggestions}</p>
                                        </>
                                    ) : (
                                        <p className="text-muted italic">Not detected in this resume.</p>
                                    )}
                                </div>
                            </div>

                            {/* CERTIFICATIONS */}
                            <div className='section-item'>
                                <div className='section-item__header'>
                                    <h3>CERTIFICATIONS</h3>
                                </div>
                                <div className='section-item__body'>
                                    <p className="text-muted italic">Not detected in this resume.</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default ResumeIntelligence
