// import { gsap } from 'gsap';
// import { useGSAP } from '@gsap/react';
// import React, { useState, useEffect, useRef } from 'react';
// import { Link } from 'react-router-dom';
// import Layout from '../components/Layout';
// import './DashboardPage.css';

// const DashboardPage = () => {
//     const container = useRef();
//     const [analyses, setAnalyses] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         fetch('http://127.0.0.1:8000/api/dashboard/')
//             .then(res => res.json())
//             .then(data => {
//                 setAnalyses(data);
//                 setIsLoading(false);
//             })
//             .catch(err => {
//                 console.error("Error fetching dashboard data:", err);
//                 setIsLoading(false);
//             });
//     }, []);

//     // GSAP animations
//     useGSAP(() => {
//         gsap.from('.dashboard-header, .section-title', {
//             duration: 0.7,
//             opacity: 0,
//             y: -30,
//             ease: 'power3.out',
//             stagger: 0.2,
//         });

//         gsap.from('.analysis-card', {
//             duration: 0.6,
//             opacity: 0,
//             y: 50,
//             ease: 'power3.out',
//             stagger: 0.1,
//             delay: 0.4,
//         });
//     }, { scope: container });

//     if (isLoading) {
//         return <Layout><div style={{ padding: '20px' }}>Loading dashboard...</div></Layout>;
//     }

//     return (
//         <Layout>
//             <div ref={container}>
//                 <div className="dashboard-header">
//                     <h1>Dashboard</h1>
//                     <Link to="/upload" className="btn">Start New Analysis</Link>
//                 </div>

//                 <h2 className="section-title">Recent Analyses</h2>

//                 <div className="analysis-grid" style={{ marginBottom: '60px' }}>
//                     {analyses.length === 0 && <p>No analyses found.</p>}

//                     {analyses.map(batch =>
//                         batch.detections.map(analysis => (
//                             <div className="analysis-card" key={analysis.id}>
//                                 <img
//                                     src={analysis.annotated_image || analysis.annotated_image_base64}
//                                     alt={analysis.filename}
//                                 />
//                                 <div className="card-content">
//                                     <h3>{analysis.sampling_location}</h3>
//                                     {/* <p><strong>Location:</strong> {analysis.sampling_location || 'N/A'}</p> */}
//                                     <p>
//                                         <strong>Date & Time:</strong>{" "}
//                                         {analysis.analysis_timestamp
//                                             ? new Date(analysis.analysis_timestamp).toLocaleString()
//                                             : "N/A"}
//                                     </p>

//                                     <div className="card-actions">
//                                         <Link
//                                             to={`/results/${batch.batch_id}`}
//                                             className="btn-view"
//                                         >
//                                             View Results
//                                         </Link>

//                                         <Link to="/report" className="btn-report">View Report</Link>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))
//                     )}
//                 </div>
//             </div>
//         </Layout>
//     );
// };

// export default DashboardPage;




// import { gsap } from 'gsap';
// import { useGSAP } from '@gsap/react';
// import React, { useState, useEffect, useRef } from 'react';
// import { Link } from 'react-router-dom';
// import Layout from '../components/Layout';
// import './DashboardPage.css';

// const DashboardPage = () => {
//     const container = useRef();
//     const [analyses, setAnalyses] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         fetch('http://127.0.0.1:8000/api/dashboard/')
//             .then(res => res.json())
//             .then(data => {
//                 setAnalyses(data);
//                 setIsLoading(false);
//             })
//             .catch(err => {
//                 console.error("Error fetching dashboard data:", err);
//                 setIsLoading(false);
//             });
//     }, []);

//     // GSAP animations - kept exactly as you had them
//     useGSAP(() => {
//         gsap.from('.dashboard-header, .section-title', {
//             duration: 0.7,
//             opacity: 0,
//             y: -30,
//             ease: 'power3.out',
//             stagger: 0.2,
//         });

//         gsap.from('.analysis-card', {
//             duration: 0.6,
//             opacity: 0,
//             y: 50,
//             ease: 'power3.out',
//             stagger: 0.1,
//             delay: 0.4,
//         });
//     }, { scope: container });

//     if (isLoading) {
//         return <Layout><div style={{ padding: '20px' }}>Loading dashboard...</div></Layout>;
//     }

//     return (
//         <Layout>
//             <div ref={container}>
//                 <div className="dashboard-header">
//                     <h1>Dashboard</h1>
//                     <Link to="/qa" className="btn">Start New Analysis</Link>
//                 </div>

//                 <h2 className="section-title">Recent Analyses</h2>

//                 <div className="analysis-grid" style={{ marginBottom: '60px' }}>
//                     {analyses.length === 0 && <p>No analyses found.</p>}

//                     {/* EDIT: Map through batches, not individual detections */}
//                     {analyses.map(batch => {
//                         // Use the first detection in the batch for the display info
//                         const mainDisplay = batch.detections[0] || {};
                        
//                         return (
//                             <div className="analysis-card" key={batch.batch_id}>
//                                 <div style={{ position: 'relative' }}>
//                                     <img
//                                         src={mainDisplay.annotated_image}
//                                         alt={mainDisplay.filename}
//                                     />
//                                     {/* Small badge to show how many images are in this batch */}
//                                     {batch.image_count > 1 && (
//                                         <span className="batch-badge">
//                                             {batch.image_count} Images
//                                         </span>
//                                     )}
//                                 </div>
//                                 <div className="card-content">
//                                     <h3>{mainDisplay.sampling_location || 'Shared Batch'}</h3>
                                    
//                                     <p>
//                                         <strong>Date & Time:</strong>{" "}
//                                         {batch.last_created
//                                             ? new Date(batch.last_created).toLocaleString()
//                                             : "N/A"}
//                                     </p>

                                    
//                                     <div className="batch-summary">
//                                         {Object.entries(batch.summary).map(([type, count]) => (
//                                             count > 0 && <span key={type} className="type-tag">{type}: {count}</span>
//                                         ))}
//                                     </div>

//                                     <div className="card-actions">
//                                         <Link
//                                             to={`/results/${batch.batch_id}`}
//                                             className="btn-view"
//                                         >
//                                             View Batch Results
//                                         </Link>

//                                         <Link to="/report" className="btn-report">View Report</Link>
//                                     </div>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>
//         </Layout>
//     );
// };

// export default DashboardPage;



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
    // 1. Add state for the search query
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

    // 2. Filter the analyses based on the sampling_location
    const filteredAnalyses = analyses.filter(batch => {
        const location = batch.detections[0]?.sampling_location || 'Shared Batch';
        return location.toLowerCase().includes(searchQuery.toLowerCase());
    });

    useGSAP(() => {
        // We trigger animations whenever the filtered list changes to keep it snappy
        gsap.from('.analysis-card', {
            duration: 0.6,
            opacity: 0,
            y: 30,
            ease: 'power3.out',
            stagger: 0.1,
        });
    }, { scope: container, dependencies: [searchQuery] }); 

    if (isLoading) {
        return <Layout><div style={{ padding: '20px' }}>Loading dashboard...</div></Layout>;
    }

    return (
        <Layout>
            <div ref={container}>
                <div className="dashboard-header">
                    <h1>Dashboard</h1>
                    <div className="header-actions">
                        {/* 3. Search Input Field */}
                        <input 
                            type="text" 
                            placeholder="Search by location..." 
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Link to="/qa" className="btn">Start New Analysis</Link>
                    </div>
                </div>

                <h2 className="section-title">
                    {searchQuery ? `Results for "${searchQuery}"` : "Recent Analyses"}
                </h2>

                <div className="analysis-grid" style={{ marginBottom: '60px' }}>
                    {/* 4. Map through filteredAnalyses instead of analyses */}
                    {filteredAnalyses.length === 0 && (
                        <p className="no-results">No analyses found matching that location.</p>
                    )}

                    {filteredAnalyses.map(batch => {
                        const mainDisplay = batch.detections[0] || {};
                        
                        return (
                            <div className="analysis-card" key={batch.batch_id}>
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={mainDisplay.annotated_image}
                                        alt={mainDisplay.filename}
                                    />
                                    {batch.image_count > 1 && (
                                        <span className="batch-badge">
                                            {batch.image_count} Images
                                        </span>
                                    )}
                                </div>
                                <div className="card-content">
                                    <h3>{mainDisplay.sampling_location || 'Shared Batch'}</h3>
                                    
                                    <p>
                                        <strong>Date & Time:</strong>{" "}
                                        {batch.last_created
                                            ? new Date(batch.last_created).toLocaleString()
                                            : "N/A"}
                                    </p>

                                    <div className="batch-summary">
                                        {Object.entries(batch.summary).map(([type, count]) => (
                                            count > 0 && <span key={type} className="type-tag">{type}: {count}</span>
                                        ))}
                                    </div>

                                    <div className="card-actions">
                                        <Link to={`/results/${batch.batch_id}`} className="btn-view">
                                            View Batch Results
                                        </Link>
                                        <Link to="/report" className="btn-report">View Report</Link>
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
