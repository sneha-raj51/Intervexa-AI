import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import "../auth.form.scss"

const Register = () => {

    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const { loading, handleRegister } = useAuth()
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleRegister({ username, email, password })
        navigate("/")
    }

    if (loading) {
        return (
            <main className='auth-loading'>
                <div className='spinner'></div>
                <p>Creating your account...</p>
            </main>
        )
    }

    return (
        <main className='auth-page'>
            <div className="auth-card">
                <div className='auth-card__header'>
                    <div className="logo-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    </div>
                    <h1>Create Account</h1>
                    <p>Join Intervexa AI and start your journey.</p>
                </div>

                <form onSubmit={handleSubmit} className='auth-form'>
                    <div className="input-group">
                        <label htmlFor="username">Full Name</label>
                        <input
                            onChange={(e) => { setUsername(e.target.value) }}
                            type="text" id="username" name='username' placeholder='Enter your full name' 
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email address</label>
                        <input
                            onChange={(e) => { setEmail(e.target.value) }}
                            type="email" id="email" name='email' placeholder='Enter your email' 
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => { setPassword(e.target.value) }}
                            type="password" id="password" name='password' placeholder='Create a password' 
                            required
                        />
                    </div>

                    <button className='btn-primary btn-full btn-glow' type="submit">
                        Create Account
                    </button>
                </form>

                <div className='auth-card__footer'>
                    <p>Already have an account? <Link to={"/login"} className='auth-link'>Sign in</Link></p>
                </div>
            </div>
            
            <div className='auth-bg-elements'>
                <div className='blob blob-1'></div>
                <div className='blob blob-2'></div>
            </div>
        </main>
    )
}

export default Register