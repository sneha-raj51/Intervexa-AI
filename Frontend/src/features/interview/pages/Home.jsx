import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useSearchParams } from 'react-router'

const LoadingScreen = () => (
    <div className='loading-screen'>
        <div className='loading-screen__card'>
            <div className='loading-screen__spinner'>
                <svg viewBox="0 0 50 50">
                    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle>
                </svg>
            </div>
            <h2 className='loading-screen__title'>Building your interview strategy</h2>
            <p className='loading-screen__subtitle'>Your profile is being matched against your target role.</p>
            
            <div className='loading-screen__steps'>
                <div className='step step--active'>✓ Reading your resume</div>
                <div className='step step--active'>✓ Understanding your experience</div>
                <div className='step step--pulse'>● Comparing your skills</div>
                <div className='step'>○ Identifying skill gaps</div>
                <div className='step'>○ Preparing interview questions</div>
                <div className='step'>○ Building your preparation roadmap</div>
            </div>
        </div>
    </div>
)

const Home = () => {

    const { loading, generateReport, reports } = useInterview()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ selectedFile, setSelectedFile ] = useState(null)
    const [ isDragging, setIsDragging ] = useState(false)
    const resumeInputRef = useRef()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const jobId = searchParams.get('jobId')

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === "application/pdf") {
                setSelectedFile(file);
                // Assign to ref for API logic
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                resumeInputRef.current.files = dataTransfer.files;
            } else {
                alert("Only PDF files are supported");
            }
        }
    };

    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current?.files?.[ 0 ]
        if (!jobDescription) return alert("Target Job Description is required.");
        if (!resumeFile && !selfDescription) return alert("Either a Resume or a Self Description is required.");
        
        const data = await generateReport({ jobDescription, selfDescription, resumeFile, jobId })
        if (data) {
            navigate(`/interview/${data._id}`)
        }
    }

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <div className='home-page'>
            <header className='page-header'>
                <h1 className='page-header__title'>Prepare for your next opportunity.</h1>
                <p className='page-header__subtitle'>Understand your fit. Discover your gaps. Prepare with confidence.</p>
            </header>

            <div className='dashboard-grid'>
                <div className='dashboard-grid__left'>
                    <div className='card input-card'>
                        <div className='card__header'>
                            <h2>YOUR RESUME</h2>
                        </div>
                        <div className='card__body'>
                            <p className='input-label'>Upload your resume</p>
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
                                        <p className='dropzone__filesize'>{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className='dropzone__title'>Click to upload or drag & drop</p>
                                        <p className='dropzone__subtitle'>PDF (Max 5MB)</p>
                                    </>
                                )}
                                <input onChange={(e) => setSelectedFile(e.target.files[0])} ref={resumeInputRef} hidden type='file' id='resume' name='resume' accept='.pdf' />
                            </label>
                        </div>

                        <div className='or-divider'><span>OR</span></div>

                        <div className='card__body'>
                            <div className='header-flex'>
                                <h2>ABOUT YOU</h2>
                            </div>
                            <p className='input-label'>Tell us about your experience, skills, projects and goals.</p>
                            <textarea
                                onChange={(e) => setSelfDescription(e.target.value)}
                                className='beautiful-input'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                                rows="5"
                            />
                        </div>
                    </div>
                </div>

                <div className='dashboard-grid__right'>
                    <div className='card input-card h-full flex-col'>
                        <div className='card__header flex-between'>
                            <h2>TARGET ROLE</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <div className='card__body flex-1 flex-col'>
                            <p className='input-label'>Paste the job description for the role you're applying for.</p>
                            <textarea
                                onChange={(e) => setJobDescription(e.target.value)}
                                className='beautiful-input flex-1'
                                placeholder="Paste the full job description here..."
                                maxLength={5000}
                            />
                            <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='action-footer'>
                <button onClick={handleGenerateReport} className='btn-primary btn-large btn-glow'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                    Generate Interview Strategy
                </button>
            </div>
        </div>
    )
}

export default Home