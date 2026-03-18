
import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { ShieldAlert, Activity, BarChart3, UploadCloud, PieChart, Info } from 'lucide-react';

const Analysiss = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const onFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setSelectedFiles(files);
            setData(null);
        }
    };

    const analyzeImages = async () => {
        if (selectedFiles.length === 0) return alert("Please select images first!");
        setLoading(true);

        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append('files', file);
        });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://127.0.0.1:8000/api/detect/', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setData(response.data);
        } catch (err) {
            console.error("API Error:", err);
            alert(err.response?.status === 401 ? "Please login first!" : "Connection failed.");
        } finally {
            setLoading(false);
        }
    };

    // LOGIC: Calculate aggregate stats for the Dashboard top row
    const summaryStats = useMemo(() => {
        if (!data || !data.results) return null;
        
        let totalParticles = 0;
        const typeCounts = {};
        
        data.results.forEach(res => {
            totalParticles += res.total_detections;
            res.detections.forEach(d => {
                typeCounts[d.type] = (typeCounts[d.type] || 0) + 1;
            });
        });

        const mostCommon = Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b, "N/A");

        return {
            imageCount: data.results.length,
            totalParticles,
            mostCommon: mostCommon.charAt(0).toUpperCase() + mostCommon.slice(1)
        };
    }, [data]);

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1>🌊 Marine Insight <span style={styles.badge}>AI Dashboard</span></h1>
                <p>Advanced Microplastic Detection & Ecological Risk Assessment</p>
            </header>

            {/* UPLOAD SECTION */}
            <div style={styles.uploadSection}>
                <UploadCloud size={40} style={{ color: '#0077be', marginBottom: '10px' }} />
                <br />
                <input type="file" onChange={onFileChange} style={styles.fileInput} accept="image/*" multiple />
                <p style={{ fontSize: '0.9rem', color: '#666' }}>{selectedFiles.length} images staged for analysis</p>
                <button onClick={analyzeImages} disabled={loading} style={styles.btn}>
                    {loading ? "Neural Engine Processing..." : "Start Batch Analysis"}
                </button>
            </div>

            {/* SUMMARY DASHBOARD (Only shows after analysis) */}
            {summaryStats && (
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <span style={styles.statTitle}>Images Processed</span>
                        <div style={styles.statValue}>{summaryStats.imageCount}</div>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statTitle}>Total Detections</span>
                        <div style={styles.statValue}>{summaryStats.totalParticles}</div>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statTitle}>Dominant Class</span>
                        <div style={styles.statValue}>{summaryStats.mostCommon}</div>
                    </div>
                </div>
            )}

            {/* DETAILED RESULTS PER IMAGE */}
            {data && data.results && data.results.map((result, idx) => (
                <div key={idx} style={styles.batchWrapper}>
                    <div style={styles.fileHeader}>
                        <Info size={18} />
                        <span>Source File: <strong>{result.filename}</strong></span>
                    </div>
                    
                    <div style={styles.resultsGrid}>
                        {/* Annotated Image */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}><Activity size={18} /> Neural Overlay</h3>
                            <img src={result.annotated_image} alt="Detection" style={styles.resultImg} />
                        </div>

                        {/* Graph */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}><BarChart3 size={18} /> Area Analysis</h3>
                            {result.graph_image ? (
                                <img src={result.graph_image} alt="Graph" style={styles.resultImg} />
                            ) : <p>No distribution data.</p>}
                        </div>

                        {/* Data Table */}
                        <div style={styles.tableCard}>
                            <h3 style={styles.cardTitle}><ShieldAlert size={18} /> Ecological Risk Report</h3>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Type</th>
                                        <th style={styles.th}>Area (px²)</th>
                                        
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.detections.map((item, i) => (
                                        <tr key={i} style={styles.tr}>
                                            <td style={styles.td}><strong>{item.type}</strong></td>
                                            <td style={styles.td}>{item.area.toLocaleString()}</td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.prioBadge,
                                                  
                                                }}>
                                                    {item.priority || 'MEDIUM'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const styles = {
    container: { padding: '40px 10%', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' },
    header: { textAlign: 'center', marginBottom: '40px' },
    badge: { fontSize: '0.4em', background: '#0077be', color: 'white', padding: '4px 10px', borderRadius: '4px', verticalAlign: 'middle' },
    uploadSection: { background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '40px' },
    fileInput: { marginBottom: '15px', padding: '10px' },
    btn: { background: '#0077be', color: 'white', padding: '14px 28px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' },
    
    // Dashboard Stats
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' },
    statCard: { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', textAlign: 'center', borderBottom: '4px solid #0077be' },
    statTitle: { fontSize: '0.9rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
    statValue: { fontSize: '2rem', color: '#1e293b', fontWeight: '800', marginTop: '5px' },

    // Batch Results
    batchWrapper: { marginBottom: '80px', animation: 'fadeIn 0.5s ease-in' },
    fileHeader: { background: '#1e293b', color: 'white', padding: '12px 20px', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: '10px' },
    resultsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', background: '#e2e8f0', border: '1px solid #e2e8f0', borderRadius: '0 0 8px 8px', overflow: 'hidden' },
    card: { background: 'white', padding: '20px' },
    tableCard: { gridColumn: 'span 2', background: 'white', padding: '20px', borderTop: '1px solid #e2e8f0' },
    cardTitle: { fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' },
    resultImg: { width: '100%', borderRadius: '6px', border: '1px solid #f1f5f9' },
    
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px', background: '#f8fafc', color: '#64748b', fontSize: '0.85rem' },
    td: { padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem' },
    prioBadge: { padding: '3px 10px', borderRadius: '12px', color: 'white', fontSize: '0.7rem', fontWeight: 'bold' }
};

export default Analysiss;