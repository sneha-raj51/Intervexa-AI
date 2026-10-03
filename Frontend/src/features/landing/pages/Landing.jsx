import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../auth/hooks/useAuth';
import "../style/landing.scss";

export const Landing = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            navigate('/dashboard');
        }
    }, [user, loading, navigate]);

    return (
        <div className="landing-page fade-in">
            <section className="landing-hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        From Resume to <span className="text-gradient">Interview Ready.</span>
                    </h1>
                    <p className="hero-subtitle">
                        Turn your resume into a smarter interview preparation journey.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary btn-large btn-glow" onClick={() => navigate('/register')}>Get Started</button>
                        <button className="btn-secondary btn-large" onClick={() => navigate('/login')}>Login</button>
                    </div>
                </div>
            </section>

            <section className="landing-how-it-works">
                <h2 className="section-title">HOW IT WORKS</h2>
                <div className="steps-grid">
                    <div className="step-card">
                        <span className="step-number">01</span>
                        <h3>Analyze Your Resume</h3>
                        <p>Understand your skills, experience, projects and preparation gaps.</p>
                    </div>
                    <div className="step-card">
                        <span className="step-number">02</span>
                        <h3>Understand Your Target Role</h3>
                        <p>Compare your resume against the role you actually want.</p>
                    </div>
                    <div className="step-card">
                        <span className="step-number">03</span>
                        <h3>Practice With AI</h3>
                        <p>Generate personalized interview questions and mock interviews.</p>
                    </div>
                    <div className="step-card">
                        <span className="step-number">04</span>
                        <h3>Track Your Progress</h3>
                        <p>Understand your readiness and focus on your weakest areas.</p>
                    </div>
                </div>
            </section>

            <section className="landing-features">
                <h2 className="section-title">CORE FEATURES</h2>
                <div className="features-grid">
                    <div className="feature-pill">Resume Intelligence</div>
                    <div className="feature-pill">Job Match</div>
                    <div className="feature-pill">AI Mock Interview</div>
                    <div className="feature-pill">Practice Hub</div>
                    <div className="feature-pill">Progress Tracking</div>
                    <div className="feature-pill">Job Tracker</div>
                    <div className="feature-pill">Resume Versions</div>
                    <div className="feature-pill">Career Insights</div>
                </div>
            </section>

            <section className="landing-cta">
                <div className="cta-content">
                    <h2>FROM RESUME TO INTERVIEW READY</h2>
                    <h1 className="cta-large-text">Analyze. Practice. Improve. Repeat.</h1>
                    <button className="btn-primary btn-large btn-glow mt-8" onClick={() => navigate('/register')}>Start Preparing</button>
                </div>
            </section>

            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">Intervexa AI</div>
                    <p>From Resume to Interview Ready.</p>
                </div>
            </footer>
        </div>
    );
};
