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
            const token = localStorage.getItem('token') || localStorage.getItem('access'); // Get Token

            fetch('https://marine-insight-microplastics.onrender.com/api/dashboard/', {
                headers: {
                    'Authorization': `Bearer ${token}`, // Pass Token
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    if (!res.ok) throw new Error("Unauthorized or Network Error");
                    return res.json();
                })
                .then(data => {
                    setAnalyses(data);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching dashboard data:", err);
                    setIsLoading(false);
                    // Optional: navigate('/login') if token expired
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
    }, { scope: container, dependencies: [searchQuery, isLoading, analyses] });

    const handleDelete = async (batchId, location) => {
            const confirmed = window.confirm(
                `Delete this batch permanently? This will remove the analysis results for "${location || 'this batch'}" and cannot be undone.`
            );
            if (!confirmed) return;

            const token = localStorage.getItem('token') || localStorage.getItem('access'); // Get Token

            try {
                const response = await fetch(`https://marine-insight-microplastics.onrender.com/api/delete/batch/${batchId}/`, {
                    method: 'DELETE',
                    headers: { 
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}` // Pass Token
                    }
                });

                if (!response.ok) {
                    const result = await response.json().catch(() => ({}));
                    throw new Error(result.error || response.statusText || 'Delete failed');
                }

                setAnalyses((prev) => prev.filter((batch) => batch.batch_id !== batchId));
                alert('Batch deleted successfully.');
            } catch (error) {
                console.error('Delete error:', error);
                alert(`Could not delete batch: ${error.message}`);
            }
        };

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
                        {searchQuery ? (
                            /* What to show if they typed a search that failed */
                            <>
                                <div className="empty-icon">🔍</div>
                                <h3>No results found</h3>
                                <p>We couldn't find any batches matching "{searchQuery}".</p>
                            </>
                        ) : (
                            /* What to show if their dashboard is just empty */
                            <>
                                <div className="empty-icon">🌊</div>
                                <h3>No Analyses Yet</h3>
                                <p>You haven't uploaded any water samples for analysis. Click "New Analysis" in the top right to get started!</p>
                            </>
                        )}
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
                                    <div className="card-meta-top">
                                        <div>
                                            <h3 className="card-location">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                {mainDisplay.sampling_location || 'Shared Batch'}
                                            </h3>
                                            <p className="card-date">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                                {batch.last_created ? new Date(batch.last_created).toLocaleString() : "Date N/A"}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            className="delete-icon-btn"
                                            onClick={() => handleDelete(batch.batch_id, mainDisplay.sampling_location)}
                                            aria-label="Delete batch"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18"></path>
                                                <path d="M8 6v12"></path>
                                                <path d="M16 6v12"></path>
                                                <path d="M5 6l1-3h12l1 3"></path>
                                                <path d="M9 10v8"></path>
                                                <path d="M15 10v8"></path>
                                            </svg>
                                        </button>
                                    </div>

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