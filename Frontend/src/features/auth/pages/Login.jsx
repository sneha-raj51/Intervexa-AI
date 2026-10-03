import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await handleLogin({ email, password })
            navigate('/')
        } catch (error) {
            alert(error.response?.data?.message || "Login failed")
        }
    }

    if (loading) {
        return (
            <main className='auth-loading'>
                <div className='spinner'></div>
                <p>Signing in...</p>
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
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue to Intervexa AI</p>
                </div>

                <form onSubmit={handleSubmit} className='auth-form'>
                    <div className="input-group">
                        <label htmlFor="email">Email address</label>
                        <input
                            onChange={(e) => { setEmail(e.target.value) }}
                            type="email" id="email" name='email' placeholder='Enter your email' 
                            required
                        />
                    </div>
                    <div className="input-group">
                        <div className='password-header'>
                            <label htmlFor="password">Password</label>
                            <a href="#" className='forgot-link'>Forgot password?</a>
                        </div>
                        <input
                            onChange={(e) => { setPassword(e.target.value) }}
                            type="password" id="password" name='password' placeholder='Enter your password' 
                            required
                        />
                    </div>
                    
                    <button className='btn-primary btn-full btn-glow' type="submit">
                        Sign In
                    </button>
                </form>
                
                <div className='auth-card__footer'>
                    <p>Don't have an account? <Link to={"/register"} className='auth-link'>Create one now</Link></p>
                </div>
            </div>
            <div className='auth-bg-elements'>
                <div className='blob blob-1'></div>
                <div className='blob blob-2'></div>
            </div>
        </main>
    )
}

export default Login