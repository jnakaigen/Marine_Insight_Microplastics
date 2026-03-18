// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="app-footer">
            <div className="container">
                <div className="logo">Marine Insight</div>
                <ul>
                    <li><Link to="/resources">Resources</Link></li>
                    <li><Link to="/legal">Legal</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                </ul>
            </div>
        </footer>
    );
};

export default Footer;