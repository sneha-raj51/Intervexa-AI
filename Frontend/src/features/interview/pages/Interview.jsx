import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'

const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Preparation Roadmap', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
]

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [ open, setOpen ] = useState(false)
    return (
        <div className={`q-accordion ${open ? 'q-accordion--open' : ''}`}>
            <div className='q-accordion__header' onClick={() => setOpen(o => !o)}>
                <div className='q-accordion__title-group'>
                    <span className='q-accordion__index'>Q{index + 1}</span>
                    <h3 className='q-accordion__question'>{item.question}</h3>
                </div>
                <span className='q-accordion__chevron'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>
            <div className='q-accordion__body'>
                <div className='q-accordion__why'>
                    <div className='why-header'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        Why are you being asked this?
                    </div>
                    <p>{item.intention}</p>
                </div>
                <div className='q-accordion__section'>
                    <h4 className='q-accordion__label answer'>Model Answer</h4>
                    <p>{item.answer}</p>
                </div>
            </div>
        </div>
    )
}

const RoadMapDay = ({ day, index }) => (
    <div className='timeline-item' style={{ animationDelay: `${index * 0.1}s` }}>
        <div className='timeline-item__dot'></div>
        <div className='timeline-item__content card'>
            <div className='timeline-item__header'>
                <span className='badge badge--day'>Day {day.day}</span>
                <h3 className='timeline-item__focus'>{day.focus}</h3>
            </div>
            <ul className='timeline-item__tasks'>
                {day.tasks.map((task, i) => (
                    <li key={i}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="task-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        <span>{task}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [ activeNav, setActiveNav ] = useState('technical')
    const { report, getReportById, loading, getResumePdf } = useInterview()
    const { interviewId } = useParams()

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [ interviewId ])

    if (loading || !report) {
        return (
            <main className='loading-screen'>
                <div className='loading-screen__card'>
                    <div className='loading-screen__spinner'>
                        <svg viewBox="0 0 50 50">
                            <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle>
                        </svg>
                    </div>
                    <h2 className='loading-screen__title'>Retrieving Report</h2>
                    <p className='loading-screen__subtitle'>Loading your personalized interview strategy.</p>
                </div>
            </main>
        )
    }

    const scoreColor =
        report.matchScore >= 80 ? 'high' :
            report.matchScore >= 60 ? 'mid' : 'low'

    const scoreLabel = report.matchScore >= 80 ? 'Strong alignment with this role' : report.matchScore >= 60 ? 'Moderate alignment with this role' : 'Requires significant preparation';

    return (
        <div className='report-page'>
            {/* Header Area */}
            <header className='report-header'>
                <div className='report-header__content'>
                    <div className='report-header__titles'>
                        <h1 className='report-header__role'>{report.title || 'Untitled Position'}</h1>
                        <p className='report-header__sub'>Your Personalized Interview Strategy</p>
                    </div>
                    <button onClick={() => getResumePdf(interviewId)} className='btn-secondary'>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Download Resume PDF
                    </button>
                </div>
            </header>

            <div className='report-layout'>
                {/* ── Left Sidebar: Stats & Gaps ── */}
                <aside className='report-sidebar'>
                    <div className='card stats-card'>
                        <div className='stats-card__circle-container'>
                            <svg viewBox="0 0 36 36" className={`circular-chart ${scoreColor}`}>
                                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="circle" strokeDasharray={`${report.matchScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div className='stats-card__score-text'>
                                <span className='value'>{report.matchScore}</span>
                                <span className='pct'>%</span>
                            </div>
                        </div>
                        <h3 className='stats-card__title'>JOB MATCH</h3>
                        <p className='stats-card__desc'>{scoreLabel}</p>
                    </div>

                    <div className='card gaps-card'>
                        <div className='card__header'>
                            <h2>SKILL INTELLIGENCE</h2>
                        </div>
                        <div className='card__body skill-intelligence'>
                            {report.skillGaps.map((gap, i) => {
                                const percentage = gap.severity === 'high' ? 30 : gap.severity === 'medium' ? 60 : 80;
                                const label = gap.severity === 'high' ? 'Missing Skill' : gap.severity === 'medium' ? 'Needs Improvement' : 'Partial Match';
                                return (
                                    <div key={i} className='skill-progress-item'>
                                        <div className='skill-progress-item__labels'>
                                            <span className='skill-name'>{gap.skill}</span>
                                            <span className={`skill-label severity-${gap.severity}`}>{label}</span>
                                        </div>
                                        <div className='progress-bar'>
                                            <div className={`progress-bar__fill severity-${gap.severity}`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                )
                            })}
                            {report.skillGaps.length === 0 && (
                                <p className='text-muted'>No major skill gaps identified!</p>
                            )}
                        </div>
                    </div>
                </aside>

                {/* ── Main Content Area ── */}
                <main className='report-main'>
                    {/* Inner Nav */}
                    <nav className='report-nav'>
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                className={`report-nav__item ${activeNav === item.id ? 'active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className='report-content'>
                        {activeNav === 'technical' && (
                            <section className='fade-in'>
                                <div className='section-header'>
                                    <h2>Technical Questions</h2>
                                    <span className='count-badge'>{report.technicalQuestions.length}</span>
                                </div>
                                <div className='accordion-list'>
                                    {report.technicalQuestions.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeNav === 'behavioral' && (
                            <section className='fade-in'>
                                <div className='section-header'>
                                    <h2>Behavioral Questions</h2>
                                    <span className='count-badge'>{report.behavioralQuestions.length}</span>
                                </div>
                                <div className='accordion-list'>
                                    {report.behavioralQuestions.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeNav === 'roadmap' && (
                            <section className='fade-in'>
                                <div className='section-header'>
                                    <h2>Preparation Roadmap</h2>
                                    <span className='count-badge'>{report.preparationPlan.length} Days</span>
                                </div>
                                <div className='timeline'>
                                    {report.preparationPlan.map((day, i) => (
                                        <RoadMapDay key={day.day} day={day} index={i} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Interview