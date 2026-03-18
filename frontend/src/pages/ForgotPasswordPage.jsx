import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPage.css'; // Reusing the same CSS

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Password reset requested for email:', email);

        // --- TODO: Add your API call here to trigger the password reset email ---

        alert('If an account with that email exists, a password reset link has been sent.');
        
        // Navigate back to the login page
        navigate('/login');
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Link to="/" className="logo">Marine Insight</Link>
                <h1>Reset Your Password</h1>
                <p style={{ color: '#666', marginBottom: '25px' }}>
                    Enter your email address below, and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Send Reset Link</button>
                </form>
                <div className="form-links">
                    <Link to="/login">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;