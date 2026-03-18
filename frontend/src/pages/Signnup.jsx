import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import './AuthPage.css';

const SignnupPage = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(''); 

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(''); 

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        try {
            // 1. Updated URL to match your Django path: /api/signup/
            // 2. Django's User model requires 'username'. We will use the email as the username.
            const response = await axios.post('http://127.0.0.1:8000/api/signup/', {
                username: email, // Sending email as username
                email: email,
                password: password,
                fullName: fullName // Your backend view can ignore this or save to a profile
            });

            console.log('Registration successful:', response.data);
            alert('Signup successful! Please log in.');
            navigate('/loginn');

        } catch (err) {
            // 3. Updated error handling to match Django REST Framework response style
            if (err.response && err.response.data) {
                // Django usually sends errors in 'error' or 'detail' keys
                setError(err.response.data.error || err.response.data.detail || 'Registration failed.');
            } else {
                setError('Cannot connect to the backend server. Make sure Django is running.');
            }
            console.error('Registration error:', err);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Link to="/" className="logo">Marine Insight</Link>
                <h1>Create an Account</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullname">Full Name</label>
                        <input type="text" id="fullname" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input type="password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    {error && <p style={{ color: 'red', fontSize: '14px', marginTop: '10px' }}>{error}</p>}
                    <button type="submit" className="btn btn-primary signup">Sign Up</button>
                </form>
                <div className="form-links">
                    Already have an account? <Link to="/loginn">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default SignnupPage;