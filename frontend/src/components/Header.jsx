// // src/components/Header.js
// import React from 'react';
// import { Link } from 'react-router-dom';
// import './Header.css';

// const Header = ({ type = 'main' }) => {
//     return (
//         <header className="app-header">
//             <div className="container">
//                 <nav>
//                     <Link to="/" className="logo">Marine Insight</Link>
//                     {type === 'main' && (
//                          <ul>
//                             <li><Link to="/dashboard">Dashboard</Link></li>
//                             <li><Link to="/qa">Analysis</Link></li>
//                             <li><Link to="/report">Reports</Link></li>
//                             <li><Link to="/loginn">Logout</Link></li>
                          
//                         </ul>
//                     )}
//                      {type === 'landing' && (
//                          <ul>
//                             <li><a href="#features">Features</a></li>
//                             <li><a href="#how-it-works">How It Works</a></li>
//                                 <li><Link to="/edu">Educational Awareness</Link></li>
//                             <li><Link to="/loginn" className="btn btn-primary">Login / Sign Up</Link></li>
//                         </ul>
//                     )}
//                 </nav>
//             </div>
//         </header>
//     );
// };

// export default Header;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ type = 'main' }) => {
    const [isDarkMode, setIsDarkMode] = useState(true); // Default to your favorite Dark Mode

    // Update the data-theme attribute on the <html> tag
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    return (
        <header className="app-header">
            <div className="container">
                <nav>
                    <Link to="/" className="logo">Marine Insight</Link>
                    
                    {type === 'main' && (
                         <ul>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><Link to="/qa">Analysis</Link></li>
                            <li><Link to="/report">Reports</Link></li>
                            <li><Link to="/loginn">Logout</Link></li>
                             <li><Link to="/edu">Educational awareness</Link></li>
                        </ul>
                    )}

                    {type === 'landing' && (
                         <ul>
                            <li><a href="#features">Features</a></li>
                            <li><a href="#how-it-works">How It Works</a></li>
                            <li><Link to="/edu">Educational Awareness</Link></li>
                            <li><Link to="/loginn" className="btn btn-primary">Login / Sign Up</Link></li>
                        </ul>
                    )}

                    {/* Theme Toggle Button */}
                    <button onClick={toggleTheme} className="theme-toggle-btn">
                        {isDarkMode ? '🌙 Dark' : '☀️ Light'}
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;