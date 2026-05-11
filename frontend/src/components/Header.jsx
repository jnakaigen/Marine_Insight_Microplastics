

// export default Header;
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Header.css';

const Header = ({ type = 'main' }) => {
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';
    const toggleThemeLabel = isDarkMode ? '☀️ Light' : '🌙 Dark';

    return (
        <header className="app-header">
            <div className="container">
                <nav>
                    <Link to="/" className="logo">Marine Insight</Link>

                    {type === 'main' && (
                        <>
                            <ul>
                                <li><Link to="/dashboard">Dashboard</Link></li>
                                <li><Link to="/qa">Analysis</Link></li>
                                <li><Link to="/edu">Educational awareness</Link></li>
                                <li><Link to="/loginn">Logout</Link></li>
                            </ul>
                            <div className="header-actions">
                                <button onClick={toggleTheme} className="theme-toggle-btn">
                                    {toggleThemeLabel}
                                </button>
                                <Link to="/settings" className="settings-icon-link" aria-label="Settings">
                                    <span className="settings-icon">⚙️</span>
                                </Link>
                            </div>
                        </>
                    )}

                    {type === 'landing' && (
                         <ul>
                            <li><a href="#features">Features</a></li>
                            <li><a href="#how-it-works">How It Works</a></li>
                            <li><Link to="/edu">Educational Awareness</Link></li>
                            <li><Link to="/loginn" className="btn btn-primary">Login / Sign Up</Link></li>
                        </ul>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;