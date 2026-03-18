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

const LoginnPage = () => {
    // --- State and Refs ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const container = useRef();
    const errorRef = useRef();

    // --- Hooks ---
    const navigate = useNavigate();
    
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
            // 1. Updated URL to match Django /api/signin/
            // 2. We send 'username' key because Django's SimpleJWT expects 'username'
            const response = await axios.post('http://127.0.0.1:8000/api/login/', {
                username: email, // Using email as the username
                password: password,
            });

            // 3. SimpleJWT returns the token in 'access'. We save it to localStorage
            localStorage.setItem('token', response.data.access);
            
            navigate('/dashboard');
        } catch (err) {
            // 4. Handle Django/SimpleJWT error message
            setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
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
                    <Link to="/forgot-password">Forgot Password?</Link> | <Link to="/signnup">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginnPage;