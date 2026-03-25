import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import './DashboardPage.css';

const DashboardPage = () => {
    const container = useRef();
    const [analyses, setAnalyses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/dashboard/')
            .then(res => res.json())
            .then(data => {
                setAnalyses(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Error fetching dashboard data:", err);
                setIsLoading(false);
            });
    }, []);

    const filteredAnalyses = analyses.filter(batch => {
        const location = batch.detections[0]?.sampling_location || 'Shared Batch';
        return location.toLowerCase().includes(searchQuery.toLowerCase());
    });

    useGSAP(() => {
        gsap.from('.analysis-card', {
            duration: 0.5,
            opacity: 0,
            y: 40,
            scale: 0.95,
            ease: 'back.out(1.2)',
            stagger: 0.08,
            clearProps: "all" // Cleans up inline styles after animation so hover effects work
        });
    }, { scope: container, dependencies: [searchQuery, isLoading] });

    if (isLoading) {
        return (
            <Layout>
                <div className="dashboard-loading">
                    <div className="spinner"></div>
                    <p>Fetching AI Analyses...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="dashboard-wrapper" ref={container}>
                {/* Header Section */}
                <div className="dashboard-header-modern">
                    <div className="header-title-group">
                        <h1>Analysis Dashboard</h1>
                        <p>Manage and review your microplastic detection batches.</p>
                    </div>
                    <div className="header-actions-modern">
                        <div className="search-wrapper">
                            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input 
                                type="text" 
                                placeholder="Search by location..." 
                                className="search-input-modern"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Link to="/qa" className="btn-primary-glow">
                            <span className="plus-icon">+</span> New Analysis
                        </Link>
                    </div>
                </div>

                {/* Section Title */}
                <div className="section-divider">
                    <h2>{searchQuery ? `Search Results for "${searchQuery}"` : "Recent Batches"}</h2>
                    <span className="batch-count">{filteredAnalyses.length} Total</span>
                </div>

                {/* Grid Section */}
                <div className="analysis-grid-modern">
                    {filteredAnalyses.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <h3>No results found</h3>
                            <p>We couldn't find any batches matching "{searchQuery}".</p>
                        </div>
                    )}

                    {filteredAnalyses.map(batch => {
                        const mainDisplay = batch.detections[0] || {};
                        
                        return (
                            <div className="analysis-card" key={batch.batch_id}>
                                <div className="card-image-wrapper">
                                    <img
                                        src={mainDisplay.annotated_image || '/placeholder-image.jpg'}
                                        alt={mainDisplay.filename || 'Analysis thumbnail'}
                                        className="card-image"
                                    />
                                    <div className="card-image-overlay"></div>
                                    {batch.image_count > 1 && (
                                        <span className="batch-badge-glass">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                            {batch.image_count} Images
                                        </span>
                                    )}
                                </div>
                                
                                <div className="card-body">
                                    <h3 className="card-location">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                        {mainDisplay.sampling_location || 'Shared Batch'}
                                    </h3>
                                    
                                    <p className="card-date">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        {batch.last_created ? new Date(batch.last_created).toLocaleString() : "Date N/A"}
                                    </p>

                                    <div className="tags-container">
                                        {Object.entries(batch.summary).map(([type, count]) => (
                                            count > 0 && (
                                                <span key={type} className={`type-tag tag-${type.toLowerCase()}`}>
                                                    {type}: <strong>{count}</strong>
                                                </span>
                                            )
                                        ))}
                                    </div>

                                    <div className="card-actions-modern">
                                        <Link to={`/results/${batch.batch_id}`} className="action-btn view-btn">
                                            View Results
                                        </Link>
                                        <Link to={`/report/${batch.batch_id}`} className="action-btn report-btn">
                                            Report
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Layout>
    );
};

export default DashboardPage;