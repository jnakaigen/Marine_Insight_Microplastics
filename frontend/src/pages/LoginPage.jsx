import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthPage.css';

// --- Particle Imports ---
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import particlesConfig from '../particlesConfig';

// --- GSAP Imports ---
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

// Removed: import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    // --- State and Refs ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const container = useRef();
    const errorRef = useRef();

    // --- Hooks ---
    const navigate = useNavigate();
    // Removed: const { login } = useAuth();
    
    // --- GSAP Animations ---
    useGSAP(() => {
        gsap.from('.auth-container', {
            duration: 0.8,
            opacity: 0,
            y: 50,
            ease: 'power3.out',
            delay: 0.2
        });
        if (error) {
            gsap.fromTo(errorRef.current, 
                { x: -10 }, 
                { x: 10, duration: 0.05, repeat: 5, yoyo: true, clearProps: 'x' }
            );
        }
    }, { scope: container, dependencies: [error] });

    // --- Particle Engine ---
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    // --- Form Submission ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login', {
                email,
                password,
            });

            // Replaced the context function with a direct localStorage call
            localStorage.setItem('token', response.data.access_token);
            
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="auth-page" ref={container}>
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={particlesConfig}
                style={{ position: 'absolute', zIndex: 0, top: 0, left: 0, width: '100%', height: '100%' }}
            />

            <div className="auth-container" style={{ zIndex: 1 }}>

                <Link to="/" className="logo">Marine Insight</Link>
                <h1>Welcome Back</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                     {error && <p style={{ color: 'red' }} ref={errorRef}>{error}</p>}
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="form-links">
                    <Link to="/forgot-password">Forgot Password?</Link> | <Link to="/signup">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;