import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SingleViewReport = () => {
    const [detectionData, setDetectionData] = useState(null);
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`http://127.0.0.1:8000/api/detection/${batchId}/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
        .then(res => res.json())
        .then(data => {
            // Standardizing the data structure
            const singleItem = data.results ? data.results[0] : data;
            setDetectionData(singleItem);
            setLoading(false);
        })
        .catch(err => {
            console.error("Error:", err);
            setLoading(false);
        });
    }, [id]);

    if (loading) return <div style={styles.loader}>Loading Analysis...</div>;
    if (!detectionData) return <div style={styles.loader}>No data available.</div>;

    // Optional: Logic to define morphology remarks
    const getRemarks = (type) => {
        const remarks = {
            'fiber': 'Long, thin elongated shapes',
            'fragment': 'Irregular, moderately circular',
            'film': 'Sheet-like structure',
            'pellet': 'Spherical microbeads'
        };
        return remarks[type.toLowerCase()] || 'General morphological structure';
    };

    return (
         <Layout>
            {/* ---------- Header ---------- */}
            <div className="report-header">
                <h1>Microplastic Analysis Report</h1>
            </div>

            {/* ---------- Actions ---------- */}
            <div className="report-actions">
                <button className="btn">Export Report</button>
                <button className="btn">Share Report</button>
            </div>

            {/* ---------- Overview ---------- */}
            <section className="section-card">
                <h2 className="section-title">Analysis Overview</h2>
                <div className="stats-overview">
                    <div className="stat-item">
                        <div className="value">{detectionData.total_particles}</div>
                        <div className="label">Total Particles Detected</div>
                    </div>
                    <div className="stat-item">
                        <div className="value">~{detectionData.average_area}px²</div>
                        <div className="label">Average Particle Area</div>
                    </div>
                    <div className="stat-item">
                        <div className="value">{detectionData.dominant_morphology}</div>
                        <div className="label">Dominant Morphology</div>
                    </div>
                </div>
            </section>

            {/* ---------- Morphological Summary ---------- */}
            <section className="section-card">
                <h2 className="section-title">Particle Morphological Summary</h2>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Class</th>
                            <th>Average Area (px²)</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Fiber</td>
                            <td>~490</td>
                            <td>Long, thin elongated shapes</td>
                        </tr>
                        <tr>
                            <td>Fragment</td>
                            <td>~1250</td>
                            <td>Irregular, moderately circular</td>
                        </tr>
                        <tr>
                            <td>Film</td>
                            <td>~820</td>
                            <td>Sheet-like structure</td>
                        </tr>
                        <tr>
                            <td>Pellet</td>
                            <td>~62</td>
                            <td>Spherical microbeads</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* ---------- Charts ---------- */}
            <section className="section-card">
                <div className="charts-container">
                    <div className="chart">
                        <h3 className="chart-title">Size Distribution</h3>
                        <div className="bar-chart">
                            <div className="bar" style={{ height: '15%' }}>
                                <div className="bar-label">&lt;300 px²</div>
                            </div>
                            <div className="bar" style={{ height: '35%' }}>
                                <div className="bar-label">300–500 px²</div>
                            </div>
                            <div className="bar" style={{ height: '70%' }}>
                                <div className="bar-label">500–1000 px²</div>
                            </div>
                            <div className="bar" style={{ height: '95%' }}>
                                <div className="bar-label">&gt;1000 px²</div>
                            </div>
                        </div>
                    </div>

                    <div className="chart">
                        <h3 className="chart-title">Morphological Distribution</h3>
                        <div className="bar-chart">
                            <div className="bar bar-green" style={{ height: '90%' }}>
                                <div className="bar-label">Fiber</div>
                            </div>
                            <div className="bar bar-green" style={{ height: '65%' }}>
                                <div className="bar-label">Fragment</div>
                            </div>
                            <div className="bar bar-green" style={{ height: '45%' }}>
                                <div className="bar-label">Film</div>
                            </div>
                            <div className="bar bar-green" style={{ height: '25%' }}>
                                <div className="bar-label">Pellet</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- Insights ---------- */}
            <section className="section-card">
                <h2 className="section-title">AI Insights & Interpretation</h2>
                <ul className="insights-list">
    <li>
        The analysis confirms that <strong>fragments dominate</strong> the dataset with large areas (~1250 px²),
       exhibiting near-circular shapes and moderate size. matching their elongated textile morphology.
    </li>
    <li>
        <strong>Fibers</strong> matching their elongated textile morphology (~490 px²).
    </li>
    <li>
        <strong>Films</strong> show flexible, variable forms, indicating thin sheet-like particles (~820 px²).
    </li>
    <li>
        <strong>Pellets</strong> have small areas (~62 px²), suggesting spherical industrial microbeads.
    </li>
    <li>
        Overall, these quantitative shape metrics validate the model’s
        ability to distinguish between microplastic morphologies with measurable precision.
    </li>
</ul>

            </section>

            {/* ---------- CTA ---------- */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link
                    to="/analysiss"
                    className="btn btn-primary"
                    style={{ padding: '15px 40px', fontSize: '1.1em' }}
                >
                    Start New Analysis
                </Link>
            </div>
        </Layout>
    );
};

const styles = {
    container: { padding: '30px', backgroundColor: '#f5f7fa', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
    backBtn: { border: 'none', background: 'none', color: '#0077be', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' },
    headerSection: { marginBottom: '30px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' },
    imageGrid: { display: 'flex', gap: '20px', marginBottom: '30px' },
    card: { flex: 1, background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' },
    cardLabel: { marginTop: '0', color: '#666', fontSize: '14px', marginBottom: '10px' },
    mainImg: { width: '100%', borderRadius: '8px' },
    
    // Table Styles matching your screenshot
    tableCard: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '25px', marginBottom: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #e0e0e0' },
    tableTitle: { fontSize: '20px', color: '#333', marginBottom: '20px', fontWeight: '400' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px 15px', backgroundColor: '#f8f9fa', color: '#666', borderBottom: '1px solid #dee2e6', fontSize: '14px', fontWeight: '600' },
    tr: { borderBottom: '1px solid #f0f0f0' },
    td: { padding: '15px', color: '#555', fontSize: '14px' },

    // Detection Card Styles
    detectionCard: { background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', margin: '15px 0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f9f9f9', paddingBottom: '10px' },
    cardContent: { lineHeight: '1.6', fontSize: '14px', color: '#444' },
    critical: { backgroundColor: '#d9534f', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    high: { backgroundColor: '#f0ad4e', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    loader: { textAlign: 'center', marginTop: '50px', fontSize: '18px', color: '#666' }
};

export default SingleViewReport;