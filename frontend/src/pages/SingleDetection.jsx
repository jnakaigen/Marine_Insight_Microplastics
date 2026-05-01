// import React from 'react'
// import { useEffect,useState } from 'react';
// import { useParams,useNavigate } from 'react-router-dom';

// const SingleDetection = () => {
//     const[detectionData,setDetectionData]=React.useState(null);
//     const { id } = useParams();
//     const[loading,setLoading]=React.useState(true);

// useEffect(()=>{
//     const token = localStorage.getItem('token');
//     fetch(`http://127.0.0.1:8000/api/detection/${batchId}/`,
//         {
//             headers:{
//                 'Authorization':`Bearer ${token}`,
//                 'Content-Type':'application/json',

//             },

//         })
//         .then(res=>{
//             if(!res.ok){
//                 throw new Error("Network response was not ok");
//             }
//             return res.json();
//         })
//         .then(data=>{
//             setDetectionData(data);
//             setLoading(false);
//         })
//         .catch(err=>{
//             console.error("Error fetching detection data:",err);
//         })
// },[])
// if(loading){
//     return <div>Loading...</div>;
// }
// if(!detectionData){
//     return <div>No data found for this detection.</div>;
// }

//   return (
//     <div>
//       <div>
//         <h2>Detection Details</h2>
//         <p>{detectionData.filename}</p>
//          <p>{detectionData.total_detections}</p>
//         <p>{detectionData.detections}</p>
//       </div>
//     </div>
//   )
// }

// export default SingleDetection
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import './ReportPage.css';

const SingleDetection = () => {
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
        <div style={styles.container}>
            <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>

            {/* <div style={styles.headerSection}>
                <h2>File: {detectionData.filename}</h2>
                <p>Total Detections: <strong>{detectionData.total_detections}</strong></p>
            </div> */}
            <section className="section-card">
                <h2 className="section-title">Analysis Overview</h2>
                <div className="stats-overview">
                    <div className="stat-item">
                        <div className="value">{detectionData.total_detections}</div>
                        <div className="label">Total Particles Detected</div>
                    </div>
                    <div className="stat-item">
                        <div className="value">
                            {/* Check for average_area, if not exist, calculate it from details */}
                            ~{detectionData.average_area ||
                                (detectionData.detection_details?.length > 0
                                    ? Math.round(detectionData.detection_details.reduce((acc, curr) => acc + curr.area, 0) / detectionData.detection_details.length)
                                    : 0)
                            } px²
                        </div>
                        <div className="label">Average Particle Area</div>
                    </div>
                   <div className="stat-item">
            <div className="value" style={{ textTransform: 'capitalize' }}>
                {detectionData.dominant_morphology || (() => {
                    const details = detectionData.detection_details || [];
                    if (details.length === 0) return "N/A";
                    const counts = details.reduce((acc, curr) => {
                        acc[curr.type] = (acc[curr.type] || 0) + 1;
                        return acc;
                    }, {});
                    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
                })()}
            </div>
            <div className="label">Dominant Morphology</div>
        </div>
                </div>
            </section>



            {/* PARTICLE MORPHOLOGICAL SUMMARY (TABLE FORMAT FROM IMAGE) */}
            <div style={styles.tableCard}>
                <h3 style={styles.tableTitle}>Particle Morphological Summary</h3>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Class</th>
                            <th style={styles.th}>Average Area (px²)</th>
                            <th style={styles.th}>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* We use a Set to get unique types from your detection details */}
                        {[...new Set(detectionData.detection_details?.map(d => d.type))].map((type, idx) => {
                            const itemsOfType = detectionData.detection_details.filter(d => d.type === type);
                            const avgArea = itemsOfType.reduce((acc, curr) => acc + curr.area, 0) / itemsOfType.length;

                            return (
                                <tr key={idx} style={styles.tr}>
                                    <td style={styles.td}>{type.charAt(0).toUpperCase() + type.slice(1)}</td>
                                    <td style={styles.td}>~{Math.round(avgArea)}</td>
                                    <td style={styles.td}>{getRemarks(type)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* DETAILED ECOLOGICAL BREAKDOWN (CARDS) */}
            <h3>Ecological Breakdown</h3>
            {detectionData.detection_details?.map((item, index) => (
                <div key={index} style={styles.detectionCard}>

                    <div style={styles.cardContent}>
                        <p><strong>Risk:</strong> {item.risk}</p>
                        <p><strong>Trophic Impact:</strong> {item.trophic}</p>
                        <p><strong>Chemical Info:</strong> {item.chem}</p>
                        <p><strong>Area:</strong> {item.area.toLocaleString()} px²</p>
                    </div>
                </div>
            ))}
        </div>
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

export default SingleDetection;